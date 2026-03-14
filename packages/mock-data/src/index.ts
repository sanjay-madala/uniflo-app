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
import trainingData from './training.json';

const automationRules = automationRulesData.rules;
const ruleTemplates = automationRulesData.templates;
const ruleExecutions = automationRulesData.executions;

const trainingModules = trainingData.modules;
const trainingQuizzes = trainingData.quizzes;
const trainingEnrollments = trainingData.enrollments;
const trainingCertificates = trainingData.certificates;
const trainingNotifications = trainingData.notifications;
const trainingLocationStats = trainingData.locationStats;
const trainingCompletionTrend = trainingData.completionTrend;

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
  trainingModules,
  trainingQuizzes,
  trainingEnrollments,
  trainingCertificates,
  trainingNotifications,
  trainingLocationStats,
  trainingCompletionTrend,
};

export * from './types';
