import OverviewDashboard from '@/components/dashboards/overview';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — Overview',
};

const DashboardPage = () => {
  return <OverviewDashboard />;
};

export default DashboardPage;
