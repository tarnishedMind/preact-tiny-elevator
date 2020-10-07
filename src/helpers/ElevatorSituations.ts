import { Person } from '../types/Person';
import { Situation } from '../types/Situation';

export class TestSituation {
    public static get(n: number) {
        return data[n];
    }
}

const data: Situation[] = [
    {
        options: {
            currentElevatorFloor: 10,
            floorCount: 10,
            starterFloor: 1,
            capacity: 4
        },
        persons: [
            new Person(3, 10),
            new Person(3, 10),
            new Person(3, 6),
            new Person(3, 8),
            new Person(1, 5),
            new Person(3, 5),
        ]
    },
    {
        options: {
            currentElevatorFloor: 1,
            floorCount: 10,
            starterFloor: 1,
            capacity: 4
        },
        persons: [
            new Person(8, 1),
            new Person(8, 1),
            new Person(8, 5),
            new Person(8, 3),
            new Person(10, 6),
            new Person(8, 6)
        ]
    },
];
