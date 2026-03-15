import type { ApiClient, PaginatedResponse, SingleResponse } from '../client';
import type { TrainingModule, TrainingEnrollment, TrainingCertificate } from '@uniflo/mock-data';

// ─── Parameter types ─────────────────────────────────────────────────────────

export interface ModuleListParams {
  category?: string;
  difficulty?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface CreateModuleBody {
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
  locationId?: string;
  tags?: string[];
  coverImage?: string;
  estimatedDurationMinutes?: number;
  version?: string;
  assignedRoleIds?: string[];
  assignedLocationIds?: string[];
  linkedSopId?: string;
  passThreshold?: number;
  timeLimitMinutes?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showCorrectAnswers?: boolean;
}

export interface UpdateModuleBody {
  title?: string;
  description?: string;
  status?: string;
  category?: string;
  difficulty?: string;
  locationId?: string;
  tags?: string[];
  coverImage?: string;
  estimatedDurationMinutes?: number;
  version?: string;
  assignedRoleIds?: string[];
  assignedLocationIds?: string[];
  linkedSopId?: string;
  passThreshold?: number;
  timeLimitMinutes?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showCorrectAnswers?: boolean;
  publishedAt?: string;
}

export interface EnrollmentListParams {
  moduleId?: string;
  userId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface EnrollBody {
  moduleId: string;
  userId: string;
  dueDate?: string;
  assignmentTrigger?: string;
}

export interface SubmitQuizBody {
  enrollmentId: string;
  answers: unknown[];
  score: number;
  passed: boolean;
  startedAt: string;
  completedAt: string;
  attemptNumber: number;
}

export interface CertificateListParams {
  moduleId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

// ─── Client ──────────────────────────────────────────────────────────────────

export function createTrainingClient(client: ApiClient) {
  return {
    listModules(params?: ModuleListParams) {
      return client.get<PaginatedResponse<TrainingModule>>('/api/v1/training/modules', params as Record<string, string | number | boolean | undefined>);
    },
    getModule(id: string) {
      return client.get<SingleResponse<TrainingModule>>(`/api/v1/training/modules/${id}`);
    },
    createModule(body: CreateModuleBody) {
      return client.post<SingleResponse<TrainingModule>>('/api/v1/training/modules', body);
    },
    updateModule(id: string, body: UpdateModuleBody) {
      return client.put<SingleResponse<TrainingModule>>(`/api/v1/training/modules/${id}`, body);
    },
    deleteModule(id: string) {
      return client.del(`/api/v1/training/modules/${id}`);
    },
    listEnrollments(params?: EnrollmentListParams) {
      return client.get<PaginatedResponse<TrainingEnrollment>>('/api/v1/training/enrollments', params as Record<string, string | number | boolean | undefined>);
    },
    enroll(body: EnrollBody) {
      return client.post<SingleResponse<TrainingEnrollment>>('/api/v1/training/enroll', body);
    },
    submitQuiz(moduleId: string, body: SubmitQuizBody) {
      return client.post<SingleResponse<unknown>>(`/api/v1/training/modules/${moduleId}/quiz/submit`, body);
    },
    listCertificates(params?: CertificateListParams) {
      return client.get<PaginatedResponse<TrainingCertificate>>('/api/v1/training/certificates', params as Record<string, string | number | boolean | undefined>);
    },
  };
}
