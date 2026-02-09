// src/pdf/schemas.ts

export type MachineKind =
  | 'tangentiel'
  | 'arbo'
  | 'viti'
  | 'viti_retour'
  | 'rampe';

export interface BusPosition {
  x: number;
  y: number;
}

export interface MachineSchema {
  imageKey: string;
  getBusPositions: (count: number) => BusPosition[];
}

// -------------------------------------------------------------
// TANGENTIEL
// -------------------------------------------------------------

const TANGENTIEL_LEFT_X = 65;
const TANGENTIEL_RIGHT_X = 185;
const TANGENTIEL_TOP_Y = 55;
const TANGENTIEL_BOTTOM_Y = 155;

function tangentielBusPositions(count: number): BusPosition[] {
  const perSide = Math.max(1, Math.floor(count / 2));
  const positions: BusPosition[] = [];
  const span = TANGENTIEL_BOTTOM_Y - TANGENTIEL_TOP_Y;
  const step = perSide > 1 ? span / (perSide - 1) : 0;

  for (let i = 0; i < perSide; i++) {
    const y = TANGENTIEL_TOP_Y + i * step;

    positions.push({ x: TANGENTIEL_LEFT_X, y });

    if (positions.length < count) {
      positions.push({ x: TANGENTIEL_RIGHT_X, y });
    }
  }

  return positions.slice(0, count);
}

// -------------------------------------------------------------
// ARBO
// -------------------------------------------------------------

function arboBusPositions(count: number): BusPosition[] {
  const positions: BusPosition[] = [];
  const cx = 125;
  const cy = 95;
  const radius = 70;
  const n = Math.max(1, count);

  for (let i = 0; i < n; i++) {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    positions.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  }

  return positions;
}

// -------------------------------------------------------------
// VITI SANS RETOUR
// -------------------------------------------------------------

function vitiSansRetourBusPositions(count: number): BusPosition[] {
  const base: BusPosition[] = [
    { x: 60,  y: 30 },   // Canon G
    { x: 190, y: 30 },   // Canon D
    { x: 60,  y: 110 },  // Main G
    { x: 190, y: 110 },  // Main D
  ];

  return base.slice(0, count);
}

// -------------------------------------------------------------
// VITI AVEC RETOUR
// -------------------------------------------------------------

function vitiAvecRetourBusPositions(count: number): BusPosition[] {
  const base: BusPosition[] = [
    { x: 60,  y: 30 },   // Canon G
    { x: 190, y: 30 },   // Canon D
    { x: 60,  y: 110 },  // Main G
    { x: 190, y: 110 },  // Main D
    { x: 90,  y: 135 },  // Retour G
    { x: 160, y: 135 },  // Retour D
  ];

  return base.slice(0, count);
}

// -------------------------------------------------------------
// RAMPE
// -------------------------------------------------------------

function rampeBusPositions(count: number): BusPosition[] {
  const positions: BusPosition[] = [];
  const n = Math.max(1, count);
  const startX = 40;
  const endX = 210;
  const y = 100;
  const span = endX - startX;
  const step = n > 1 ? span / (n - 1) : 0;

  for (let i = 0; i < n; i++) {
    positions.push({ x: startX + i * step, y });
  }

  return positions;
}

// -------------------------------------------------------------
// TABLE DES SCHÉMAS
// -------------------------------------------------------------

export const MACHINE_SCHEMAS: Record<MachineKind, MachineSchema> = {
  tangentiel: {
    imageKey: 'tangentielPng',
    getBusPositions: tangentielBusPositions,
  },
  arbo: {
    imageKey: 'arboPng',
    getBusPositions: arboBusPositions,
  },
  viti: {
    imageKey: 'vitiSansRetourPng',
    getBusPositions: vitiSansRetourBusPositions,
  },
  viti_retour: {
    imageKey: 'vitiAvecRetourPng',
    getBusPositions: vitiAvecRetourBusPositions,
  },
  rampe: {
    imageKey: 'rampePng',
    getBusPositions: rampeBusPositions,
  },
};

export function getSchema(kind: MachineKind): MachineSchema {
  return MACHINE_SCHEMAS[kind];
}
