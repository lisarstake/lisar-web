import { ComponentType, lazy } from "react";

/**
 * Retry lazy loading a component if it fails due to network issues
 * Common with poor network or after deployments when chunks change
 */
export function lazyRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem("page-has-been-force-refreshed") || "false"
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem("page-has-been-force-refreshed", "false");
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem("page-has-been-force-refreshed", "true");
        window.location.reload();

        return { default: (() => null) as unknown as T };
      }
      // Already tried refreshing, throw the error to be caught by ErrorBoundary
      throw error;
    }
  });
}
