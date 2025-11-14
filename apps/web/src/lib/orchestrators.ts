import { OrchestratorResponse } from "@/services/delegation/types";

/**
 * Get the display name for an orchestrator
 * Checks ensIdentity.name first, then ensName, then falls back to address
 */
export const getOrchestratorDisplayName = (
  orchestrator: OrchestratorResponse
): string => {
  return (
    orchestrator?.ensIdentity?.name ||
    orchestrator?.ensName ||
    orchestrator?.address ||
    "Unknown Validator"
  );
};

/**
 * Check if an orchestrator's name starts with "0x" (is an address)
 */
export const isOrchestratorNameAddress = (
  orchestrator: OrchestratorResponse
): boolean => {
  const displayName = getOrchestratorDisplayName(orchestrator);
  return displayName.toLowerCase().startsWith("0x");
};

/**
 * Filter out orchestrators whose names start with "0x" (addresses)
 * This hides orchestrators that don't have proper ENS names
 */
export const filterOrchestratorsWithoutNames = (
  orchestrators: OrchestratorResponse[]
): OrchestratorResponse[] => {
  return orchestrators.filter(
    (orchestrator) => !isOrchestratorNameAddress(orchestrator)
  );
};

