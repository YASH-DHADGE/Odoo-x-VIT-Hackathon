export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];
