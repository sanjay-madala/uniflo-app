import { CAPADetailClient } from "./CAPADetailClient";

export function generateStaticParams() { return [{id:"capa_001"},{id:"capa_002"},{id:"capa_003"},{id:"capa_004"},{id:"capa_005"},{id:"capa_006"},{id:"capa_007"},{id:"capa_008"},{id:"capa_009"},{id:"capa_010"},{id:"capa_011"},{id:"capa_012"}] }

export default function CAPADetailPage() {
  return <CAPADetailClient />;
}
