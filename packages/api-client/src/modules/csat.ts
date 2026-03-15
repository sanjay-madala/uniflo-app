import type { ApiClient, PaginatedResponse, SingleResponse } from '../client';
import type { CSATSurvey } from '@uniflo/mock-data';

// ─── Parameter types ─────────────────────────────────────────────────────────

export interface SurveyListParams {
  status?: string;
  scoreMin?: number;
  scoreMax?: number;
  locationId?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface CreateSurveyBody {
  ticketId: string;
  locationId?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  ratingMode?: string;
  expiresAt: string;
}

export interface SubmitRatingBody {
  token: string;
  score: number;
  comment?: string;
}

export interface DashboardParams {
  locationId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CSATDashboardData {
  summary: {
    avgScore: number;
    totalResponses: number;
    minScore: number;
    maxScore: number;
  };
  distribution: Array<{ score: number | null; count: number }>;
  trend: Array<{ month: string; avgScore: number; count: number }>;
}

// ─── Client ──────────────────────────────────────────────────────────────────

export function createCsatClient(client: ApiClient) {
  return {
    listSurveys(params?: SurveyListParams) {
      return client.get<PaginatedResponse<CSATSurvey>>('/api/v1/csat/surveys', params as Record<string, string | number | boolean | undefined>);
    },
    getSurvey(id: string) {
      return client.get<SingleResponse<CSATSurvey>>(`/api/v1/csat/surveys/${id}`);
    },
    createSurvey(body: CreateSurveyBody) {
      return client.post<SingleResponse<CSATSurvey>>('/api/v1/csat/surveys', body);
    },
    submitRating(id: string, body: SubmitRatingBody) {
      return client.put<SingleResponse<CSATSurvey>>(`/api/v1/csat/surveys/${id}`, body);
    },
    getDashboard(params?: DashboardParams) {
      return client.get<SingleResponse<CSATDashboardData>>('/api/v1/csat/dashboard', params as Record<string, string | number | boolean | undefined>);
    },
  };
}
