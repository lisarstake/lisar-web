/**
 * Utility functions for extracting authentication tokens from URL hash
 */

export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: string;
  type?: string;
  provider_token?: string; // For Google OAuth
}

/**
 * Extracts authentication tokens from URL hash
 * Example URL: http://localhost:5173/login#access_token=eyJ...&expires_at=1761300396&refresh_token=uakv6aeiuzuh&token_type=bearer&type=signup
 */
export function extractTokensFromHash(): TokenData | null {
  if (typeof window === 'undefined') return null;
  
  const hash = window.location.hash;
  if (!hash) return null;
  
  // Remove the # symbol
  const hashParams = hash.substring(1);
  
  // Parse URL parameters
  const params = new URLSearchParams(hashParams);
  
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  const expires_at = params.get('expires_at');
  const expires_in = params.get('expires_in');
  const token_type = params.get('token_type');
  const type = params.get('type');
  const provider_token = params.get('provider_token'); // Google OAuth token
  
  // Validate required tokens
  if (!access_token || !refresh_token || !expires_at || !expires_in) {
    return null;
  }
  
  return {
    access_token,
    refresh_token,
    expires_at: parseInt(expires_at),
    expires_in: parseInt(expires_in),
    token_type: token_type || 'bearer',
    type: type || undefined,
    provider_token: provider_token || undefined
  };
}

/**
 * Clears the URL hash after extracting tokens
 */
export function clearHashFromURL(): void {
  if (typeof window === 'undefined') return;
  
  // Remove hash from URL without causing a page reload
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
}
