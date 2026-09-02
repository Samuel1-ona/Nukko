import { useState, useRef, useCallback, useEffect } from 'react';
import { encodeFunctionData } from 'viem';
import { publicClient } from '../blockchain/config.js';
import { STABLECOINS, ERC20_ABI, POWERUP_PACKAGES, TREASURY, priceWei } from '../blockchain/tokens.js';
import { withAttribution } from '../blockchain/attribution.js';
import { isMiniPay, miniPaySend } from '../utils/miniPay.js';
import { buildPaymentDiagnostic } from '../utils/paymentDiagnostics.js';
import { useBalances } from './useBalances.js';
import { getInventory, updateInventory, recordPurchase } from '../supabase/db.js';

const DEFAULT_INV = { free_bombs_left: 3, free_expands_left: 3, paid_bombs: 0, paid_expands: 0 };

export function usePowerUps(walletClient, address) {
  const [inv,           setInv]           = useState(DEFAULT_INV);
  const [loading,       setLoading]       = useState(false);
  const [selectedToken, setSelectedToken] = useState('USDm');

  const walletRef   = useRef(walletClient);
  useEffect(() => { walletRef.current = walletClient; }, [walletClient]);
  const isPayingRef = useRef(false);

  const { balances, richestToken, refresh: refreshBalances } = useBalances(address);

  // Load inventory from Supabase when address changes
  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    getInventory(address)
      .then(data => { if (!cancelled) setInv(data); })
      .catch(err => console.error('Failed to load inventory:', err));
    return () => { cancelled = true; };
  }, [address]);

  useEffect(() => { setSelectedToken(richestToken); }, [richestToken]);

  const totalBombs   = inv.free_bombs_left + inv.paid_bombs;
  const totalExpands = inv.free_expands_left + inv.paid_expands;

  const consumeBomb = useCallback(() => {
    if (!address || totalBombs <= 0) return false;
    const next = { ...inv };
    if (next.free_bombs_left > 0) next.free_bombs_left--;
    else next.paid_bombs--;
    setInv(next);
    updateInventory(address, {
      free_bombs_left: next.free_bombs_left,
      paid_bombs:      next.paid_bombs,
    }).catch(err => console.error('Failed to sync inventory:', err));
    return true;
  }, [address, totalBombs, inv]);

  const consumeExpand = useCallback(() => {
    if (!address || totalExpands <= 0) return false;
    const next = { ...inv };
    if (next.free_expands_left > 0) next.free_expands_left--;
    else next.paid_expands--;
    setInv(next);
    updateInventory(address, {
      free_expands_left: next.free_expands_left,
      paid_expands:      next.paid_expands,
    }).catch(err => console.error('Failed to sync inventory:', err));
    return true;
  }, [address, totalExpands, inv]);

  const buyPowerUp = useCallback(async (type, pkgIdx, tokenKey) => {
    if (!address || isPayingRef.current) return;
    isPayingRef.current = true;
    setLoading(true);

    const key = tokenKey ?? selectedToken;
    const pkg = POWERUP_PACKAGES[pkgIdx];
    const diagnosticContext = {
      phase: 'prepare-payment',
      wallet: address,
      itemType: type,
      packageIndex: pkgIdx,
      tokenKey: key,
      amountUsd: pkg?.priceUSD,
      treasury: TREASURY,
      gas: '0x493E0',
    };

    try {
      const token = STABLECOINS[key];
      const cost  = priceWei(pkg.priceUSD, token.decimals);
      const data  = encodeFunctionData({
        abi:          ERC20_ABI,
        functionName: 'transfer',
        args:         [TREASURY, cost],
      });
      // Append the ERC-8021 attribution suffix so the transfer is credited to
      // Nukko. Trailing bytes don't affect the ERC-20 transfer's execution.
      const taggedData = withAttribution(data);
      Object.assign(diagnosticContext, {
        phase: 'build-transfer-calldata',
        tokenAddress: token.address,
        transactionTo: token.address,
        rawAmount: cost,
        selector: data.slice(0, 10),
      });

      let txHash;
      if (isMiniPay()) {
        // Bypass viem's Celo fee preparation, but keep Celo's feeCurrency
        // field so MiniPay can route USDC/USDT through their adapter addresses.
        diagnosticContext.phase = 'eth_sendTransaction';
        Object.assign(diagnosticContext, {
          feeCurrency: token.feeCurrency,
        });
        txHash = await miniPaySend(token.address, taggedData, '0x493E0', token.feeCurrency);
        diagnosticContext.txHash = txHash;
      } else {
        if (!walletRef.current) throw new Error('Wallet not connected');
        diagnosticContext.phase = 'walletClient.sendTransaction';
        txHash = await walletRef.current.sendTransaction({
          to:      token.address,
          data:    taggedData,
          account: address,   // explicit: a client built without one throws AccountNotFoundError
        });
        diagnosticContext.txHash = txHash;
      }

      if (!txHash) throw new Error('Transaction hash unavailable — purchase may not have gone through');

      // Only an explicit on-chain revert withholds the items; a receipt-polling
      // failure after a broadcast tx still credits them (the player paid).
      let reverted = false;
      if (publicClient) {
        try {
          const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
          reverted = receipt.status === 'reverted';
        } catch (waitErr) {
          console.warn('Receipt polling failed after power-up tx was sent — crediting items:', waitErr);
        }
      }
      if (reverted) {
        throw new Error('Payment failed on-chain — you were not charged');
      }

      const next = { ...inv };
      if (type === 'bomb')   next.paid_bombs   += pkg.qty;
      if (type === 'expand') next.paid_expands += pkg.qty;
      setInv(next);

      refreshBalances();

      // Persist inventory + log the confirmed purchase (permanent receipt) —
      // non-blocking, same as Blokaz's logPurchase
      updateInventory(address, {
        paid_bombs:   next.paid_bombs,
        paid_expands: next.paid_expands,
      }).catch(err => console.error('Failed to sync inventory:', err));

      recordPurchase({
        walletAddress: address,
        txHash,
        itemType:      type,
        packageIndex:  pkgIdx,
        token:         key,
        amount:        pkg.priceUSD,
      }).catch(err => console.error('Failed to record purchase:', err));

      return pkg.qty;
    } catch (err) {
      const details = buildPaymentDiagnostic(err, diagnosticContext);
      console.error('Power-up tx diagnostic:', details.diagnostic, err);
      const wrapped = new Error(details.shortMessage);
      wrapped.diagnostic = details.diagnostic;
      wrapped.code = details.code;
      throw wrapped;
    } finally {
      isPayingRef.current = false;
      setLoading(false);
    }
  }, [address, selectedToken, balances, refreshBalances, inv]);

  return {
    totalBombs,
    totalExpands,
    freeBombsLeft:   inv.free_bombs_left,
    freeExpandsLeft: inv.free_expands_left,
    consumeBomb,
    consumeExpand,
    buyPowerUp,
    powerUpPackages: POWERUP_PACKAGES,
    balances,
    selectedToken,
    setSelectedToken,
    loading,
  };
}
