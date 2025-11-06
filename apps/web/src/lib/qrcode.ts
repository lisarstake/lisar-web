/**
 * QR Code utility functions
 */

/**
 * Color palette for QR codes
 */
const QR_CODE_COLORS = [
  { dark: "#C7EF6B", light: "#1a1a1a" }, // Lime
  { dark: "#86B3F7", light: "#1a1a1a" }, // Blue
  { dark: "#FF6B6B", light: "#1a1a1a" }, // Red
  { dark: "#4ECDC4", light: "#1a1a1a" }, // Teal
  { dark: "#FFE66D", light: "#1a1a1a" }, // Yellow
  { dark: "#A8E6CF", light: "#1a1a1a" }, // Mint
  { dark: "#FF8B94", light: "#1a1a1a" }, // Pink
  { dark: "#9B59B6", light: "#1a1a1a" }, // Purple
];

/**
 * Generate a color based on address hash for consistent colors per address
 * Uses a simple hash function to ensure the same address always gets the same color
 */
export const getColorForAddress = (address: string): string => {
  // Simple hash function to get consistent color per address
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colorIndex = Math.abs(hash) % QR_CODE_COLORS.length;
  return QR_CODE_COLORS[colorIndex].dark;
};

/**
 * Get full color configuration (dark and light) for an address
 */
export const getColorConfigForAddress = (address: string): { dark: string; light: string } => {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colorIndex = Math.abs(hash) % QR_CODE_COLORS.length;
  return QR_CODE_COLORS[colorIndex];
};

