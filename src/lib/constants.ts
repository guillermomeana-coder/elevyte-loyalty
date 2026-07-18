export const SESSION_COOKIE_NAME = "elevyte_session";
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export const ROLES = {
  AGENCY_ADMIN: "agency_admin",
  BUSINESS_ADMIN: "business_admin",
  WORKER: "worker",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const SUPPORTED_LANGUAGES = [
  { code: "es", name: "Español" },
  { code: "en", name: "English" },
] as const;
