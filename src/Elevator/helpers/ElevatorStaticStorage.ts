import { ElevatorOptions } from '../../types/ElevatorOptions';
import { Floor } from '../../types/Floor';
import { FloorType } from '../../types/FloorType';
import { Person } from '../../types/Person';
import { PersonType } from '../../types/PersonType';

export class ElevatorStaticStorage { 
    public static capacity: number;

    public static floors: Floor[];
    public static awatingPersons: Array<Person>;
    public static goingPersons: Array<Person>;

    private static currentFloor: number;
    private static floorCount: number;
    private static starterFloor: number;

    private static updaterFunc: (floors: Floor[]) => void = () => {};

    public static initOptions(options: ElevatorOptions): void {
        this.currentFloor = options.currentElevatorFloor;
        this.floorCount = options.floorCount;
        this.starterFloor = options.starterFloor;
        this.capacity = options.capacity;
        
        this.floors = new Array<Floor>(this.floorCount);
        this.awatingPersons = new Array<Person>();
        this.goingPersons = new Array<Person>();
    }

    public static setUpdaterFunc(func: (floors: Floor[]) => void): void {
        this.updaterFunc = func;
    }

    public static updateState(): void {
        this.updaterFunc(this.floors);
    }

    public static getCurrentFloor(): number {
        return this.currentFloor;
    }

    public static incrementCurrentFloor() {
        this.currentFloor++;
    }

    public static decrementCurrentFloor() {
        this.currentFloor--;
    }

    public static initFloors(): void {
        for (let i =  this.starterFloor; i <  this.floorCount + 1; i++) {
            this.floors[i] = new Floor();

            if (i === this.currentFloor) {
                this.floors[i].State = FloorType.EmptyElevator;
            } else {
                this.floors[i].State = FloorType.EmptyFloor;
            }
        }
    }

    public static addPersonByState(p: Person): void {
        const i = p.CurrentFloor as number;

        if (p.State === PersonType.Awaiting || p.State === undefined) {
            this.awatingPersons.push(p);
            this.floors[i].State = FloorType.PersonAwaiting;
            this.floors[i].AwatingPersonCount++;
        } else if (p.State === PersonType.InElevator) {
            this.goingPersons.push(p);
            this.floors[i].State = FloorType.PersonInElevator;
            this.floors[i].GoingPersonCount++;
        }
    }    
}