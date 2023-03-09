import { remark } from 'remark';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

export function markdownToHtml(markdown: string): string {
  const result = remark()
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkHtml) // serializes through remark-rehype and rehype-stringify
    .processSync(markdown);

  return result.toString();
}
