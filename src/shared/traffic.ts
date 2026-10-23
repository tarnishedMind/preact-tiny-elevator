import { TrafficPattern } from './protocol';

export interface Trip {
    from: number;
    to: number;
}

export interface TrafficOptions {
    floorCount: number;
    starterFloor: number;
    pattern: TrafficPattern;
    seed: number;
}

// mulberry32: a tiny seeded PRNG, so the same seed always gives the same people.
export function createRandom(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Share of trips that start (morning) or end (evening) at the lobby.
const RUSH_SHARE = 0.8;

export function createTraffic({ floorCount, starterFloor, pattern, seed }: TrafficOptions): () => Trip {
    if (floorCount <= starterFloor) {
        throw new Error('Traffic needs at least two floors');
    }

    const random = createRandom(seed);
    const lobby = starterFloor;
    const anyFloor = () => starterFloor + Math.floor(random() * (floorCount - starterFloor + 1));
    const upperFloor = () => starterFloor + 1 + Math.floor(random() * (floorCount - starterFloor));
    const otherFloor = (not: number) => {
        let f = anyFloor();
        while (f === not) f = anyFloor();
        return f;
    };

    const fromLobby = (): Trip => ({ from: lobby, to: upperFloor() });
    const toLobby = (): Trip => ({ from: upperFloor(), to: lobby });
    const anyTrip = (): Trip => {
        const from = anyFloor();
        return { from, to: otherFloor(from) };
    };

    return () => {
        switch (pattern) {
            case 'morning':
                return random() < RUSH_SHARE ? fromLobby() : anyTrip();
            case 'evening':
                return random() < RUSH_SHARE ? toLobby() : anyTrip();
            case 'lunch':
                return random() < 0.5 ? toLobby() : fromLobby();
            default:
                return anyTrip();
        }
    };
}
