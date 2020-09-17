import { Person } from '../types/Person';

enum SortDirection {
    Ascending,
    Descending
}

export function sortPersonAscendingByKey(arr: Person[], key: keyof Person) {
    sortPersonByDirectionAndByKey(arr, SortDirection.Ascending, key)
}

export function sortPersonDescendingByKey(arr: Person[], key: keyof Person) {
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