// Messages exchanged over the /ws socket between the browser and the people server.

export type TrafficPattern = 'random' | 'morning' | 'lunch' | 'evening';

export const TRAFFIC_PATTERNS: TrafficPattern[] = ['random', 'morning', 'lunch', 'evening'];

export interface TrafficConfig {
    pattern: TrafficPattern;
    ratePerMin: number;
    seed: number;
}

export const MIN_RATE = 1;
export const MAX_RATE = 120;

export type ClientMessage =
    | { type: 'hello', floorCount: number, starterFloor: number }
    | { type: 'config', config: Partial<TrafficConfig> }
    | { type: 'pause' }
    | { type: 'resume' };

export type ServerMessage =
    | { type: 'person', id: number, from: number, to: number }
    | { type: 'status', config: TrafficConfig, running: boolean };
