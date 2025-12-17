// Environment configuration
const getApiBaseUrl = (): string => {
  const isProduction = import.meta.env.MODE === "production";
  const isStaging =
    import.meta.env.VITE_ENV === "staging" ||
    import.meta.env.MODE === "staging";

  if (isStaging && import.meta.env.VITE_API_BASE_URL_MIGRATION) {
    return import.meta.env.VITE_API_BASE_URL_MIGRATION;
  }

  if (isProduction && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Development fallback
  return (
    import.meta.env.VITE_API_BASE_URL ||
    "https://lisar-api-2.onrender.com/api/v1"
  );
};

export const env = {
  VITE_API_BASE_URL: getApiBaseUrl(),
};
