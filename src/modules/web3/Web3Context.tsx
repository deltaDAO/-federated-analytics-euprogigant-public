import detectEthereumProvider from '@metamask/detect-provider';
import { LoggerInstance } from '@oceanprotocol/lib';
import { createContext, FC, useCallback, useContext, useEffect, useState } from 'react';
import Web3 from 'web3';

import { getOceanBalance } from '@/modules/ocean';

declare let window: any;

interface UserBalance {
  eth: string;
  ocean: string;
}

interface Web3ProviderValue {
  web3: Web3 | undefined;
  web3Provider: any;
  accountId: string | undefined;
  balance: UserBalance | undefined;
  chainId: number | undefined;
  block: number | undefined;
  web3Loading: boolean;
  isSupportedOceanNetwork: boolean;
  connect: () => Promise<void>;
}

const refreshInterval = 20000; // 20 sec.
export const supportedChainIds = [100];

// Context
const Web3Context = createContext({} as Web3ProviderValue);

// Helper hook to access the provider values
export const useWeb3 = (): Web3ProviderValue => useContext(Web3Context);

// Provider
export const Web3Provider: FC = ({ children }) => {
  const [web3, setWeb3] = useState<Web3>();
  const [web3Provider, setWeb3Provider] = useState<any>();
  const [chainId, setChainId] = useState<number>();
  const [block, setBlock] = useState<number>();
  const [accountId, setAccountId] = useState<string>();
  const [web3Loading, setWeb3Loading] = useState<boolean>(true);
  const [balance, setBalance] = useState<UserBalance>({
    eth: '0',
    ocean: '0',
  });
  const [isSupportedOceanNetwork, setIsSupportedOceanNetwork] = useState(false);

  // -----------------------------------
  // Helper: connect to web3
  // -----------------------------------
  const connect = useCallback(async () => {
    try {
      setWeb3Loading(true);
      console.log('[web3] Connecting Web3...');

      const { ethereum } = window;

      if (!ethereum) {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');

        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log('[web3] Metamask connected with accounts', accounts);

      const web3 = new Web3(ethereum);
      setWeb3(web3);
      console.log('[web3] Web3 created.', web3);

      const chainId = await web3.eth.getChainId();
      setChainId(chainId);
      console.log('[web3] chain id', chainId);

      const accountId = (await web3.eth.getAccounts())[0];
      setAccountId(web3.utils.toChecksumAddress(accountId));
      console.log('[web3] account id', accountId);
    } catch (error) {
      console.log('[web3] Error: ', error);
    } finally {
      setWeb3Loading(false);
    }
  }, []);

  // -----------------------------------
  // Helper: Get user balance
  // -----------------------------------
  const getUserBalance = useCallback(async () => {
    if (!accountId || !chainId || !web3) return;

    try {
      const balance = {
        eth: web3.utils.fromWei(await web3.eth.getBalance(accountId, 'latest')),
        ocean: await getOceanBalance(accountId, chainId, web3),
      };
      setBalance(balance);
      // console.log("[web3] Balance: ", balance);
    } catch (error: any) {
      LoggerInstance.error('[web3] Error: ', error.message);
    }
  }, [accountId, chainId, web3]);

  // -----------------------------------
  // Get and set user balance
  // -----------------------------------
  useEffect(() => {
    getUserBalance();

    // init periodic refresh of wallet balance
    const balanceInterval = setInterval(() => getUserBalance(), refreshInterval);

    return () => {
      clearInterval(balanceInterval);
    };
  }, [getUserBalance]);

  // -----------------------------------
  // Get and set latest head block
  // -----------------------------------
  useEffect(() => {
    async function getBlock() {
      if (!web3) return;

      const block = await web3.eth.getBlockNumber();
      setBlock(block);
      console.log('[web3] Head block: ', block);
    }
    getBlock();
  }, [web3, chainId]);

  // -----------------------------------
  // Get valid Networks and set isSupportedOceanNetwork
  // -----------------------------------
  useEffect(() => {
    if (chainId && supportedChainIds.includes(chainId)) {
      setIsSupportedOceanNetwork(true);
    } else {
      setIsSupportedOceanNetwork(false);
    }
  }, [chainId]);

  // -----------------------------------
  // Handle change events
  // -----------------------------------
  useEffect(() => {
    if (!web3Provider) return;

    async function handleChainChanged(chainId: string) {
      console.log('[web3] Chain changed', chainId);
      setChainId(Number(chainId));
    }

    async function handleAccountsChanged(accounts: string[]) {
      const accountId = Web3.utils.toChecksumAddress(accounts[0]);
      console.log('[web3] Account changed', accountId);
      setAccountId(accountId);
    }

    web3Provider.on('chainChanged', handleChainChanged);
    web3Provider.on('accountsChanged', handleAccountsChanged);

    return () => {
      web3Provider.removeListener('chainChanged', handleChainChanged);
      web3Provider.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [web3Provider]);

  // -----------------------------------
  // Detect provider - window.ethereum
  // -----------------------------------
  useEffect(() => {
    detectEthereumProvider().then((provider) => {
      if (!provider) console.log('Please install MetaMask!');
      setWeb3Provider(provider);
    });
  }, []);

  return (
    <Web3Context.Provider
      value={{
        web3,
        web3Provider,
        accountId,
        balance,
        chainId,
        block,
        web3Loading,
        isSupportedOceanNetwork,
        connect,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
