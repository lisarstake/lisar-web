/**
 * Utility functions for extracting reset password tokens from URL
 */

export interface ResetTokenData {
  token: string;
  type: string;
  redirect_to?: string;
}

/**
 * Extracts reset password token from URL
 * For Supabase password reset flow
 */
export function extractResetTokenFromURL(): ResetTokenData | null {
  if (typeof window === 'undefined') return null;
  
  // Check URL hash (after #) - this is where Supabase puts the tokens
  const hash = window.location.hash;
  if (hash) {
    const hashParams = new URLSearchParams(hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (accessToken && type && type === 'recovery') {
      return {
        token: accessToken,
        type,
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
  
  // Remove query parameters from URL without causing a page reload
  window.history.replaceState(null, '', window.location.pathname);
}
