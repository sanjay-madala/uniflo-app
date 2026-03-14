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

const automationRules = automationRulesData.rules;
const ruleTemplates = automationRulesData.templates;
const ruleExecutions = automationRulesData.executions;

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
};

export * from './types';
import slaData from './slaPolicies.json';
const slaPolicies = slaData.policies;
const slaBreaches = slaData.breaches;
const slaComplianceTrend = slaData.complianceTrend;
const slaComplianceReport = slaData.complianceReport;
const slaItemStatuses = slaData.itemStatuses;
export { slaPolicies, slaBreaches, slaComplianceTrend, slaComplianceReport, slaItemStatuses };
export { mobileKpiCards, mobileTodaysSchedule, mobileActivityFeed } from "./mobile-dashboard";
