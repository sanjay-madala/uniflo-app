import BroadcastDetailClient from "./BroadcastDetailClient";

export function generateStaticParams() {
  return [
    { broadcastId: "bc_001" },
    { broadcastId: "bc_002" },
    { broadcastId: "bc_003" },
    { broadcastId: "bc_004" },
    { broadcastId: "bc_005" },
  ];
}

export default function BroadcastDetailPage() {
  return <BroadcastDetailClient />;
}
