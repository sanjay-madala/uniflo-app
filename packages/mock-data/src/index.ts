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
import csatDataRaw from './csat.json';
import trainingDataRaw from './training.json';
import {
  kbArticles,
  kbCategories,
  kbCollections,
  kbSimilarArticles,
  kbSuggestedTags,
  kbReadability,
  kbAnalytics,
  kbSearchGaps,
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

// Automation rules
const automationRules = automationRulesData.rules;
const ruleTemplates = automationRulesData.templates;
const ruleExecutions = automationRulesData.executions;

// SLA
const slaPolicies = slaData.policies;
const slaBreaches = slaData.breaches;
const slaComplianceTrend = slaData.complianceTrend;
const slaComplianceReport = slaData.complianceReport;
const slaItemStatuses = slaData.itemStatuses;

// CSAT / Portal
const portalTickets = csatDataRaw.portalTickets;
const portalTimeline = csatDataRaw.portalTimeline;
const csatSurveys = csatDataRaw.csatSurveys;
const csatDashboardSummary = csatDataRaw.csatDashboardSummary;
const csatTrendData = csatDataRaw.csatTrendData;
const csatDistribution = csatDataRaw.csatDistribution;
const csatCategoryScores = csatDataRaw.csatCategoryScores;
const csatLowScoreEntries = csatDataRaw.csatLowScoreEntries;
const csatAlerts = csatDataRaw.csatAlerts;

// Training
const trainingModules = trainingDataRaw.modules;
const trainingQuizzes = trainingDataRaw.quizzes;
const trainingEnrollments = trainingDataRaw.enrollments;
const trainingCertificates = trainingDataRaw.certificates;
const trainingNotifications = trainingDataRaw.notifications;
const trainingLocationStats = trainingDataRaw.locationStats;
const trainingCompletionTrend = trainingDataRaw.completionTrend;

export {
  // Core
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
  // Automation
  automationRules,
  ruleTemplates,
  ruleExecutions,
  // Knowledge Base
  kbArticles,
  kbCategories,
  kbCollections,
  kbSimilarArticles,
  kbSuggestedTags,
  kbReadability,
  kbAnalytics,
  kbSearchGaps,
  // Analytics / Dashboard
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
  // SLA
  slaPolicies,
  slaBreaches,
  slaComplianceTrend,
  slaComplianceReport,
  slaItemStatuses,
  // Goals
  goals,
  goalDashboardKPIs,
  teamGoalSummaries,
  // Broadcasts
  broadcasts,
  broadcastTemplates,
  readReceipts,
  locationReceiptSummaries,
  regions,
  // Mobile
  mobileKpiCards,
  mobileTodaysSchedule,
  mobileActivityFeed,
  // CSAT / Portal
  portalTickets,
  portalTimeline,
  csatSurveys,
  csatDashboardSummary,
  csatTrendData,
  csatDistribution,
  csatCategoryScores,
  csatLowScoreEntries,
  csatAlerts,
  // Training
  trainingModules,
  trainingQuizzes,
  trainingEnrollments,
  trainingCertificates,
  trainingNotifications,
  trainingLocationStats,
  trainingCompletionTrend,
};

export * from './types';
