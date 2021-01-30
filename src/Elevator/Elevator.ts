import { NOT_TARGET } from '../constants';
import { Queue } from "../helpers/Queue";
import { ElevatorOptions } from '../types/ElevatorOptions';
import { Floor } from "../types/Floor";
import { Person } from "../types/Person";
import { ElevatorLoader } from './helpers/ElevatorLoader';
import { ElevatorMover } from './helpers/ElevatorMover';
import { ElevatorSorter } from './helpers/ElevatorSorter';
import { ElevatorStorage } from './helpers/ElevatorStorage';

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
    
    private storage: ElevatorStorage;
    private mover: ElevatorMover;
    private loader: ElevatorLoader;
    private sorter: ElevatorSorter;

    constructor(options: ElevatorOptions) {
        this.storage = new ElevatorStorage(options);
        this.storage.initFloors();
        this.callQueue = new Queue<number>();
        
        this.mover = new ElevatorMover(this.storage);
        this.loader = new ElevatorLoader(this.storage, () => this.clearTargetFloor());
        this.sorter = new ElevatorSorter(this.storage);
    }

    public updateState(): void {
        this.storage.updateState();
    }

    public callElevator(p: Person) {
        this.storage.addPersonByState(p);
        this.storage.updateState();
    }    

    public processing() {
        this.updateCallQueue();
        this.countTargetFloor();

        if (this.targetFloor !== NOT_TARGET) {
            this.mover.chooseMoveAndGo(this.targetFloor);
            
            if (this.storage.goingPersons.length) {
                this.loader.loadElevator(this.storage.CurrentFloor);
            } else {
                this.loader.loadElevator(this.targetFloor);
            }
            
            this.loader.unloadElevator(this.targetFloor);
        }        

        this.storage.updateState();
        this.log();
    }

    public setUpdaterFunc(func: (floors: Floor[]) => void) {
        this.storage.UpdaterFunc = func;
    }

    private updateCallQueue() {
        this.callQueue.clear();
        this.sorter.defineSortOrderForTargeting(); // sort for extreme points priority
        this.storage.awatingPersons.forEach(p => this.callQueue.uniqueAdd(p.CurrentFloor as number));
    }

    private countTargetFloor() {
        if (this.targetFloor === NOT_TARGET && this.storage.awatingPersons.length > 0 && this.storage.goingPersons.length === 0) {
            const first = this.callQueue.extract() as number;
            this.lastCallQueue = first;
            this.targetFloor = first;
        }

        if (this.storage.goingPersons.length > 0) {
            this.sorter.defineSortOrderForDelivery();
            this.targetFloor = this.storage.goingPersons[0].Destination as number;
        }
    }

    private clearTargetFloor() {
        this.targetFloor = NOT_TARGET;
    }

    private log() {
        console.log('=== === === === ===');

        console.log('Floors:', this.storage.floors);
        console.log('Call Queue:', this.callQueue);
        console.log('Awating Persons:', this.storage.awatingPersons);
        console.log('Going Persons:', this.storage.goingPersons);

        console.log('Target Floor: ', this.targetFloor);
        console.log('Current Elevator Floor: ', this.storage.CurrentFloor);
    }
}



