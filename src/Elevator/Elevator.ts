import { ElevatorOptions } from "../types/ElevatorOptions";
import { Floor } from "../types/Floor";
import { FloorType } from "../types/FloorType";
import { MoveDirection } from "../types/MoveDirection";
import { Person } from "../types/Person";
import { PersonType } from "../types/PersonType";
import { Queue } from "../types/Queue";
import { sortPersonAscendingByKey, sortPersonDescendingByKey } from "../utils/PersonSorter";
import { ElevatorStaticStorage } from './helpers/ElevatorStaticStorage';
import { ElevatorMover } from './helpers/ElevatorMover';

const NOT_TARGET = -1;
const Storage = ElevatorStaticStorage;

interface ElevatorInterface {
    callElevator(p: Person): void,
    processing(): void,
    setUpdaterFunc(
        func: (floors: Floor[]) => void
    ): void
}

export class Elevator implements ElevatorInterface {
    private targetFloor: number = NOT_TARGET;
    // private currentFloor: number;
    private floorCount: number;
    private starterFloor: number;
    private capacity: number;    
    private callQueue: Queue<number>

    // private floors: Floor[];
    // private awatingPersons: Array<Person>;
    // private goingPersons: Array<Person>;

    private updaterFunc: (floors: Floor[]) => void;

    private lastCallQueue: number = NOT_TARGET;

    private mover = new ElevatorMover();

    constructor(options: ElevatorOptions) {
        Storage.currentFloor = options.currentElevatorFloor;
        this.floorCount = options.floorCount;
        this.starterFloor = options.starterFloor;
        this.capacity = options.capacity;        
        this.callQueue = new Queue<number>();

        Storage.floors = new Array<Floor>(this.floorCount);
        Storage.awatingPersons = new Array<Person>();
        Storage.goingPersons = new Array<Person>();

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
            this.mover.chooseMoveAndGo(this.targetFloor);
            
            if (Storage.goingPersons.length) {
                this.loadElevator(Storage.currentFloor);
            } else {
                this.loadElevator(this.targetFloor);
            }
            
            this.unloadElevator(this.targetFloor);
        }        

