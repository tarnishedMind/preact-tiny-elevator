import { ElevatorOptions } from './types/ElevatorOptions';
import { Floor } from "./types/Floor";
import { FloorType } from "./types/FloorType";
import { MoveDirection } from "./types/MoveDirection";
import { Person } from "./types/Person";
import { PersonType } from "./types/PersonType";
import { Queue } from "./types/Queue";
import { sortPersonAscendingByKey, sortPersonDescendingByKey } from './utils/PersonSorter';

const NOT_TARGET = -1;

interface ElevatorInterface {
    callElevator(p: Person): void,
    processing(): void,
    setUpdaterFunc(func: (floors: Floor[]) => void): void
}

export class Elevator implements ElevatorInterface {
    private targetFloor: number = NOT_TARGET;
    private currentFloor: number;
    private floorCount: number;
    private starterFloor: number;
    private capacity: number;
    private floors: Floor[];
    private callQueue: Queue<number>
    private awatingPersons: Array<Person>;
    private goingPersons: Array<Person>;
    private updaterFunc: (floors: Floor[]) => void;

    constructor(options: ElevatorOptions) {
        this.currentFloor = options.currentElevatorFloor;
        this.floorCount = options.floorCount;
        this.starterFloor = options.starterFloor;
        this.capacity = options.capacity;
        this.floors = new Array<Floor>(this.floorCount);
        this.callQueue = new Queue<number>();
        this.awatingPersons = new Array<Person>();
        this.goingPersons = new Array<Person>();
        this.updaterFunc = ([]) => { };

        this.initFloors();
    }

    public callElevator(p: Person) {
        this.addPersonByState(p);
        this.updateState();
    }

    public processing() {
        this.updateCallQueue();
        this.countTargetFloor();

        if (this.targetFloor !== NOT_TARGET) {
            this.chooseMoveAndGo(this.targetFloor);
            this.loadElevator(this.currentFloor); // pass for sync ?
            this.unloadElevator(this.currentFloor); // pass for sync ?
        }

        this.updateState();
        this.log();
    }

    public setUpdaterFunc(func: (floors: Floor[]) => void) {
        this.updaterFunc = func;
    }

    private updateState() {
        this.updaterFunc(this.floors);
    }

    private updateCallQueue() {
        this.callQueue.clear();
        this.awatingPersons.forEach(p => this.callQueue.uniqueAdd(p.CurrentFloor as number));
    }

    private countTargetFloor() {
        if (this.targetFloor === NOT_TARGET && this.awatingPersons.length > 0 && this.goingPersons.length === 0) {
            this.targetFloor = this.callQueue.extract() as number;
        }     
        if (this.goingPersons.length > 0) {
            this.defineSortOrder();
            this.targetFloor = this.goingPersons[0].Destination as number;
            // OR CHECK AWATING NEAR ?
        }
    }

    private defineSortOrder() {
        let lessThanCurCount = 0;
        let moreThanCurCount = 0;

        this.goingPersons.forEach(p => {
            if (p.Destination as number > this.currentFloor) {
                moreThanCurCount++;
            } else if (p.Destination as number < this.currentFloor) {
                lessThanCurCount++;
            }
        });

        if (moreThanCurCount > lessThanCurCount) {
            sortPersonAscendingByKey(this.goingPersons, 'Destination');
        } else if (lessThanCurCount > moreThanCurCount) {
            sortPersonDescendingByKey(this.goingPersons, 'Destination');
        } else if (lessThanCurCount === moreThanCurCount) {
            // ? check this for awating people - pass awating, sort going
            // if counts equals after that still chec random direction 
        }
    }

    private chooseMoveAndGo(floor: number) {
        if (floor < this.currentFloor) {
            this.move(MoveDirection.Down);
        } else if (floor > this.currentFloor) {
            this.move(MoveDirection.Up);
        } else if (floor === this.currentFloor) {
            return;
        }
    }

    private loadElevator(floor: number) {
        if (floor === this.currentFloor && this.floors[floor].AwatingPersonCount > 0 && this.isFreePlace()) {
            this.loadElevatorByFloor(floor);
        }
    }

    private unloadElevator(floor: number) {
        if (floor === this.currentFloor && this.floors[floor].GoingPersonCount > 0) {
            this.unloadElevatorByFloor(floor);
        }
    }

    private move(dir: MoveDirection) {
        this.fillPrevFloor(this.currentFloor);
        this.calculateFloor(dir);
        this.fillCurrentFloor(this.currentFloor);
    }

    private calculateFloor(dir: MoveDirection) {
        dir === MoveDirection.Down ? this.currentFloor-- : this.currentFloor++;
    }

    private fillPrevFloor(floorBeforeMove: number) {
        let i = floorBeforeMove;
        if (this.floors[i].AwatingPersonCount) {
            this.floors[i].State = FloorType.PersonAwaiting;
        } else {
            this.floors[i].State = FloorType.EmptyFloor;
        }
        this.floors[i].GoingPersonCount = 0;
    }

    private fillCurrentFloor(floorAfterMove: number) {
        let i = floorAfterMove;
        if (this.goingPersons.length === 0) {
            this.floors[i].State = FloorType.EmptyElevator;
        }
        if (this.goingPersons.length > 0) {
            this.floors[i].State = FloorType.PersonInElevator;
            this.floors[i].GoingPersonCount = this.goingPersons.length;
        }
    }

    private isFreePlace() {
        return this.goingPersons.length < this.capacity;
    }

    private loadElevatorByFloor(floor: number) {
        for (let i = 0; i < this.awatingPersons.length; i++) {
            const p = this.awatingPersons[i];

            if (p.CurrentFloor === floor && this.isFreePlace()) {
                p.State = PersonType.InElevator;
                this.addPersonByState(p);

                this.floors[floor].AwatingPersonCount--;
                this.awatingPersons.splice(i, 1);
                i--;
            }
        }
    }

    private unloadElevatorByFloor(flidx: number) {
        for (let i = 0; i < this.goingPersons.length; i++) {
            const p = this.goingPersons[i];

            if (p.Destination === flidx) {
                this.floors[flidx].GoingPersonCount--;
                this.floors[flidx].ArrivedPersonCountTotal++;

                if (this.floors[flidx].GoingPersonCount === 0) {
                    this.floors[flidx].State = FloorType.EmptyElevator;
                }

                const arrived = this.goingPersons.splice(0, 1)[0];
                arrived.State = PersonType.Done;
                console.log(arrived, ' --- Was arrived! --- ');

                this.targetFloor = NOT_TARGET;
            }
        }
    }

    private addPersonByState(p: Person) {
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

    private initFloors(): void {
        for (let i = this.starterFloor; i < this.floorCount + 1; i++) {
            this.floors[i] = new Floor();

            if (i === this.currentFloor) {
                this.floors[i].State = FloorType.EmptyElevator;
            } else {
                this.floors[i].State = FloorType.EmptyFloor;
            }
        }
    }

    private log() {
        console.log('=== === === === ===');

        console.log('Floors:', this.floors);
        console.log('Call Queue:', this.callQueue);
        console.log('Awating Persons:', this.awatingPersons);
        console.log('Going Persons:', this.goingPersons);

        console.log('Target Floor: ', this.targetFloor);
        console.log('Current Elevator Floor: ', this.currentFloor);
    }
}



