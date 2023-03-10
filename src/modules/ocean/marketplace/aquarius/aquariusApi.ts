import { Asset, Config } from '@oceanprotocol/lib';

import { AssetExtended } from '../../asset';
import { useOceanConfig } from '../../config';
import { getQuery } from './utils';

import { whitelist } from '@artifacts/datasets.json';

/* eslint-disable camelcase */

class AquariusApi {
  private static defaultUrl = 'https://v4.aquarius.oceanprotocol.com';
  private baseUrl: string;
  private chainId: string | number;

  constructor(oceanConfig: Config) {
    this.baseUrl = oceanConfig.metadataCacheUri || AquariusApi.defaultUrl;
    this.chainId = oceanConfig.chainId;
  }

  getStatus = () => {
    return fetch(this.baseUrl).then((response) => response.json());
  };

  getDatasets = (
    queryString = '',
    options: {
      sortType?: '_score' | 'nft.created' | 'stats.orders' | 'stats.allocated' | 'stats.price.value';
      sortOrder?: 'asc' | 'desc';
      limit?: number;
    }
  ): Promise<Asset[]> => {
    const endpoint = '/api/aquarius/assets/query';

    const { sortType = '_score', sortOrder = 'desc', limit = 21 } = options;

    return fetch(new URL(endpoint, this.baseUrl).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: {
          bool: {
            ...getQuery(queryString),
            filter: [
              { term: { _index: this.chainId === 100 ? 'oceanv4' : 'aquarius' } },
              { term: { 'metadata.type': 'dataset' } },
              { terms: { chainId: [1, 137, this.chainId] } },
              { term: { 'purgatory.state': false } },
              //{ bool: { must_not: [{ term: { 'nft.state': 5 } }] } },
              { term: { 'nft.state': 0 } }, // must be active state
              { term: { 'services.type': 'compute' } },
              { terms: { _id: whitelist } },
            ],
          },
        },
        size: limit,
        sort: {
          [sortType]: sortOrder,
        },
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        return json.hits.hits.map((hit: any) => hit._source);
      });
  };

  getDatasetDetail = (did: string): Promise<AssetExtended> => {
    const endpoint = `/api/aquarius/assets/ddo/${did}`;
    return fetch(new URL(endpoint, this.baseUrl).toString()).then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('DID not found');
    });
  };
}

export const getAquariusApi = (config: Config) => new AquariusApi(config);

export const useAquariusApi = () => {
  const config = useOceanConfig();

  return new AquariusApi(config);
};
