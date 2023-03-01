import { Badge, Button, Card, Group, Loader, Text } from '@mantine/core';
import { IconDatabaseImport } from '@tabler/icons-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';
import { FC } from 'react';
import { useQuery } from 'react-query';

import { LinkText, Markdown } from '@/modules/common';
import { marketplaceUrl, useAquariusApi } from '@/modules/ocean/marketplace';

dayjs.extend(relativeTime);

export interface DatasetDetailContainerProps {
  did: string;
  showActionButtons?: boolean;
}

export const DatasetDetailContainer: FC<DatasetDetailContainerProps> = ({ did, showActionButtons = true }) => {
  const aquariusApi = useAquariusApi();

  const { isLoading, data: asset } = useQuery(['asset', did, aquariusApi], () => aquariusApi.getDatasetDetail(did));

  if (!asset) {
    return null;
  }
  if (isLoading) {
    return <Loader />;
  }

  const { name, type, description, author, links, tags, updated, created } = asset.metadata;
  const { datatokens } = asset;
  // const isCompute = Boolean(getServiceByName(asset, 'compute'));
  // const accessType = isCompute ? 'compute' : 'access';
  const { owner } = asset.nft;
  const { orders, allocated, price } = asset.stats;
  const isUnsupportedPricing =
    !asset.services.length ||
    asset?.stats?.price?.value === undefined ||
    asset?.accessDetails?.type === 'NOT_SUPPORTED';

  return (
    <Card
      shadow="sm"
      p="lg"
      radius="sm"
      withBorder
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-out',
      }}
    >
      <Text size="sm" color="dimmed">
        {type.toUpperCase()} | {datatokens[0]?.symbol.substring(0, 9)} | {asset.chainId}
      </Text>

      <Group position="apart" sx={{ flexWrap: 'nowrap' }}>
        <Text weight={500} size="md" sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {name}
        </Text>
      </Group>

      <Group position="apart" sx={{ flexWrap: 'nowrap' }}>
        <Badge color="gray" radius="sm">
          {owner}
        </Badge>
      </Group>
      <Text size="sm" color="dimmed">
        <Markdown text={description} />
      </Text>
      <Text
        size="sm"
        color="dimmed"
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
      >
        <div>
          {isUnsupportedPricing ? (
            <strong>No pricing schema available</strong>
          ) : (
            `${price.value || 'Free'} ${price.tokenSymbol || ''}`
          )}
        </div>
        {allocated && allocated > 0 ? (
          <span>
            {allocated < 0 ? (
              ''
            ) : (
              <>
                <strong>{allocated}</strong> veOCEAN
              </>
            )}
          </span>
        ) : null}
        {orders && orders > 0 ? (
          <span>
            {orders < 0 ? (
              'N/A'
            ) : (
              <>
                <strong>{orders}</strong> {orders === 1 ? 'sale' : 'sales'}
              </>
            )}
          </span>
        ) : null}
        <br />
        {links && links[0] && <LinkText href={links[0]} text="Download Sample" />}
        <span>
          <b>Author:</b> {author}
        </span>
        <span>
          <b>Owner:</b> <LinkText href={`${marketplaceUrl}/profile/${asset.nft.owner}`} text={asset.nft.owner} />
        </span>
        <span>
          <b>DID:</b> {did}
        </span>
        <span>
          <b>Created:</b> {dayjs(created).fromNow()}
        </span>
        <span>
          <b>Updated:</b> {dayjs(updated).fromNow()}
        </span>
        <br />
        {tags && tags.filter((t) => t !== '').length > 0 && (
          <div>
            <Text size="lg" weight={700}>
              Tags
            </Text>
            {tags
              .filter((t) => t !== '')
              .map((tag) => (
                <Badge key={tag} variant="outline" style={{ margin: 4 }}>
                  {tag}
                </Badge>
              ))}
          </div>
        )}
      </Text>
    </Card>
  );
};
