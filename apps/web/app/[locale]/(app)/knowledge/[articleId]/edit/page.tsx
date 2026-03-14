import ArticleEditClient from "./ArticleEditClient";

export function generateStaticParams() { return [{articleId:"kba_001"},{articleId:"kba_002"},{articleId:"kba_003"},{articleId:"kba_004"},{articleId:"kba_005"},{articleId:"kba_006"},{articleId:"kba_007"},{articleId:"kba_008"},{articleId:"kba_009"},{articleId:"kba_010"},{articleId:"kba_011"},{articleId:"kba_012"},{articleId:"kba_013"},{articleId:"kba_014"},{articleId:"kba_015"},{articleId:"kba_016"},{articleId:"kba_017"},{articleId:"kba_018"},{articleId:"kba_019"},{articleId:"kba_020"},{articleId:"kba_021"},{articleId:"kba_022"},{articleId:"kba_023"},{articleId:"kba_024"},{articleId:"kba_025"}] }

export default function ArticleEditPage() {
  return <ArticleEditClient />;
}
