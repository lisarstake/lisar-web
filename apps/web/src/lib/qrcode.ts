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

/**
 * Convert hex color to RGB
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Convert RGB to hex color
 */
const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
};

/**
 * Convert a bright color to a lighter, more subtle version
 * Mixes the color with gray to reduce saturation and brightness
 * @param hexColor - The hex color to make subtle (e.g., "#C7EF6B")
 * @param mixRatio - Ratio of gray to mix (0-1), default 0.4 (40% gray)
 * @returns A subtle hex color
 */
export const getSubtleColor = (hexColor: string, mixRatio: number = 0.4): string => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;

  // Mix with gray (128, 128, 128) to make it more subtle and lighter
  const subtleR = Math.round(rgb.r * (1 - mixRatio) + 128 * mixRatio);
  const subtleG = Math.round(rgb.g * (1 - mixRatio) + 128 * mixRatio);
  const subtleB = Math.round(rgb.b * (1 - mixRatio) + 128 * mixRatio);
  
  return rgbToHex(subtleR, subtleG, subtleB);
};

/**
 * Get a subtle color for an address (for QR codes and avatars)
 * @param address - The address to generate a subtle color for
 * @param mixRatio - Ratio of gray to mix (0-1), default 0.4 (40% gray)
 * @returns A subtle hex color
 */
export const getSubtleColorForAddress = (address: string, mixRatio: number = 0.4): string => {
  const brightColor = getColorForAddress(address);
  return getSubtleColor(brightColor, mixRatio);
};

