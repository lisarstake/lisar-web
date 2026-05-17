/**
 * PAJ Ramp Service Index
 * Centralized export for paj-ramp-related services
 */

// Export types
export * from "./types";

// Export API interface
export * from "./api";

// Export service implementation
export { PajRampService } from "./pajRampService";

// Create and export service instance
import { PajRampService } from "./pajRampService";

export const pajRampService = new PajRampService();
