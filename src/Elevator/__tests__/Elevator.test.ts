import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestSituation } from '../../helpers/ElevatorSituations';
import { Person } from '../../types/Person';
import { PersonType } from '../../types/PersonType';
import { Elevator } from '../Elevator';
import { buildScenarios } from './scenarios';

// Runs a built-in situation on fresh Person copies and returns them after `maxTicks` steps.
function runSituation(n: number, maxTicks = 200) {
    const situation = TestSituation.get(n);
    const persons = situation.persons.map(p => new Person(p.CurrentFloor as number, p.Destination as number));
    const elevator = new Elevator({ ...situation.options });
    persons.forEach(p => elevator.callElevator(p));

    let ticks = 0;
    while (ticks < maxTicks && persons.some(p => p.State !== PersonType.Done)) {
        elevator.processing();
        ticks++;
    }
    return { persons, ticks };
}

describe('Elevator', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it.each([0, 1])('delivers everyone in test situation %i', (n) => {
        const { persons } = runSituation(n);
        expect(persons.every(p => p.State === PersonType.Done)).toBe(true);
    });

    it('drops everyone off at their own floor in every scenario', () => {
        for (const s of buildScenarios()) {
            const persons: Person[] = [];
            const elevator = new Elevator({ ...s.options });
            const add = ([from, to]: [number, number]) => {
                const p = new Person(from, to);
                persons.push(p);
                elevator.callElevator(p);
            };
            // The elevator's floor is only visible through the rendered floors.
            let elevatorFloor = s.options.currentElevatorFloor;
            elevator.setUpdaterFunc(floors => {
                const i = floors.findIndex(f => f !== undefined && f.State !== 0 && f.State !== 2);
                if (i !== -1) elevatorFloor = i;
            });

            s.persons.forEach(add);
            for (let t = 0; t < 2000 && (t < 80 || persons.some(p => p.State !== PersonType.Done)); t++) {
                s.additions.get(t)?.forEach(add);
                const wasDone = persons.map(p => p.State === PersonType.Done);
                elevator.processing();
                persons.forEach((p, i) => {
                    if (!wasDone[i] && p.State === PersonType.Done) {
                        expect(p.Destination, `${s.name}: person ${i}`).toBe(elevatorFloor);
                    }
                });
                vi.advanceTimersByTime(500);
            }
            expect(persons.every(p => p.State === PersonType.Done), s.name).toBe(true);
        }
    });
});
