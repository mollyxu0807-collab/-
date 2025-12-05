import { Vector3, Color } from 'three';

// Removed global JSX augmentation to fix IntrinsicElements issues.

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface DualPosition {
  scatterPos: Vector3;
  treePos: Vector3;
  rotation: Vector3;
  scale: number;
  color: Color;
  speed: number; // For floating animation
  phase: number; // For floating offset
}

export interface FoliageUniforms {
  uTime: { value: number };
  uProgress: { value: number };
  uColorCore: { value: Color };
  uColorTip: { value: Color };
}

export const COLORS = {
  EMERALD_DEEP: '#00241B',
  EMERALD_LITE: '#004C39',
  GOLD_METALLIC: '#D4AF37',
  GOLD_BRIGHT: '#FFD700',
  RED_VELVET: '#8B0000',
  SILVER_MIST: '#C0C0C0',
  WHITE_GLOW: '#FFFDD0',
  CANDY_RED: '#D40000',
  CANDY_WHITE: '#FFFFFF',
  MISTLETOE_LEAF_DARK: '#1a3d00',
  MISTLETOE_LEAF_LITE: '#4a6b22',
  MISTLETOE_BERRY: '#F0F5F5',
  RIBBON_RED: '#C41E3A',
  ROYAL_BLUE: '#0B2447',
  SNOW_WHITE: '#FFFFFF',
};