import { useAutomation, useWeb3 } from '..';

export const useDefaultAccount = () => {
  const { web3, accountId, balance } = useWeb3();
  const automation = useAutomation();

  // TODO: Add some automation setting (on/off)
  if (automation.account) {
    return {
      web3: automation.autoWeb3,
      accountId: automation.account.address,
      isAutomatic: true,
      balance: automation.balance,
    };
  }

  return { web3, accountId, isAutomatic: false, balance };
};
