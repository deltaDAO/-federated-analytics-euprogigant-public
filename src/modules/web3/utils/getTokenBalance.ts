import Web3 from 'web3';

export type AbiType = 'function' | 'constructor' | 'event' | 'fallback' | 'receive';
export type StateMutabilityType = 'pure' | 'view' | 'nonpayable' | 'payable';

interface AbiInput {
  name: string;
  type: string;
  indexed?: boolean;
  components?: AbiInput[];
  internalType?: string;
}

interface AbiOutput {
  name: string;
  type: string;
  components?: AbiOutput[];
  internalType?: string;
}

interface AbiItem {
  anonymous?: boolean;
  constant?: boolean;
  inputs?: AbiInput[];
  name?: string;
  outputs?: AbiOutput[];
  payable?: boolean;
  stateMutability?: StateMutabilityType;
  type: AbiType;
  gas?: number;
}

export const getTokenBalance = async (
  accountId: string,
  decimals: number,
  tokenAddress: string,
  web3: Web3
): Promise<string> => {
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
    const token = new web3.eth.Contract(minABI, tokenAddress, {
      from: accountId,
    });
    const balance = await token.methods.balanceOf(accountId).call();
    const adjustedDecimalsBalance = `${balance}${'0'.repeat(18 - decimals)}`;
    return web3.utils.fromWei(adjustedDecimalsBalance);
  } catch (e) {
    console.error(e);
    return '0';
  }
};
