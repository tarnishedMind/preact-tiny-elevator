import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestSituation } from '../../helpers/ElevatorSituations';
import { Person } from '../../types/Person';
import { PersonType } from '../../types/PersonType';
import { Elevator } from '../Elevator';

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
});
