import { Person } from '../types/Person';
import { ElevatorStaticStorage } from '../Elevator/helpers/ElevatorStaticStorage';

enum SortDirection {
    Ascending,
    Descending
}

const Storage = ElevatorStaticStorage;

export function defineSortOrderForDelivery() {
    const {lessThanKeyCount, moreThanKeyCount} = getPersonCountByFloors(Storage.goingPersons, 'Destination')

    if (moreThanKeyCount > lessThanKeyCount) {
        sortPersonAscendingByKey(Storage.goingPersons, 'Destination');
    } else if (lessThanKeyCount > moreThanKeyCount) {
        sortPersonDescendingByKey(Storage.goingPersons, 'Destination');
    } else if (lessThanKeyCount === moreThanKeyCount) {
        // pass persons to this func and check this for awating people - pass awating, sort going
        // if counts equals after that still check random direction
        console.log('ForDelivery - lessThanCurCount === moreThanCurCount');
    }
}

export function defineSortOrderForTargeting() {
    const {lessThanKeyCount, moreThanKeyCount} = getPersonCountByFloors(Storage.awatingPersons, 'CurrentFloor')

    if (moreThanKeyCount > lessThanKeyCount) {
        sortPersonDescendingByKey(Storage.awatingPersons, 'CurrentFloor');
    } else if (lessThanKeyCount > moreThanKeyCount) {
        sortPersonAscendingByKey(Storage.awatingPersons, 'CurrentFloor');
    } else if (lessThanKeyCount === moreThanKeyCount) {
        console.log('defineSortOrderForTargeting - lessThanCurCount === moreThanCurCount');
    }
}  

function sortPersonAscendingByKey(arr: Person[], key: keyof Person) {
    sortPersonByDirectionAndByKey(arr, SortDirection.Ascending, key)
}

function sortPersonDescendingByKey(arr: Person[], key: keyof Person) {
    sortPersonByDirectionAndByKey(arr, SortDirection.Descending, key)
}

function sortPersonByDirectionAndByKey(arr: Person[], dir: SortDirection, key: keyof Person) {
    arr.sort((_a, _b) => {
        const a = _a[key] as number;
        const b = _b[key] as number;

        if (dir === SortDirection.Ascending) {
            return ascendingOption(a, b);
        }
        if (dir === SortDirection.Descending) {
            return descendingOption(a, b);
        }
        return 0;
    });
}

function ascendingOption(a: number, b: number) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}

function descendingOption(a: number, b: number) {
    if (a < b) return 1;
    if (a > b) return -1;
    return 0;
}

function getPersonCountByFloors(persons: Person[], floorKey: keyof Person) {
    let countObject = {
        lessThanKeyCount: 0,
        moreThanKeyCount: 0
    }
    persons.forEach(p => {
        if (p[floorKey] as number > Storage.currentFloor) {
            countObject.moreThanKeyCount++;
        } else if (p[floorKey] as number < Storage.currentFloor) {
            countObject.lessThanKeyCount++;                
        }
    });
    return countObject;     
}