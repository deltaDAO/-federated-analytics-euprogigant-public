import { refocusExchange } from '@urql/exchange-refocus';
import { createClient, dedupExchange, fetchExchange, OperationContext, TypedDocumentNode } from 'urql';

import { getOceanConfig } from '../../config/oceanConfig';

function getSubgraphUri(chainId: number): string {
  const config = getOceanConfig(chainId);

  return config.subgraphUri;
}

function createUrqlClient() {
  const client = createClient({
    url: `${getSubgraphUri(1)}/subgraphs/name/oceanprotocol/ocean-subgraph`,
    exchanges: [dedupExchange, refocusExchange(), fetchExchange],
  });

  return client;
}

export function getQueryContext(chainId: number): OperationContext {
  const queryContext: OperationContext = {
    url: `${getSubgraphUri(Number(chainId))}/subgraphs/name/oceanprotocol/ocean-subgraph`,
    requestPolicy: 'network-only',
  };

  return queryContext;
}

export async function fetchData(query: TypedDocumentNode, variables: any, context: OperationContext): Promise<any> {
  try {
    const client = createUrqlClient();

    const response = await client.query(query, variables, context).toPromise();
    return response;
  } catch (error) {
    console.error('Error fetchData: ', (error as Error).message);
  }
  return null;
}
