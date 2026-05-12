/**
 * Points Service — exports types, interface, implementation, singleton.
 */

export * from "./types";
export * from "./api";
export * from "./pointsService";

import { PointsService } from "./pointsService";

export const pointsService = new PointsService();
