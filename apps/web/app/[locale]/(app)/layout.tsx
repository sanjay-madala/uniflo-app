import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { DataProvider } from "@/components/providers/DataProvider";

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
      <DataProvider>
        <AppShell locale={locale}>{children}</AppShell>
      </DataProvider>
    </AuthGuard>
  );
}
