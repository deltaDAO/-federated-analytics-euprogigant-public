import { LoggerInstance } from '@oceanprotocol/lib';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils/types';

import { getOceanConfig } from './config/oceanConfig';

export async function getOceanBalance(accountId: string, networkId: number, web3: Web3): Promise<string> {
  const minABI = [
    {
      constant: true,
      inputs: [
        {
          name: '_owner',
          type: 'address',
        },
      ],
      name: 'balanceOf',
      outputs: [
        {
          name: 'balance',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
  ] as AbiItem[];

  try {
    const token = new web3.eth.Contract(minABI, getOceanConfig(networkId).oceanTokenAddress, { from: accountId });
    const result = web3.utils.fromWei(await token.methods.balanceOf(accountId).call());

    return result;
  } catch (e: any) {
    LoggerInstance.error(`ERROR: get the balance: ${e.message}`);

    return '';
  }
}
