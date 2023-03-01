import Link from 'next/link';
import { FC } from 'react';

interface Props {
  href: string;
  text: string;
}

export const LinkText: FC<Props> = ({ href, text }) => (
  <Link href={href} passHref>
    <a target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
      {text}
    </a>
  </Link>
);
