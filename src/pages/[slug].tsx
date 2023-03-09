import { Container } from '@mantine/core';
import React, { ReactElement } from 'react';

import { markdownToHtml } from '@/modules/common/components/Markdown/markdownToHtml';
import { getAllPages, getPageBySlug, PageData } from '../modules/common/components/Markdown/markdownPages';

export default function PageMarkdown(page: PageData): ReactElement | null {
  if (!page || page.content === '') return null;

  const { title, description } = page.frontmatter;
  const { content } = page;

  return (
    <div>
      <Container>
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </Container>
    </div>
  );
}

export async function getStaticProps({ params }: { params: { slug: string } }): Promise<{ props: PageData }> {
  const page = getPageBySlug(params.slug);
  const content = markdownToHtml(page?.content || '');

  return {
    props: { ...page, content },
  };
}

export async function getStaticPaths(): Promise<{
  paths: {
    params: {
      slug: string;
    };
  }[];
  fallback: boolean;
}> {
  const pages = getAllPages();

  return {
    paths: pages.map((page) => {
      return {
        params: { slug: page.slug },
      };
    }),
    fallback: false,
  };
}
