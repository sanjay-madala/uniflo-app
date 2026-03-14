export interface MobileKPICard {
  label: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down";
  trendPositive: boolean;
  href: string;
}

export interface MobileScheduleItem {
  id: string;
  time: string;
  title: string;
  location: string;
  status: string;
}

export interface MobileActivityItem {
  id: string;
  time: string;
  text: string;
  accentColor: string;
  href: string;
}

export const mobileKpiCards: MobileKPICard[] = [
  {
    label: "Open Tickets",
    value: "12",
    trend: "+2 today",
    trendDirection: "up",
    trendPositive: false,
    href: "/tickets/?status=open",
  },
  {
    label: "Compliance %",
    value: "87%",
    trend: "+3% this week",
    trendDirection: "up",
    trendPositive: true,
    href: "/analytics/",
  },
  {
    label: "CAPA Overdue",
    value: "3",
    trend: "-1 from yesterday",
    trendDirection: "down",
    trendPositive: true,
    href: "/capa/?status=overdue",
  },
  {
    label: "Audits This Week",
    value: "8",
    trend: "2 remaining",
    trendDirection: "up",
    trendPositive: true,
    href: "/audit/",
  },
];

export const mobileTodaysSchedule: MobileScheduleItem[] = [
  {
    id: "aud_010",
    time: "08:00",
    title: "Opening Checklist",
    location: "Resort",
    status: "Scheduled",
  },
  {
    id: "aud_011",
    time: "14:00",
    title: "Food Safety Audit",
    location: "Downtown",
    status: "Scheduled",
  },
];

export const mobileActivityFeed: MobileActivityItem[] = [
  {
    id: "act_1",
    time: "2m ago",
    text: "TKT-045 assigned to you by Priya S.",
    accentColor: "var(--accent-blue)",
    href: "/tickets/tkt_045/",
  },
  {
    id: "act_2",
    time: "15m ago",
    text: "Audit AUD-003 completed — Score: 54%",
    accentColor: "var(--accent-red)",
    href: "/audit/aud_003/results/",
  },
  {
    id: "act_3",
    time: "1h ago",
    text: 'CAPA-002 overdue "Fix walk-in freezer"',
    accentColor: "var(--accent-red)",
    href: "/capa/capa_002/",
  },
  {
    id: "act_4",
    time: "2h ago",
    text: 'SOP published: "Freezer Maintenance"',
    accentColor: "var(--accent-blue)",
    href: "/sops/",
  },
  {
    id: "act_5",
    time: "3h ago",
    text: "TKT-038 resolved",
    accentColor: "var(--accent-green)",
    href: "/tickets/tkt_038/",
  },
];
