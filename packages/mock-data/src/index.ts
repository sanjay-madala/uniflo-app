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
import slaData from './slaPolicies.json';
import {
  broadcasts,
  broadcastTemplates,
  readReceipts,
  locationReceiptSummaries,
  regions,
} from './broadcasts';
import { goals, goalDashboardKPIs, teamGoalSummaries } from './goals';

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
  slaPolicies,
  slaBreaches,
  slaComplianceTrend,
  slaComplianceReport,
  slaItemStatuses,
  broadcasts,
  broadcastTemplates,
  readReceipts,
  locationReceiptSummaries,
  regions,
  goals,
  goalDashboardKPIs,
  teamGoalSummaries,
};

export * from './types';
