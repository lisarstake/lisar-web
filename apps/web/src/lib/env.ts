// Environment configuration
// Reads from environment variables with fallback for development
const getApiBaseUrl = (): string => {
  // Check if we're in production or staging
  const isProduction = import.meta.env.MODE === 'production'
  const isStaging = import.meta.env.VITE_ENV === 'staging' || import.meta.env.MODE === 'staging'
  
  // Use staging URL if explicitly set, otherwise use production
  if (isStaging && import.meta.env.VITE_API_BASE_URL_STAGING) {
    return import.meta.env.VITE_API_BASE_URL_STAGING
  }
  
  // Use production URL if set, otherwise fallback to default
  if (isProduction && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // Development fallback
  return import.meta.env.VITE_API_BASE_URL || 'https://lisar-api-1.onrender.com/api/v1'
}

export const env = {
  VITE_API_BASE_URL: getApiBaseUrl()
}


