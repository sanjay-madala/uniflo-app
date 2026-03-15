// ─── Core client (framework-agnostic) ────────────────────────────────────────
export {
  createApiClient,
  ApiError,
  type ApiClient,
  type ApiClientConfig,
  type PaginatedResponse,
  type SingleResponse,
  type UnifloApiClient,
} from './client';

// ─── Provider (React) ────────────────────────────────────────────────────────
export { ApiClientProvider, useApiClient } from './provider';

// ─── Module clients ──────────────────────────────────────────────────────────
export { createTicketsClient, type TicketListParams, type CreateTicketBody, type UpdateTicketBody } from './modules/tickets';
export { createAuditsClient, type AuditListParams, type CreateAuditBody, type UpdateAuditBody, type AuditTemplateListParams, type CreateAuditTemplateBody } from './modules/audits';
export { createSopsClient, type SopListParams, type CreateSopBody, type UpdateSopBody, type AcknowledgeSopBody } from './modules/sops';
export { createCapaClient, type CapaListParams, type CreateCapaBody, type UpdateCapaBody, type CapaReviewBody } from './modules/capa';
export { createTasksClient, type TaskListParams, type CreateTaskBody, type UpdateTaskBody, type ProjectListParams, type CreateProjectBody } from './modules/tasks';
export { createKnowledgeClient, type ArticleListParams, type CreateArticleBody, type UpdateArticleBody, type CreateCategoryBody, type KBCategory } from './modules/knowledge';
export { createAutomationClient, type RuleListParams, type CreateRuleBody, type UpdateRuleBody, type ExecutionListParams } from './modules/automation';
export { createSlaClient, type PolicyListParams, type CreatePolicyBody, type UpdatePolicyBody, type BreachListParams, type ComplianceParams, type ComplianceReport } from './modules/sla';
export { createGoalsClient, type GoalListParams, type CreateGoalBody, type UpdateGoalBody, type CreateKeyResultBody, type UpdateKRProgressBody } from './modules/goals';
export { createBroadcastsClient, type BroadcastListParams, type CreateBroadcastBody, type UpdateBroadcastBody, type ReceiptListParams } from './modules/broadcasts';
export { createTrainingClient, type ModuleListParams, type CreateModuleBody, type UpdateModuleBody, type EnrollmentListParams, type EnrollBody, type SubmitQuizBody, type CertificateListParams } from './modules/training';
export { createCsatClient, type SurveyListParams, type CreateSurveyBody, type SubmitRatingBody, type DashboardParams, type CSATDashboardData } from './modules/csat';
export { createAdminClient, type UserListParams, type InviteUserBody, type UpdateUserBody, type CreateRoleBody, type UpdateRoleBody, type CreateLocationBody, type UpdateLocationBody, type UpdateOrgBody, type Role, type Location, type Organization } from './modules/admin';

// ─── React Query hooks ──────────────────────────────────────────────────────

// Tickets
export { useTickets, useTicket, useCreateTicket, useUpdateTicket, useDeleteTicket } from './hooks/useTickets';

// Audits
export { useAudits, useAudit, useCreateAudit, useUpdateAudit, useDeleteAudit, useAuditTemplates, useCreateAuditTemplate } from './hooks/useAudits';

// SOPs
export { useSops, useSop, useCreateSop, useUpdateSop, useDeleteSop, usePublishSop, useAcknowledgeSop } from './hooks/useSops';

// CAPA
export { useCapas, useCapa, useCreateCapa, useUpdateCapa, useDeleteCapa, useReviewCapa } from './hooks/useCapa';

// Tasks & Projects
export { useTasks, useTask, useCreateTask, useUpdateTask, useDeleteTask, useProjects, useCreateProject } from './hooks/useTasks';

// Knowledge Base
export { useArticles, useArticle, useCreateArticle, useUpdateArticle, useDeleteArticle, useKBCategories, useCreateKBCategory } from './hooks/useKnowledge';

// Automation
export { useAutomationRules, useAutomationRule, useCreateAutomationRule, useUpdateAutomationRule, useDeleteAutomationRule, useToggleAutomationRule, useAutomationExecutions } from './hooks/useAutomation';

// SLA
export { useSlaPolicies, useSlaPolicy, useCreateSlaPolicy, useUpdateSlaPolicy, useDeleteSlaPolicy, useSlaBreaches, useSlaCompliance } from './hooks/useSla';

// Goals & OKRs
export { useGoals, useGoal, useCreateGoal, useUpdateGoal, useDeleteGoal, useAddKeyResult, useUpdateKRProgress } from './hooks/useGoals';

// Broadcasts
export { useBroadcasts, useBroadcast, useCreateBroadcast, useUpdateBroadcast, useDeleteBroadcast, useSendBroadcast, useBroadcastReceipts } from './hooks/useBroadcasts';

// Training
export { useTrainingModules, useTrainingModule, useCreateTrainingModule, useUpdateTrainingModule, useDeleteTrainingModule, useTrainingEnrollments, useEnrollUser, useSubmitQuiz, useTrainingCertificates } from './hooks/useTraining';

// CSAT
export { useCsatSurveys, useCsatSurvey, useCreateCsatSurvey, useSubmitCsatRating, useCsatDashboard } from './hooks/useCsat';

// Admin
export { useAdminUsers, useInviteUser, useUpdateAdminUser, useDeactivateUser, useAdminRoles, useCreateRole, useUpdateRole, useAdminLocations, useCreateLocation, useUpdateLocation, useOrganization, useUpdateOrganization } from './hooks/useAdmin';
