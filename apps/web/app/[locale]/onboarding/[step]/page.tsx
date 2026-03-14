import OnboardingClient from "./OnboardingClient";

export function generateStaticParams() { return [{step:"1"},{step:"2"},{step:"3"}] }

export default function OnboardingPage() {
  return <OnboardingClient />;
}
