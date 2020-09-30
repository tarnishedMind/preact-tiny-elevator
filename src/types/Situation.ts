import { ElevatorOptions } from './ElevatorOptions';
import { Person } from './Person';

export type Situation = {
    options: ElevatorOptions,
    persons: Array<Person>
}