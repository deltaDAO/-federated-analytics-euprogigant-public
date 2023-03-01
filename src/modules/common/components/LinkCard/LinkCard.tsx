import { Paper, Text } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface LinkCardProps {
  title: string;
  description: string;
  href: string;
  iconSrc: string;
}

export const LinkCard: FC<LinkCardProps> = ({ title, description, href, iconSrc }) => {
  const { hovered, ref } = useHover();

  return (
    <div ref={ref}>
      <Link href={href} passHref>
        <Paper
          component="a"
          shadow={hovered ? 'lg' : 'md'}
          radius="lg"
          p="xl"
          style={{
            display: 'flex',
            height: '100%',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'all 0.3s ease-out',
          }}
          sx={{ '&:hover': { transform: 'translateY(-5px) scale(1.005) translateZ(0)' } }}
        >
          <Image src={iconSrc} height={100} width={100} alt="" />
          <Text size="xl" weight="bold" align="center" mt="xl" mb="sm">
            {title}
          </Text>
          <Text size="sm" align="center">
            {description}
          </Text>
        </Paper>
      </Link>
    </div>
  );
};
