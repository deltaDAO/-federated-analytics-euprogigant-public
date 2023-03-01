/* eslint-disable camelcase */

export const getQuery = (queryString: string) => {
  if (!queryString) return {};

  return {
    must: [
      {
        bool: {
          should: [
            {
              query_string: {
                query: `${queryString}`,
                fields: [
                  'id',
                  'nft.owner',
                  'datatokens.address',
                  'datatokens.name',
                  'datatokens.symbol',
                  'metadata.name^10',
                  'metadata.author',
                  'metadata.description',
                  'metadata.tags',
                ],
                minimum_should_match: '2<75%',
                phrase_slop: 2,
                boost: 5,
              },
            },
            {
              query_string: {
                query: `${queryString}*`,
                fields: [
                  'id',
                  'nft.owner',
                  'datatokens.address',
                  'datatokens.name',
                  'datatokens.symbol',
                  'metadata.name^10',
                  'metadata.author',
                  'metadata.description',
                  'metadata.tags',
                ],
                boost: 5,
                lenient: true,
              },
            },
            { match_phrase: { content: { query: queryString, boost: 10 } } },
            {
              query_string: {
                query: `*${queryString}*`,
                fields: [
                  'id',
                  'nft.owner',
                  'datatokens.address',
                  'datatokens.name',
                  'datatokens.symbol',
                  'metadata.name^10',
                  'metadata.author',
                  'metadata.description',
                  'metadata.tags',
                ],
                default_operator: 'AND',
              },
            },
          ],
        },
      },
    ],
  };
};
