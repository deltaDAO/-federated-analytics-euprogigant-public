import { Badge, Card, Group, Modal, Text } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { Asset } from '@oceanprotocol/lib';
import { IconCheck } from '@tabler/icons-react';
import Link from 'next/link';
import { FC, MouseEvent, useState } from 'react';

import { shortenAddress } from '@/modules/web3';
import { AssetPricing } from '../../AssetPricing';
import { DatasetDetailContainer } from '../DatasetDetailContainer';

export interface DatasetPreviewProps {
  asset: Asset;
  assetSelection?: {
    isSelected: boolean;
    onSelect: () => void;
    isDisabled?: boolean;
  };
  opensLinkInModal: boolean;
}

export function getServiceByName(ddo: Asset, name: 'access' | 'compute'): any {
  if (!ddo) return;

  const service = ddo.services.filter((service) => service.type === name)[0];
  return service;
}

export const DatasetPreview: FC<DatasetPreviewProps> = ({ asset, assetSelection, opensLinkInModal }) => {
  const { hovered, ref } = useHover();
  const [detailOpenedInModal, setDetailOpenedInModal] = useState<boolean>(false);

  if (!asset || !asset.metadata) return null;

  const { name, type, description } = asset.metadata;
  const { datatokens } = asset;
  // const isCompute = Boolean(getServiceByName(asset, 'compute'));
  // const accessType = isCompute ? 'compute' : 'access';
  const { owner } = asset.nft;
  const { orders, allocated } = asset.stats;

  //const isUnsupportedPricing = !asset.services.length || asset?.stats?.price?.value === undefined;

  return (
    <>
      {opensLinkInModal && (
        <Modal
          size="xl"
          centered
          opened={detailOpenedInModal}
          onClose={() => setDetailOpenedInModal(false)}
          withCloseButton={false}
        >
          <DatasetDetailContainer did={asset.id} showActionButtons={false} />
        </Modal>
      )}
      <Link href={`/asset/${asset.id}`} passHref>
        <Card
          ref={ref as any}
          shadow={hovered ? 'sm' : 'xs'}
          p="lg"
          radius="sm"
          withBorder
          component="a"
          onClick={(event: MouseEvent) => {
            if (assetSelection) {
              event.preventDefault();
              setDetailOpenedInModal(true);
            }
          }}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease-out',
            '&:hover': { transform: 'translateY(-2px)' },
          }}
        >
          {assetSelection && (
            <Card.Section
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                event.stopPropagation();
                assetSelection.onSelect();
              }}
              component="button"
              disabled={!assetSelection.isSelected && assetSelection.isDisabled}
              m={0}
              mb="xs"
              mx={-20}
              sx={(theme) => ({
                minHeight: 36,
                width: 'calc(100% + 40px)',
                border: 'none',
                cursor: 'pointer',
                background: assetSelection.isSelected ? theme.colors.blue[6] : '#f3f3f3',
                color: assetSelection.isSelected ? '#fff' : 'inherit',
                transition: '0.3s background, color',
                '&:hover': { background: '#6492f7', color: '#fff' },
                ...(assetSelection.isDisabled && !assetSelection.isSelected
                  ? { '&:hover': {}, background: '#eee', cursor: 'default', color: 'ccc' }
                  : {}),
              })}
            >
              <IconCheck />
            </Card.Section>
          )}
          <Text size="sm" color="dimmed">
            {type.toUpperCase()} | {datatokens[0]?.symbol.substring(0, 9)} | {asset.chainId}
          </Text>

          <Group position="apart" sx={{ flexWrap: 'nowrap' }}>
            <Text weight={500} size="md" sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {name.slice(0, 200)}
            </Text>
            <Badge color="gray" radius="sm">
              {shortenAddress(owner)}
            </Badge>
          </Group>

          <Text size="sm" color="dimmed">
            {description?.substring(0, 100) || ''}
          </Text>
          <Text
            size="sm"
            color="dimmed"
            sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
          >
            <AssetPricing asset={asset} />
            <footer>
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
            </footer>
          </Text>
        </Card>
      </Link>
    </>
  );
};
