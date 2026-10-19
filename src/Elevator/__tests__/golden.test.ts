import { readFileSync, writeFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildScenarios, hashTrace, traceScenario } from './scenarios';

// Golden traces pin the elevator's exact observable behavior. They were recorded
// from the original (pre-refactor) logic; a refactor must keep every hash equal.
// After an intentional behavior change, regenerate with: UPDATE_GOLDEN=1 npm test
const goldenPath = new URL('./golden.json', import.meta.url);

describe('Elevator golden traces', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('matches the recorded behavior in every scenario', () => {
        const actual: Record<string, string> = {};
        for (const s of buildScenarios()) {
            actual[s.name] = hashTrace(traceScenario(s, ms => vi.advanceTimersByTime(ms)));
        }

        if (process.env.UPDATE_GOLDEN) {
            writeFileSync(goldenPath, JSON.stringify(actual, null, 2) + '\n');
        }
        const golden = JSON.parse(readFileSync(goldenPath, 'utf8'));
        expect(actual).toEqual(golden);
    });
});
