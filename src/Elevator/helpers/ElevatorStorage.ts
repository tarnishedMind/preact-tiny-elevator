import { ElevatorOptions } from '../../types/ElevatorOptions';
import { Floor } from '../../types/Floor';
import { FloorType } from '../../types/FloorType';
import { Person } from '../../types/Person';
import { PersonType } from '../../types/PersonType';

export class ElevatorStorage {
    // Indexed by floor number; indexes below starterFloor stay empty.
    public readonly floors: Floor[];
    public readonly awatingPersons: Person[] = [];
    public readonly goingPersons: Person[] = [];

    private readonly _capacity: number;
    private readonly _floorCount: number;
    private readonly _starterFloor: number;
    private _currentFloor: number;

    private _updaterFunc: (floors: Floor[]) => void = () => {};

    public constructor(options: ElevatorOptions) {
        this._capacity = options.capacity;
        this._currentFloor = options.currentElevatorFloor;
        this._floorCount = options.floorCount;
        this._starterFloor = options.starterFloor;

        this.floors = new Array<Floor>(this._floorCount);
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

    public get FreePlaces(): number {
        return this._capacity - this.goingPersons.length;
    }

    public get CurrentFloor(): number {
        return this._currentFloor;
    }

    public moveBy(delta: 1 | -1): void {
        this._currentFloor += delta;
    }

    public initFloors(): void {
        for (let i = this._starterFloor; i <= this._floorCount; i++) {
            const floor = new Floor();
            floor.State = i === this._currentFloor ? FloorType.EmptyElevator : FloorType.EmptyFloor;
            this.floors[i] = floor;
        }
    }

    public addPersonByState(p: Person): void {
        const floor = this.floors[p.CurrentFloor as number];

        if (p.State === PersonType.Awaiting || p.State === undefined) {
            this.awatingPersons.push(p);
            floor.State = FloorType.PersonAwaiting;
            floor.AwatingPersonCount++;
        } else if (p.State === PersonType.InElevator) {
            this.goingPersons.push(p);
            floor.State = FloorType.PersonInElevator;
            floor.GoingPersonCount++;
        }
    }
}
