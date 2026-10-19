import { createHash } from 'node:crypto';
import { TestSituation } from '../../helpers/ElevatorSituations';
import { ElevatorOptions } from '../../types/ElevatorOptions';
import { Floor } from '../../types/Floor';
import { Person } from '../../types/Person';
import { Elevator } from '../Elevator';

// Deterministic PRNG so random scenarios are reproducible.
function mulberry32(seed: number) {
    return () => {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

interface Scenario {
    name: string,
    options: ElevatorOptions,
    persons: Array<[number, number]>,
    // tick -> persons added before that tick, like pressing "Add person" mid-run
    additions: Map<number, Array<[number, number]>>,
    ticks: number
}

export function buildScenarios(): Scenario[] {
    const scenarios: Scenario[] = [0, 1].map(n => {
        const s = TestSituation.get(n);
        return {
            name: `situation-${n}`,
            options: { ...s.options },
            persons: s.persons.map(p => [p.CurrentFloor as number, p.Destination as number] as [number, number]),
            additions: new Map(),
            ticks: 120
        };
    });

    for (let seed = 1; seed <= 300; seed++) {
        const rnd = mulberry32(seed);
        const int = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;

        const starterFloor = int(0, 1);
        const floorCount = int(starterFloor + 2, 15);
        const pair = (): [number, number] => [int(starterFloor, floorCount), int(starterFloor, floorCount)];

        const additions = new Map<number, Array<[number, number]>>();
        for (let t = 0; t < 80; t++) {
            if (rnd() < 0.15) additions.set(t, Array.from({ length: int(1, 3) }, pair));
        }

        scenarios.push({
            name: `random-${seed}`,
            options: {
                starterFloor,
                floorCount,
                currentElevatorFloor: int(starterFloor, floorCount),
                capacity: int(1, 6)
            },
            persons: Array.from({ length: int(0, 14) }, pair),
            additions,
            ticks: 250
        });
    }
    return scenarios;
}

// Runs a scenario tick by tick (500 ms apart, like the Start button) and
// records every distinct state the UI is asked to render.
export function traceScenario(s: Scenario, advanceTimers: (ms: number) => void): string[] {
    const persons: Person[] = [];
    const elevator = new Elevator({ ...s.options });
    const trace: string[] = [];

    const snapshot = (label: string, floors: Floor[]) => {
        const floorsView = Array.from({ length: floors.length }, (_, i) => {
            const f = floors[i];
            return f === undefined ? null : [f.State, f.GoingPersonCount, f.AwatingPersonCount, f.ArrivedPersonCountView];
        });
        const entry = JSON.stringify([label, floorsView, persons.map(p => p.State)]);
        // Repeated identical updates render nothing new, so they are not part of the behavior.
        if (trace[trace.length - 1] !== entry) trace.push(entry);
    };
    elevator.setUpdaterFunc(floors => snapshot('update', floors));

    const add = ([from, to]: [number, number]) => {
        const p = new Person(from, to);
        persons.push(p);
        elevator.callElevator(p);
    };

    s.persons.forEach(add);
    for (let t = 0; t < s.ticks; t++) {
        s.additions.get(t)?.forEach(add);
        elevator.processing();
        advanceTimers(500);
    }
    return trace;
}

export function hashTrace(trace: string[]) {
    return createHash('sha256').update(trace.join('\n')).digest('hex');
}
