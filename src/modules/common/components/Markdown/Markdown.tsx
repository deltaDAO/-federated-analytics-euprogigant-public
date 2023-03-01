import React, { FC } from 'react';

import { markdownToHtml } from './markdownToHtml';

import styles from './Markdown.module.css';

interface props {
  text: string;
}

export const Markdown: FC<props> = ({ text }) => {
  const content = markdownToHtml(text);

  return (
    <div
      className={styles.markdown}
      // Note: We serialize and kill all embedded HTML over in markdownToHtml()
      // so the danger here is gone.
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
