import { Person } from '../../types/Person';
import { ElevatorStorage } from './ElevatorStorage';

enum SortDirection {
    Ascending,
    Descending
}

export class ElevatorSorter {

    private storage: ElevatorStorage;

    constructor(storage: ElevatorStorage) {
        this.storage = storage;
    }

    public defineSortOrderForDelivery() {
        const { lessThanKeyCount, moreThanKeyCount } = this.getPersonCountByFloors(this.storage.goingPersons, 'Destination')

        if (moreThanKeyCount > lessThanKeyCount) {
            this.sortPersonAscendingByKey(this.storage.goingPersons, 'Destination');
        } else if (lessThanKeyCount > moreThanKeyCount) {
            this.sortPersonDescendingByKey(this.storage.goingPersons, 'Destination');
        } else if (lessThanKeyCount === moreThanKeyCount) {
            // pass persons to this func and check this for awating people - pass awating, sort going
            // if counts equals after that still check random direction
            console.log('ForDelivery - lessThanCurCount === moreThanCurCount');
        }
    }

    public defineSortOrderForTargeting() {
        const { lessThanKeyCount, moreThanKeyCount } = this.getPersonCountByFloors(this.storage.awatingPersons, 'CurrentFloor')

        if (moreThanKeyCount > lessThanKeyCount) {
            this.sortPersonDescendingByKey(this.storage.awatingPersons, 'CurrentFloor');
        } else if (lessThanKeyCount > moreThanKeyCount) {
            this.sortPersonAscendingByKey(this.storage.awatingPersons, 'CurrentFloor');
        } else if (lessThanKeyCount === moreThanKeyCount) {
            console.log('defineSortOrderForTargeting - lessThanCurCount === moreThanCurCount');
        }
    }

    private sortPersonAscendingByKey(arr: Person[], key: keyof Person) {
        this.sortPersonByDirectionAndByKey(arr, SortDirection.Ascending, key)
    }

    private sortPersonDescendingByKey(arr: Person[], key: keyof Person) {
        this.sortPersonByDirectionAndByKey(arr, SortDirection.Descending, key)
    }

    private sortPersonByDirectionAndByKey(arr: Person[], dir: SortDirection, key: keyof Person) {
        arr.sort((_a, _b) => {
            const a = _a[key] as number;
            const b = _b[key] as number;

            if (dir === SortDirection.Ascending) {
                return this.ascendingOption(a, b);
            }
            if (dir === SortDirection.Descending) {
                return this.descendingOption(a, b);
            }
            return 0;
        });
    }

    private ascendingOption(a: number, b: number) {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    }

    private descendingOption(a: number, b: number) {
        if (a < b) return 1;
        if (a > b) return -1;
        return 0;
    }

    private getPersonCountByFloors(persons: Person[], floorKey: keyof Person) {
        let countObject = {
            lessThanKeyCount: 0,
            moreThanKeyCount: 0
        }
        persons.forEach(p => {
            if (p[floorKey] as number > this.storage.CurrentFloor) {
                countObject.moreThanKeyCount++;
            } else if (p[floorKey] as number < this.storage.CurrentFloor) {
                countObject.lessThanKeyCount++;
            }
        });
        return countObject;
    }
}