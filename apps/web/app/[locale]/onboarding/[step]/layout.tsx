export function generateStaticParams() {
  return [{ step: "1" }, { step: "2" }, { step: "3" }];
}

export default function StepLayout({ children }: { children: React.ReactNode }) {
  return children;
}
