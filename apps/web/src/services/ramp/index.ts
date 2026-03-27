/**
 * Ramp Service Index
 * Centralized export for ramp-related services
 */

// Export types
export * from "./types";

// Export API interface
export * from "./api";

// Export service implementation
export { RampService } from "./rampService";

// Create and export service instance
import { RampService } from "./rampService";

export const rampService = new RampService();
