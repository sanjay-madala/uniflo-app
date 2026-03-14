import users from './users.json';
import organizations from './organizations.json';
import tickets from './tickets.json';
import audits from './audits.json';
import auditTemplates from './audit-templates.json';
import auditTrend from './audit-trend.json';
import sops from './sops.json';
import capas from './capas.json';
import tasks from './tasks.json';
import projects from './projects.json';
import taskComments from './task-comments.json';
import automationRulesData from './automationRules.json';
import slaData from './slaPolicies.json';
import {
  kbArticles,
  kbCategories,
  kbCollections,
  kbSimilarArticles,
  kbSuggestedTags,
  kbReadability,
} from './knowledge';
import {
  dashboardKPIs,
  trendData,
  activityEvents,
  locationTree,
  ticketAnalytics,
  auditAnalytics,
  capaAnalytics,
  taskAnalytics,
  customDashboards,
  exportConfigs,
  crossModuleSummary,
  auditHeatmapData,
} from './analytics';
import { goals, goalDashboardKPIs, teamGoalSummaries } from './goals';
import { broadcasts, broadcastTemplates, readReceipts, locationReceiptSummaries, regions } from './broadcasts';
import { mobileKpiCards, mobileTodaysSchedule, mobileActivityFeed } from './mobile-dashboard';

const automationRules = automationRulesData.rules;
const ruleTemplates = automationRulesData.templates;
const ruleExecutions = automationRulesData.executions;

const slaPolicies = slaData.policies;
const slaBreaches = slaData.breaches;
const slaComplianceTrend = slaData.complianceTrend;
const slaComplianceReport = slaData.complianceReport;
const slaItemStatuses = slaData.itemStatuses;

export {
  users,
  organizations,
  tickets,
  audits,
  auditTemplates,
  auditTrend,
  sops,
  capas,
  tasks,
  projects,
  taskComments,
  automationRules,
  ruleTemplates,
  ruleExecutions,
  kbArticles,
  kbCategories,
  kbCollections,
  kbSimilarArticles,
  kbSuggestedTags,
  kbReadability,
  dashboardKPIs,
  trendData,
  activityEvents,
  locationTree,
  ticketAnalytics,
  auditAnalytics,
  capaAnalytics,
  taskAnalytics,
  customDashboards,
  exportConfigs,
  crossModuleSummary,
  auditHeatmapData,
  slaPolicies,
  slaBreaches,
  slaComplianceTrend,
  slaComplianceReport,
  slaItemStatuses,
  goals,
  goalDashboardKPIs,
  teamGoalSummaries,
  broadcasts,
  broadcastTemplates,
  readReceipts,
  locationReceiptSummaries,
  regions,
  mobileKpiCards,
  mobileTodaysSchedule,
  mobileActivityFeed,
};

export { default as csatData } from './csat.json';
export { default as trainingData } from './training.json';

export * from './types';
