import CertificateClient from "./CertificateClient";

export function generateStaticParams() {
  return [
    { moduleId: "tm_001" },
    { moduleId: "tm_002" },
    { moduleId: "tm_003" },
    { moduleId: "tm_004" },
    { moduleId: "tm_005" },
    { moduleId: "tm_006" },
    { moduleId: "tm_007" },
    { moduleId: "tm_008" },
    { moduleId: "tm_009" },
    { moduleId: "tm_010" },
    { moduleId: "tm_011" },
    { moduleId: "tm_012" },
  ];
}

export default function CertificatePage() {
  return <CertificateClient />;
}
