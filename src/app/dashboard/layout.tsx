import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import SiteAgreement from '@/components/layout/site-agreement';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OilBurnTracker — Real-time Conflict Fire & Emissions Tracker',
  description: 'Satellite fire detection, facility identification, and emissions estimates for conflict-affected oil & gas infrastructure',
  robots: {
    index: true,
    follow: true
  }
};

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <Header />
        {children}
      </SidebarInset>
      <SiteAgreement />
    </SidebarProvider>
  );
}
