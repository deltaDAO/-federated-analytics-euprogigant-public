import { Asset } from '@oceanprotocol/lib';
import { FC, useEffect, useState } from 'react';
import { getAccessDetails } from '../marketplace';
import { TokenInfo } from './Asset.types';

interface AssetPricingProps {
  asset: Asset;
}

export const AssetPricing: FC<AssetPricingProps> = ({ asset }) => {
  const [price, setPrice] = useState<{
    value: string;
    token: TokenInfo | undefined;
    type: 'fixed' | 'free' | 'NOT_SUPPORTED';
  }>({
    value: 'No pricing schema available',
    token: undefined,
    type: 'NOT_SUPPORTED',
  });

  useEffect(() => {
    if (!asset || !asset.chainId || !asset.datatokens || asset.datatokens.length < 1) return;

    const getpricing = async () => {
      const accessDetails = await getAccessDetails(asset.chainId, asset.datatokens[0].address);
      setPrice({
        value: accessDetails.type === 'NOT_SUPPORTED' ? 'No pricing schema available' : accessDetails.price,
        token: accessDetails.baseToken,
        type: accessDetails.type,
      });
    };

    getpricing();
  }, [asset]);

  return (
    <div>
      <strong>
        {price.type === 'free' ? 'FREE' : price.value}{' '}
        {price.type !== 'NOT_SUPPORTED' && price.type !== 'free' && price.token.symbol}
      </strong>
    </div>
  );
};
