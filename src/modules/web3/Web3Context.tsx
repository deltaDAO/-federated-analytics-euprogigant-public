import WalletConnectProvider from '@walletconnect/web3-provider';
import { createContext, FC, useCallback, useContext, useEffect, useState } from 'react';
import Web3 from 'web3';
import Web3Modal, { getProviderInfo, IProviderInfo } from 'web3modal';

import { getOceanBalance } from '@/modules/ocean';

interface UserBalance {
  eth: string;
  ocean: string;
}

interface Web3ProviderValue {
  web3: Web3 | undefined;
  web3Provider: any;
  web3ProviderInfo: IProviderInfo | undefined;
  accountId: string | undefined;
  balance: UserBalance | undefined;
  chainId: number | undefined;
  block: number | undefined;
  web3Loading: boolean;
  isSupportedOceanNetwork: boolean;
  connect: () => Promise<void>;
  logout: () => Promise<void>;
}

const refreshInterval = 20000; // 20 sec.
export const supportedChainIds = [8996, 80001, 100];

const infuraId = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID;

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId,
      rpc: {
        100: 'https://rpc.genx.minimal-gaia-x.eu',
        137: 'https://polygon-rpc.com',
        80001: 'https://rpc-mumbai.maticvigil.com',
      },
    },
  },
};

export const web3ModalOpts = {
  cacheProvider: true,
  providerOptions,
};

// Context
const Web3Context = createContext({} as Web3ProviderValue);

// Helper hook to access the provider values
export const useWeb3 = (): Web3ProviderValue => useContext(Web3Context);

// Provider
export const Web3Provider: FC = ({ children }) => {
  const [web3, setWeb3] = useState<Web3>();
  const [web3Provider, setWeb3Provider] = useState<any>();
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>();
  const [web3ProviderInfo, setWeb3ProviderInfo] = useState<IProviderInfo>();
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
    if (!web3Modal) {
      setWeb3Loading(false);
      return;
    }
    try {
      setWeb3Loading(true);
      console.log('[web3] Connecting Web3...');

      const provider = await web3Modal.connect();
      setWeb3Provider(provider);

      const web3 = new Web3(provider);
      setWeb3(web3);
      console.log('[web3] Web3 created.', web3);

      const chainId = await web3.eth.getChainId();
      setChainId(chainId);
      console.log('[web3] chain id', chainId);

      const accountId = (await web3.eth.getAccounts())[0];
      setAccountId(web3.utils.toChecksumAddress(accountId));
      console.log('[web3] account id', accountId);
    } catch (error) {
      console.error('[web3] Error: ', error);
      await web3Modal?.clearCachedProvider();
    } finally {
      setWeb3Loading(false);
    }
  }, [web3Modal]);

  // -----------------------------------
  // Helper: Get user balance
  // -----------------------------------
  // TODO: In latest version of ocean the list of approvedBasedTokens and check balance for all
  const getUserBalance = useCallback(async () => {
    if (!accountId || !chainId || !web3) return;

    try {
      const balance = {
        eth: web3.utils.fromWei(await web3.eth.getBalance(accountId, 'latest')),
        ocean: await getOceanBalance(accountId, chainId, web3),
      };
      setBalance(balance);
      // console.log('[web3] Balance: ', balance);
    } catch (error) {
      console.error('[web3] Error: ', error);
    }
  }, [accountId, chainId, web3]);

  // -----------------------------------
  // Create initial Web3Modal instance
  // -----------------------------------
  useEffect(() => {
    if (web3Modal) {
      setWeb3Loading(false);
      return;
    }

    async function init() {
      // note: needs artificial await here so the log message is reached and output
      const web3ModalInstance = await new Web3Modal(web3ModalOpts);
      setWeb3Modal(web3ModalInstance);
      console.log('[web3] Web3Modal instance created.', web3ModalInstance);
    }
    init();
  }, [connect, web3Modal]);

  // -----------------------------------
  // Reconnect automatically for returning users
  // -----------------------------------
  useEffect(() => {
    async function connectCached() {
      if (!web3Modal || !web3Modal.cachedProvider) return;
      console.log('[web3] Connecting to cached provider: ', web3Modal.cachedProvider);
      await connect();
    }

    connectCached();
  }, [connect, web3Modal]);

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
  // Get and set web3 provider info
  // -----------------------------------
  // Workaround cause getInjectedProviderName() always returns `MetaMask`
  // https://github.com/oceanprotocol/market/issues/332
  useEffect(() => {
    if (!web3Provider) return;

    const providerInfo = getProviderInfo(web3Provider);
    setWeb3ProviderInfo(providerInfo);
  }, [web3Provider]);

  // -----------------------------------
  // Logout helper
  // -----------------------------------
  async function logout() {
    if ((web3?.currentProvider as any)?.close) {
      await (web3?.currentProvider as any).close();
    }

    await web3Modal?.clearCachedProvider();
  }

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

  return (
    <Web3Context.Provider
      value={{
        web3,
        web3Provider,
        web3ProviderInfo,
        accountId,
        balance,
        chainId,
        block,
        web3Loading,
        isSupportedOceanNetwork,
        connect,
        logout,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
