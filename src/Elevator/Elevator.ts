import { NOT_TARGET } from '../constants';
import { defineSortOrderForDelivery, defineSortOrderForTargeting } from '../helpers/PersonSorter';
import { Queue } from "../helpers/Queue";
import { ElevatorOptions } from "../types/ElevatorOptions";
import { Floor } from "../types/Floor";
import { Person } from "../types/Person";
import { ElevatorLoader } from './helpers/ElevatorLoader';
import { ElevatorMover } from './helpers/ElevatorMover';
import { ElevatorStaticStorage } from './helpers/ElevatorStaticStorage';

const Storage = ElevatorStaticStorage;

interface ElevatorInterface {
    callElevator(p: Person): void,
    processing(): void,
    setUpdaterFunc(
        func: (floors: Floor[]) => void
    ): void
}

export class Elevator implements ElevatorInterface {  
    private targetFloor = NOT_TARGET;
    private callQueue: Queue<number>;
    private lastCallQueue: number = NOT_TARGET;
    
    private mover = new ElevatorMover();
    private loader = new ElevatorLoader(() => { this.clearTargetFloor() });

    constructor(options: ElevatorOptions) {
        Storage.initOptions(options);
        Storage.initFloors();
        this.callQueue = new Queue<number>();        
    }

    public callElevator(p: Person) {
        Storage.addPersonByState(p);
        Storage.updateState();
    }    

    public processing() {
        this.updateCallQueue();
        this.countTargetFloor();

        if (this.targetFloor !== NOT_TARGET) {
            this.mover.chooseMoveAndGo(this.targetFloor);
            
            if (Storage.goingPersons.length) {
                this.loader.loadElevator(Storage.getCurrentFloor());
            } else {
                this.loader.loadElevator(this.targetFloor);
            }
            
            this.loader.unloadElevator(this.targetFloor);
        }        

        Storage.updateState();
        this.log();
    }

    public setUpdaterFunc(func: (floors: Floor[]) => void) {
        Storage.setUpdaterFunc(func);
    }

    private updateCallQueue() {
        this.callQueue.clear();
        defineSortOrderForTargeting(); // sort for extreme points priority
        Storage.awatingPersons.forEach(p => this.callQueue.uniqueAdd(p.CurrentFloor as number));
    }

    private countTargetFloor() {
        if (this.targetFloor === NOT_TARGET && Storage.awatingPersons.length > 0 && Storage.goingPersons.length === 0) {
            const first = this.callQueue.extract() as number;
            this.lastCallQueue = first;
            this.targetFloor = first;
        }

        if (Storage.goingPersons.length > 0) {
            defineSortOrderForDelivery();
            this.targetFloor = Storage.goingPersons[0].Destination as number;
        }
    }

    private clearTargetFloor() {
        this.targetFloor = NOT_TARGET;
    }

    private log() {
        console.log('=== === === === ===');

        console.log('Floors:', Storage.floors);
        console.log('Call Queue:', this.callQueue);
        console.log('Awating Persons:', Storage.awatingPersons);
        console.log('Going Persons:', Storage.goingPersons);

        console.log('Target Floor: ', this.targetFloor);
        console.log('Current Elevator Floor: ', Storage.getCurrentFloor());
    }
}



