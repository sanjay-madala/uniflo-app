"use client";

import {
  trainingModules as mockTrainingModules,
  trainingEnrollments as mockTrainingEnrollments,
  trainingQuizzes as mockTrainingQuizzes,
  trainingCertificates as mockTrainingCertificates,
  trainingNotifications as mockTrainingNotifications,
  trainingLocationStats as mockTrainingLocationStats,
  trainingCompletionTrend as mockTrainingCompletionTrend,
} from "@uniflo/mock-data";
import type {
  TrainingModule,
  TrainingEnrollment,
  Quiz,
  TrainingCertificate,
  TrainingNotification,
  LocationTrainingStats,
} from "@uniflo/mock-data";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

// ---------------------------------------------------------------------------
// Training modules list
// ---------------------------------------------------------------------------

interface UseTrainingModulesDataResult {
  data: TrainingModule[];
  enrollments: TrainingEnrollment[];
  isLoading: boolean;
  error: Error | null;
}

export function useTrainingModulesData(
  _params?: Record<string, unknown>,
): UseTrainingModulesDataResult {
  if (API_MODE === "api") {
    // Future: wire to @uniflo/api-client
  }

  return {
    data: mockTrainingModules as TrainingModule[],
    enrollments: mockTrainingEnrollments as TrainingEnrollment[],
    isLoading: false,
    error: null,
  };
}

// ---------------------------------------------------------------------------
// Single training module
// ---------------------------------------------------------------------------

interface UseTrainingModuleDataResult {
  module: TrainingModule | null;
  enrollment: TrainingEnrollment | null;
  quiz: Quiz | null;
  isLoading: boolean;
  error: Error | null;
}

export function useTrainingModuleData(
  id: string,
  userId?: string,
): UseTrainingModuleDataResult {
  if (API_MODE === "api") {
    // Future: wire to @uniflo/api-client
  }

  const currentUser = userId ?? "user_001";
  const mod =
    (mockTrainingModules as TrainingModule[]).find((m) => m.id === id) ?? null;
  const enrollment =
    (mockTrainingEnrollments as TrainingEnrollment[]).find(
      (e) => e.module_id === id && e.user_id === currentUser,
    ) ?? null;
  const quiz = mod?.quiz_id
    ? (mockTrainingQuizzes as Quiz[]).find((q) => q.id === mod.quiz_id) ?? null
    : null;

  return {
    module: mod,
    enrollment,
    quiz,
    isLoading: false,
    error: null,
  };
}

// ---------------------------------------------------------------------------
// Enrollments
// ---------------------------------------------------------------------------

interface UseTrainingEnrollmentsDataResult {
  data: TrainingEnrollment[];
  modules: TrainingModule[];
  certificates: TrainingCertificate[];
  notifications: TrainingNotification[];
  isLoading: boolean;
  error: Error | null;
}

export function useTrainingEnrollmentsData(): UseTrainingEnrollmentsDataResult {
  if (API_MODE === "api") {
    // Future: wire to @uniflo/api-client
  }

  return {
    data: mockTrainingEnrollments as TrainingEnrollment[],
    modules: mockTrainingModules as TrainingModule[],
    certificates: mockTrainingCertificates as TrainingCertificate[],
    notifications: mockTrainingNotifications as TrainingNotification[],
    isLoading: false,
    error: null,
  };
}

// ---------------------------------------------------------------------------
// Certificates
// ---------------------------------------------------------------------------

interface UseTrainingCertificatesDataResult {
  data: TrainingCertificate[];
  modules: TrainingModule[];
  enrollments: TrainingEnrollment[];
  isLoading: boolean;
  error: Error | null;
}

export function useTrainingCertificatesData(): UseTrainingCertificatesDataResult {
  if (API_MODE === "api") {
    // Future: wire to @uniflo/api-client
  }

  return {
    data: mockTrainingCertificates as TrainingCertificate[],
    modules: mockTrainingModules as TrainingModule[],
    enrollments: mockTrainingEnrollments as TrainingEnrollment[],
    isLoading: false,
    error: null,
  };
}

// ---------------------------------------------------------------------------
// Analytics (location stats + trend)
// ---------------------------------------------------------------------------

interface UseTrainingAnalyticsDataResult {
  locationStats: LocationTrainingStats[];
  completionTrend: typeof mockTrainingCompletionTrend;
  modules: TrainingModule[];
  enrollments: TrainingEnrollment[];
  certificates: TrainingCertificate[];
  isLoading: boolean;
  error: Error | null;
}

export function useTrainingAnalyticsData(): UseTrainingAnalyticsDataResult {
  if (API_MODE === "api") {
    // Future: wire to @uniflo/api-client
  }

  return {
    locationStats: mockTrainingLocationStats as LocationTrainingStats[],
    completionTrend: mockTrainingCompletionTrend,
    modules: mockTrainingModules as TrainingModule[],
    enrollments: mockTrainingEnrollments as TrainingEnrollment[],
    certificates: mockTrainingCertificates as TrainingCertificate[],
    isLoading: false,
    error: null,
  };
}
