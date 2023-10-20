/**
 * An API Auth Scope defines the specific permissions or actions that an API-Key is allowed to perform when accessing the API, helping to control and limit its access to certain features or data
 */
export type APIAuthScope = "key:create" | "key:update";

/**
 * An auth role is a predefined set of permissions or actions that determine what an API-Key is allowed to perform when accessing the API. It helps manage and control user privileges based on their role or responsibilities.
 */
export type APIAuthRole = "USER" | "STAFF" | "ADMIN";
