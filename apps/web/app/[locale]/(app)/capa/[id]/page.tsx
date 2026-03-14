import { CAPADetailClient } from "./CAPADetailClient";

export function generateStaticParams() { return [{id:"capa_001"},{id:"capa_002"},{id:"capa_003"},{id:"capa_004"},{id:"capa_005"}] }

export default function CAPADetailPage() {
  return <CAPADetailClient />;
}
