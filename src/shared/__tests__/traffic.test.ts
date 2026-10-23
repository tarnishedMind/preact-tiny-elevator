import { describe, expect, it } from 'vitest';
import { TRAFFIC_PATTERNS } from '../protocol';
import { createTraffic } from '../traffic';

const building = { floorCount: 10, starterFloor: 1 };

const take = (n: number, next: () => { from: number, to: number }) => Array.from({ length: n }, next);

describe('traffic generator', () => {
    it.each(TRAFFIC_PATTERNS)('%s: trips stay in the building and never start where they end', (pattern) => {
        const trips = take(2000, createTraffic({ ...building, pattern, seed: 7 }));
        for (const { from, to } of trips) {
            expect(from).not.toBe(to);
            for (const f of [from, to]) {
                expect(f).toBeGreaterThanOrEqual(1);
                expect(f).toBeLessThanOrEqual(10);
            }
        }
    });

    it('is reproducible for the same seed', () => {
        const a = take(50, createTraffic({ ...building, pattern: 'random', seed: 42 }));
        const b = take(50, createTraffic({ ...building, pattern: 'random', seed: 42 }));
        const c = take(50, createTraffic({ ...building, pattern: 'random', seed: 43 }));
        expect(a).toEqual(b);
        expect(a).not.toEqual(c);
    });

    it('morning traffic mostly leaves the lobby, evening traffic mostly returns to it', () => {
        const morning = take(1000, createTraffic({ ...building, pattern: 'morning', seed: 1 }));
        const evening = take(1000, createTraffic({ ...building, pattern: 'evening', seed: 1 }));
        expect(morning.filter(t => t.from === 1).length).toBeGreaterThan(700);
        expect(evening.filter(t => t.to === 1).length).toBeGreaterThan(700);
    });

    it('lunch traffic always touches the lobby', () => {
        const lunch = take(500, createTraffic({ ...building, pattern: 'lunch', seed: 3 }));
        expect(lunch.every(t => t.from === 1 || t.to === 1)).toBe(true);
    });
});
