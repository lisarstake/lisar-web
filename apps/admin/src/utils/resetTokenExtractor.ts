/**
 * Utility functions for extracting reset password tokens from URL
 */

export interface ResetTokenData {
  token: string;
  type?: string;
  redirect_to?: string;
}

/**
 * Extracts reset password token from URL
 * Supports both query parameters and hash fragments
 */
export function extractResetTokenFromURL(): ResetTokenData | null {
  if (typeof window === 'undefined') return null;
  
  // Check URL query parameters first
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');
  
  if (token) {
    return {
      token,
      type: searchParams.get('type') || undefined,
      redirect_to: searchParams.get('redirect_to') || undefined
    };
  }
  
  // Check URL hash (after #) - for compatibility with different flows
  const hash = window.location.hash;
  if (hash) {
    const hashParams = new URLSearchParams(hash.substring(1));
    const accessToken = hashParams.get('access_token') || hashParams.get('token');
    const type = hashParams.get('type');
    
    if (accessToken && type === 'recovery') {
      return {
        token: accessToken,
        type,
        redirect_to: hashParams.get('redirect_to') || undefined
      };
    }
    
    // Also check for just 'token' in hash
    if (accessToken) {
      return {
        token: accessToken,
        type: type || undefined,
        redirect_to: hashParams.get('redirect_to') || undefined
      };
    }
  }
  
  return null;
}

/**
 * Clears the URL parameters after extracting the token
 */
export function clearResetTokenFromURL(): void {
  if (typeof window === 'undefined') return;
  
  // Remove query parameters and hash from URL without causing a page reload
  window.history.replaceState(null, '', window.location.pathname);
}

