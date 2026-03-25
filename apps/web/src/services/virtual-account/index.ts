/**
 * Virtual Account Service Index
 * Centralized export for virtual account-related services
 */

// Export types
export * from "./types";

// Export API interface
export * from "./api";

// Export service implementation
export { VirtualAccountService } from "./virtualAccountService";

// Create and export service instance
import { VirtualAccountService } from "./virtualAccountService";

export const virtualAccountService = new VirtualAccountService();
