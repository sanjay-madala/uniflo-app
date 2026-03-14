import users from './users.json';
import organizations from './organizations.json';
import tickets from './tickets.json';
import audits from './audits.json';
import auditTemplates from './audit-templates.json';
import auditTrend from './audit-trend.json';
import sops from './sops.json';
import capas from './capas.json';
import tasks from './tasks.json';

export { users, organizations, tickets, audits, auditTemplates, auditTrend, sops, capas, tasks };
export type { default as UsersData } from './users.json';
export * from './types';

import automationRulesData from './automationRules.json';
const automationRules = automationRulesData.rules;
const ruleTemplates = automationRulesData.templates;
const ruleExecutions = automationRulesData.executions;
export { users, organizations, tickets, audits, sops, capas, tasks, automationRules, ruleTemplates, ruleExecutions };

  kbArticles,
  kbCategories,
  kbCollections,
} from './knowledge';
export { default as projects } from "./projects.json";
export { default as taskComments } from "./task-comments.json";
