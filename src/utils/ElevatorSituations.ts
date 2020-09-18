import { Person } from '../types/Person';
import { ElevatorOptions } from '../types/ElevatorOptions';

export class TestSituation_1 {
    public static options: ElevatorOptions = {
        currentElevatorFloor: 10,
        floorCount: 10,
        starterFloor: 1,
        capacity: 4
    } 

    public static getPersons(): Array<Person> {
        let persons = new Array<Person>();
 
        persons.push(new Person(3, 10));
        persons.push(new Person(3, 10));
        persons.push(new Person(3, 6));
        persons.push(new Person(3, 8));
        persons.push(new Person(1, 5));
        persons.push(new Person(3, 5));
    
        return persons;
    }
}

// invert for 1
export class TestSituation_2 {
    public static options: ElevatorOptions = {
        currentElevatorFloor: 1,
        floorCount: 10,
        starterFloor: 1,
        capacity: 4
    } 

    public static getPersons(): Array<Person> {
        let persons = new Array<Person>();
 
        persons.push(new Person(8, 1));
        persons.push(new Person(8, 1));
        persons.push(new Person(8, 5));
        persons.push(new Person(8, 3));
        persons.push(new Person(10, 6));
        persons.push(new Person(8, 6));
    
        return persons;
    }
}