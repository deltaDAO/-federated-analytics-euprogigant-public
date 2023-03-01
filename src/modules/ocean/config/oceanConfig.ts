import { Config, ConfigHelper } from '@oceanprotocol/lib';

const genxConfig: Config = {
  chainId: 100,
  network: 'genx',
  oceanTokenSymbol: 'OCEAN',
  startBlock: 1247152,
  transactionBlockTimeout: 100,
  transactionConfirmationBlocks: 1,
  transactionPollingTimeout: 750,
  gasFeeMultiplier: 1,
  nodeUri: 'https://rpc.genx.minimal-gaia-x.eu',
  providerUri: 'https://provider.v4.genx.delta-dao.com',
  subgraphUri: 'https://subgraph.v4.genx.minimal-gaia-x.eu',
  explorerUri: 'https://logging.genx.minimal-gaia-x.eu',
  metadataCacheUri: 'https://aquarius.v4.delta-dao.com',
  oceanTokenAddress: '0x0995527d3473b3a98c471f1ed8787acd77fbf009',
  opfCommunityFeeCollector: '0x2e0C9e15A45c9884F7768BB852E7399B9153525d',
  // Router: '0x7A3C9F0729AB93e4F9945221168A56eCf450187D',
  fixedRateExchangeAddress: '0xAD8E7d2aFf5F5ae7c2645a52110851914eE6664b',
  sideStakingAddress: '0xE5517D71C61537e7693630f60Bd9E09f1215479a',
  // ERC20Template: {
  //   1: "0x0301E8676e8bCa960dc95b8bd93D6AAf0B2F1020",
  //   2: "0xB3a2c32925b730348bb5177b1F8fBD1Ac90eBe63",
  // },
  // ERC721Template: { 1: "0x9F13dE57BCf7462E6124b99C62a9F2CBc7860600" },
  dispenserAddress: '0x94cb8FC8719Ed09bE3D9c696d2037EA95ef68d3e',
  nftFactoryAddress: '0x6cb85858183B82154921f68b434299EC4281da53',
};

export function getOceanConfig(network: string | number): Config {
  if (network === 'genx' || network === 100) {
    return genxConfig;
  }

  const config = new ConfigHelper().getConfig(network);

  return config;
}
