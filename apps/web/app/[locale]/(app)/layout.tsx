import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/AuthGuard";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <AuthGuard>
      <AppShell locale={locale}>{children}</AppShell>
    </AuthGuard>
  );
}
