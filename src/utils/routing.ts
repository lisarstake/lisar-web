/**
 * Utility functions for URL-safe routing with validator names
 */

/**
 * Convert validator name to URL-safe slug
 * Example: "giga-kubica.eth" -> "giga-kubica-eth"
 */
export const nameToSlug = (name: string): string => {
  return name.toLowerCase().replace(/\./g, '-');
};

/**
 * Convert URL slug back to validator name
 * Example: "giga-kubica-eth" -> "giga-kubica.eth"
 */
export const slugToName = (slug: string): string => {
  return slug.replace(/-/g, '.').toLowerCase();
};

/**
 * Get validator name from URL parameter
 * Handles both old numeric IDs and new name-based slugs
 */
export const getValidatorNameFromParam = (param: string | undefined): string => {
  if (!param) return 'giga-kubica-eth'; // default fallback
  
  // If it's a number (old system), return default
  if (/^\d+$/.test(param)) {
    return 'giga-kubica-eth';
  }
  
  return param;
};

/**
 * Get validator name from URL parameter (returns actual name, not slug)
 */
export const getValidatorDisplayName = (param: string | undefined): string => {
  const slug = getValidatorNameFromParam(param);
  return slugToName(slug);
};
