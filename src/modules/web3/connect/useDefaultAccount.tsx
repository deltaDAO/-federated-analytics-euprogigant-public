import { useWeb3 } from '..';

export const useDefaultAccount = () => {
  const { accountId, balance } = useWeb3();

  return { accountId, isAutomatic: false, balance };
};
