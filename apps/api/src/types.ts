import type { FastifyRequest } from 'fastify';

export interface AuthUser {
  uid: string;
  email: string;
  orgId: string;
  role: string;
  locationIds: string[];
}

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthUser;
    locationScope: string;
    userLocationIds: string[];
  }
}

export type AuthenticatedRequest = FastifyRequest & {
  user: AuthUser;
};
