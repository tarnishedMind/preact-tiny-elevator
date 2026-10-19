import { NOT_TARGET } from '../constants';
import { ElevatorOptions } from '../types/ElevatorOptions';
import { Floor } from '../types/Floor';
import { Person } from '../types/Person';
import { ElevatorLoader } from './helpers/ElevatorLoader';
import { ElevatorMover } from './helpers/ElevatorMover';
import { ElevatorSorter } from './helpers/ElevatorSorter';
import { ElevatorStorage } from './helpers/ElevatorStorage';

export class Elevator {
    private targetFloor = NOT_TARGET;

    private storage: ElevatorStorage;
    private mover: ElevatorMover;
    private loader: ElevatorLoader;
    private sorter: ElevatorSorter;

    constructor(options: ElevatorOptions) {
        this.storage = new ElevatorStorage(options);
        this.storage.initFloors();

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

    // One simulation step: pick a target, move one floor, board and drop off.
    public processing() {
        this.sorter.defineSortOrderForTargeting(); // sort for extreme points priority
        this.countTargetFloor();

        if (this.targetFloor !== NOT_TARGET) {
            this.mover.chooseMoveAndGo(this.targetFloor);

            // With riders aboard, pick up callers on the way; otherwise only at the target.
            const hasRiders = this.storage.goingPersons.length > 0;
            this.loader.loadElevator(hasRiders ? this.storage.CurrentFloor : this.targetFloor);
            this.loader.unloadElevator(this.targetFloor);
        }

        this.storage.updateState();
    }

    public setUpdaterFunc(func: (floors: Floor[]) => void) {
        this.storage.UpdaterFunc = func;
    }

    private countTargetFloor() {
        const { awatingPersons, goingPersons } = this.storage;

        if (goingPersons.length > 0) {
            this.sorter.defineSortOrderForDelivery();
            this.targetFloor = goingPersons[0].Destination as number;
        } else if (this.targetFloor === NOT_TARGET && awatingPersons.length > 0) {
            // The first caller in targeting order.
            this.targetFloor = awatingPersons[0].CurrentFloor as number;
        }
    }

    private clearTargetFloor() {
        this.targetFloor = NOT_TARGET;
    }
}
