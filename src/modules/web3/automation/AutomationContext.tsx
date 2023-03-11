import { LoggerInstance } from '@oceanprotocol/lib';
import { createContext, FC, useCallback, useContext, useEffect, useState } from 'react';
import { euroeTokenDetails } from 'supportedTokens.config';
import Web3 from 'web3';

import { readFeltAutoKey, removeFeltAutoKey, writeFeltAutoKey } from '../../jobs/storage';
import { getNodeWeb3, getOceanBalance } from '../../ocean';
import { getTokenBalance } from '../utils/getTokenBalance';
import { useWeb3 } from '../Web3Context';
import { AutomationAccount, AutomationBalance, AutomationValues } from './Automation.types';

// Refresh interval for balance retrieve - 20 sec
const refreshInterval = 20000;

// Context
const AutomationContext = createContext({} as AutomationValues);

// useContext
export const useAutomation = (): AutomationValues => useContext(AutomationContext);

// Provider
export const AutomationProvider: FC = ({ children }) => {
  const { web3, chainId, accountId } = useWeb3();

  const [autoWeb3, setAutoWeb3] = useState<Web3>();

  const [account, setAccount] = useState<AutomationAccount>();
  const [balance, setBalance] = useState<AutomationBalance | undefined>({
    eth: '0',
    ocean: '0',
    euroe: '0',
  });

  useEffect(() => {
    async function getWeb3() {
      if (!chainId) {
        setAutoWeb3(undefined);
        return;
      }

      // Direct web3 to RPC node. We can add account to make it send transactions
      const newWeb3 = getNodeWeb3(chainId);

      if (account) {
        newWeb3.eth.accounts.wallet.add(account);
      }

      setAutoWeb3(newWeb3);
    }
    getWeb3();
  }, [chainId, account]);

  /**
   * Helper: Delete automatic account
   */
  const removeAutomationAccount = () => {
    removeFeltAutoKey();
    setAccount(undefined);
    setBalance(undefined);
  };

  // TODO: Add auto load on account load???
  /**
   * Helper: Create new automatic account
   */
  const createAutomationAccount = useCallback(async () => {
    if (!web3 || !accountId) return;

    let signMessage = readFeltAutoKey();
    // TODO: use the same principle as the SIWE login
    if (!signMessage) {
      signMessage = JSON.stringify(
        {
          domain: window.location.host,
          address: accountId,
          statement: 'Sing for FELT automation key',
          uri: window.location.origin,
          version: '1',
          timestamp: Date.now(),
          nonce: web3.utils.randomHex(32),
        },
        null,
        4
      );
      writeFeltAutoKey(signMessage);
    }

    try {
      const signature = await web3.eth.personal.sign(signMessage, accountId, '');
      const hash = web3.utils.sha3(signature);
      if (!hash) {
        throw new Error('Failed to create hash for key seed.');
      }

      const account = web3.eth.accounts.privateKeyToAccount(hash);
      web3.eth.accounts.wallet.add(account);

      setAccount({
        address: account.address,
        privateKey: account.privateKey,
      });
    } catch (error: any) {
      console.log('Failed to create automation key: ', error);
    }
  }, [web3, accountId]);

  /**
   * Helper: Get balance
   */
  const getBalance = useCallback(async () => {
    if (!web3 || !chainId || !account) return;

    try {
      const balance = {
        eth: web3.utils.fromWei(await web3.eth.getBalance(account.address, 'latest')),
        ocean: await getOceanBalance(account.address, chainId, web3),
        euroe: await getTokenBalance(account.address, euroeTokenDetails.decimals, euroeTokenDetails.address, web3),
      };
      setBalance(balance);

      return balance;
    } catch (error: any) {
      LoggerInstance.error('[web3] Error: ', error.message);
    }
  }, [account, chainId, web3]);

  /**
   * Get balance of automatic account
   */
  useEffect(() => {
    getBalance();

    // init periodic refresh of wallet balance
    const balanceInterval = setInterval(() => getBalance(), refreshInterval);

    return () => {
      clearInterval(balanceInterval);
    };
  }, [getBalance]);

  return (
    <AutomationContext.Provider
      value={{
        account,
        balance,
        autoWeb3,
        getBalance,
        createAutomationAccount,
        removeAutomationAccount,
      }}
    >
      {children}
    </AutomationContext.Provider>
  );
};