        this.updateState();
        this.log();
    }

    public setUpdaterFunc(func: (floors: Floor[]) => void) {
        this.updaterFunc = func;
    }

    private updateState() {
        this.updaterFunc(Storage.floors);
    }

    private updateCallQueue() {
        this.callQueue.clear();
        this.defineSortOrderForTargeting(); // sort for extreme points priority
        Storage.awatingPersons.forEach(p => this.callQueue.uniqueAdd(p.CurrentFloor as number));
    }

    private countTargetFloor() {
        if (this.targetFloor === NOT_TARGET && Storage.awatingPersons.length > 0 && Storage.goingPersons.length === 0) {
            const first = this.callQueue.extract() as number;
            this.lastCallQueue = first;
            this.targetFloor = first;
        }

        if (Storage.goingPersons.length > 0) {
            this.defineSortOrderForDelivery();
            this.targetFloor = Storage.goingPersons[0].Destination as number;
        }

        // if (Storage.goingPersons.length > 0) {
        //     this.defineSortOrderForDelivery();

        //     if (Storage.awatingPersons.length > 0 && this.isFreePlace() && this.isNearFromCurrentAndNotEmpty(this.lastCallQueue) 
        //     // && this.targetFloor !== this.lastCallQueue
        //     ) {
        //         this.targetFloor = this.lastCallQueue;
        //     } else {
        //         this.targetFloor = Storage.goingPersons[0].Destination as number;
        //     }
        // }
    }

    private isNearFromCurrentAndNotEmpty(floor: number) {
        return Math.abs(floor - Storage.currentFloor) <= 2 && Storage.floors[floor].State !== FloorType.EmptyFloor;
    }

    private getPersonCountByFloors(persons: Person[], floorKey: keyof Person) {
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

    private defineSortOrderForDelivery() {
        const {lessThanKeyCount, moreThanKeyCount} = this.getPersonCountByFloors(Storage.goingPersons, 'Destination')

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

    private defineSortOrderForTargeting() {
        const {lessThanKeyCount, moreThanKeyCount} = this.getPersonCountByFloors(Storage.awatingPersons, 'CurrentFloor')

        if (moreThanKeyCount > lessThanKeyCount) {
            sortPersonDescendingByKey(Storage.awatingPersons, 'CurrentFloor');
        } else if (lessThanKeyCount > moreThanKeyCount) {
            sortPersonAscendingByKey(Storage.awatingPersons, 'CurrentFloor');
        } else if (lessThanKeyCount === moreThanKeyCount) {
            console.log('defineSortOrderForTargeting - lessThanCurCount === moreThanCurCount');
        }
    }  

    private loadElevator(floor: number) {
        if (floor === Storage.currentFloor && Storage.floors[floor].AwatingPersonCount > 0 && this.isFreePlace()) {
            this.loadElevatorByFloor(floor);
        }
    }

    private unloadElevator(floor: number) {
        if (floor === Storage.currentFloor && Storage.floors[floor].GoingPersonCount > 0) {
            this.unloadElevatorByFloor(floor);
        }
    }  

    private isFreePlace() {
        return Storage.goingPersons.length < this.capacity;
    }

    private loadElevatorByFloor(floor: number) {
        for (let i = 0; i < Storage.awatingPersons.length; i++) {
            const p = Storage.awatingPersons[i];

            if (p.CurrentFloor === floor && this.isFreePlace()) {
                p.State = PersonType.InElevator;
                this.addPersonByState(p);

                Storage.floors[floor].AwatingPersonCount--;
                Storage.awatingPersons.splice(i, 1);
                i--;
            }
        }
    }

    private unloadElevatorByFloor(flidx: number) {
        for (let i = 0; i < Storage.goingPersons.length; i++) {
            const p = Storage.goingPersons[i];

            if (p.Destination === flidx) {
                Storage.floors[flidx].GoingPersonCount--;
                Storage.floors[flidx].ArrivedPersonCountView++;

                setTimeout(() => {
                    Storage.floors[flidx].ArrivedPersonCountView = 0;
                    this.updateState();
                }, 1000);

                if (Storage.floors[flidx].GoingPersonCount === 0) {
                    Storage.floors[flidx].State = FloorType.EmptyElevator;
                }

                const arrived = Storage.goingPersons.splice(0, 1)[0];
                arrived.State = PersonType.Done;
                console.log(arrived, ' --- Was arrived! --- ');

                this.targetFloor = NOT_TARGET;
            }
        }
    }

    private addPersonByState(p: Person) {
        const i = p.CurrentFloor as number;

        if (p.State === PersonType.Awaiting || p.State === undefined) {
            Storage.awatingPersons.push(p);
            Storage.floors[i].State = FloorType.PersonAwaiting;
            Storage.floors[i].AwatingPersonCount++;
        } else if (p.State === PersonType.InElevator) {
            Storage.goingPersons.push(p);
            Storage.floors[i].State = FloorType.PersonInElevator;
            Storage.floors[i].GoingPersonCount++;
        }
    }

    private initFloors(): void {
        for (let i = this.starterFloor; i < this.floorCount + 1; i++) {
            Storage.floors[i] = new Floor();

            if (i === Storage.currentFloor) {
                Storage.floors[i].State = FloorType.EmptyElevator;
            } else {
                Storage.floors[i].State = FloorType.EmptyFloor;
            }
        }
    }

    private log() {
        console.log('=== === === === ===');

        console.log('Floors:', Storage.floors);
        console.log('Call Queue:', this.callQueue);
        console.log('Awating Persons:', Storage.awatingPersons);
        console.log('Going Persons:', Storage.goingPersons);

        console.log('Target Floor: ', this.targetFloor);
        console.log('Current Elevator Floor: ', Storage.currentFloor);
    }
}



