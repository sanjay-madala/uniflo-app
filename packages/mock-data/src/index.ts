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
import csatData from './csat.json';

const automationRules = automationRulesData.rules;
const ruleTemplates = automationRulesData.templates;
const ruleExecutions = automationRulesData.executions;

const portalTickets = csatData.portalTickets;
const portalTimeline = csatData.portalTimeline;
const csatSurveys = csatData.csatSurveys;
const csatDashboardSummary = csatData.csatDashboardSummary;
const csatTrendData = csatData.csatTrendData;
const csatDistribution = csatData.csatDistribution;
const csatCategoryScores = csatData.csatCategoryScores;
const csatLowScoreEntries = csatData.csatLowScoreEntries;
const csatAlerts = csatData.csatAlerts;

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
  portalTickets,
  portalTimeline,
  csatSurveys,
  csatDashboardSummary,
  csatTrendData,
  csatDistribution,
  csatCategoryScores,
  csatLowScoreEntries,
  csatAlerts,
};

export * from './types';
