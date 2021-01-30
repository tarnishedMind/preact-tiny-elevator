import { ElevatorOptions } from '../../types/ElevatorOptions';
import { Floor } from '../../types/Floor';
import { FloorType } from '../../types/FloorType';
import { Person } from '../../types/Person';
import { PersonType } from '../../types/PersonType';

interface ElevatorStorageInterface {
    
}

export class ElevatorStorage implements ElevatorStorageInterface {    
    public floors: Floor[];
    public awatingPersons: Array<Person>;
    public goingPersons: Array<Person>;

    private _capacity: number;
    private _currentFloor: number;
    private _floorCount: number;
    private _starterFloor: number;

    private _updaterFunc: (floors: Floor[]) => void = () => {};

    public constructor(options: ElevatorOptions) {
        this._capacity = options.capacity;

        this._currentFloor = options.currentElevatorFloor;
        this._floorCount = options.floorCount;
        this._starterFloor = options.starterFloor;
        
        this.floors = new Array<Floor>(this._floorCount);
        this.awatingPersons = new Array<Person>();
        this.goingPersons = new Array<Person>();
    }

    public set UpdaterFunc(func: (floors: Floor[]) => void) {
        this._updaterFunc = func;
    }

    public updateState(): void {
        this._updaterFunc(this.floors);
    }

    public get Capacity(): number {
        return this._capacity;
    }

    public get CurrentFloor(): number {
        return this._currentFloor;
    }

    public incrementCurrentFloor() {
        this._currentFloor++;
    }

    public decrementCurrentFloor() {
        this._currentFloor--;
    }

    public initFloors(): void {
        for (let i =  this._starterFloor; i <  this._floorCount + 1; i++) {
            this.floors[i] = new Floor();

            if (i === this._currentFloor) {
                this.floors[i].State = FloorType.EmptyElevator;
            } else {
                this.floors[i].State = FloorType.EmptyFloor;
            }
        }
    }

    public addPersonByState(p: Person): void {
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