/**
 * Publications Service Exports
 */

export { PublicationService } from './publicationService';
export * from './types';

// Create and export a singleton instance
import { PublicationService } from './publicationService';
export const publicationService = new PublicationService();
