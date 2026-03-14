import ArticleEditClient from "./ArticleEditClient";

export function generateStaticParams() { return [{articleId:"kb_001"},{articleId:"kb_002"},{articleId:"kb_003"},{articleId:"kb_004"},{articleId:"kb_005"}] }

export default function ArticleEditPage() {
  return <ArticleEditClient />;
}
