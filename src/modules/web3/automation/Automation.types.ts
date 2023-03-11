import Web3 from 'web3';

export interface AutomationBalance {
  eth: string;
  ocean: string;
  euroe: string;
}

export interface AutomationAccount {
  address: string;
  privateKey: string;
}

/**
 * @interface AutomationValues
 * Type of temporarily account used for automating transactions
 * @prop {Account} account - account describing the automatic account
 * @prop {UserBalance} account - eth and ocean balance of automatic account
 * @prop {} createAutomationAccount function for creating automation account
 */
export interface AutomationValues {
  account?: AutomationAccount;
  balance?: AutomationBalance;
  autoWeb3?: Web3;
  getBalance: () => Promise<AutomationBalance | undefined>;
  createAutomationAccount: () => Promise<void>;
  removeAutomationAccount: () => void;
}
