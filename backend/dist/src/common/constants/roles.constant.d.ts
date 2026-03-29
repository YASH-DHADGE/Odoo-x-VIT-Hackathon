export declare const ROLES: {
    readonly ADMIN: "ADMIN";
    readonly MANAGER: "MANAGER";
    readonly EMPLOYEE: "EMPLOYEE";
};
export type RoleType = (typeof ROLES)[keyof typeof ROLES];
