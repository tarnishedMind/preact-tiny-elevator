import { Floor } from '../../types/Floor';
import { Person } from '../../types/Person';

export class ElevatorStaticStorage {
    public static currentFloor: number;

    public static floors: Floor[];
    public static awatingPersons: Array<Person>;
    public static goingPersons: Array<Person>;
}