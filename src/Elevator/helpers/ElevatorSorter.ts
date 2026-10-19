import { Person } from '../../types/Person';
import { ElevatorStorage } from './ElevatorStorage';

type FloorKey = 'CurrentFloor' | 'Destination';

export class ElevatorSorter {

    private storage: ElevatorStorage;

    constructor(storage: ElevatorStorage) {
        this.storage = storage;
    }

    // Riders: serve the side with more destinations first, nearest-first along the
    // ascending/descending order. On a tie the order is left as it is.
    public defineSortOrderForDelivery() {
        const balance = this.countAboveMinusBelow(this.storage.goingPersons, 'Destination');
        if (balance !== 0) {
            sortByKey(this.storage.goingPersons, 'Destination', balance > 0 ? 1 : -1);
        }
    }

    // Callers: go to the extreme floor on the side with more callers first
    // (extreme points priority). On a tie the order is left as it is.
    public defineSortOrderForTargeting() {
        const balance = this.countAboveMinusBelow(this.storage.awatingPersons, 'CurrentFloor');
        if (balance !== 0) {
            sortByKey(this.storage.awatingPersons, 'CurrentFloor', balance > 0 ? -1 : 1);
        }
    }

    // Persons above the elevator minus persons below it; persons on its floor don't count.
    private countAboveMinusBelow(persons: Person[], key: FloorKey) {
        const current = this.storage.CurrentFloor;
        let balance = 0;
        for (const p of persons) {
            const floor = p[key] as number;
            if (floor > current) balance++;
            else if (floor < current) balance--;
        }
        return balance;
    }
}

// Stable in-place sort: 1 = ascending, -1 = descending.
function sortByKey(persons: Person[], key: FloorKey, direction: 1 | -1) {
    persons.sort((a, b) => direction * ((a[key] as number) - (b[key] as number)));
}
