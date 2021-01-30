import { FloorType } from '../../types/FloorType';
import { MoveDirection } from '../../types/MoveDirection';
import { ElevatorStorage } from './ElevatorStorage';

interface ElevatorMoverInterface {
    chooseMoveAndGo(floor: number): void
}

export class ElevatorMover implements ElevatorMoverInterface {

    private storage: ElevatorStorage;

    constructor(storage: ElevatorStorage) {
        this.storage = storage;
    }

    public chooseMoveAndGo(floor: number) {
        const currentFloor = this.storage.CurrentFloor;
        if (floor < currentFloor) {
            this.move(MoveDirection.Down);
        } else if (floor > currentFloor) {
            this.move(MoveDirection.Up);
        } else if (floor === currentFloor) {
            return;
        }
    }

    private move(dir: MoveDirection) {
        const prevFloor = this.storage.CurrentFloor;
        this.fillPrevFloor(prevFloor);

        this.changeFloorByDirection(dir);
        
        const floorAfterChange = this.storage.CurrentFloor;
        this.fillCurrentFloor(floorAfterChange);
    }

    private fillPrevFloor(floorBeforeMove: number) {
        let i = floorBeforeMove;
        if (this.storage.floors[i].AwatingPersonCount) {
            this.storage.floors[i].State = FloorType.PersonAwaiting;
        } else {
            this.storage.floors[i].State = FloorType.EmptyFloor;
        }
        this.storage.floors[i].GoingPersonCount = 0;
    }

    private changeFloorByDirection(dir: MoveDirection) {
        dir === MoveDirection.Down ? this.storage.decrementCurrentFloor() : this.storage.incrementCurrentFloor();
    }

    private fillCurrentFloor(floorAfterMove: number) {
        let i = floorAfterMove;
        if (this.storage.goingPersons.length === 0) {
            this.storage.floors[i].State = FloorType.EmptyElevator;
        }
        if (this.storage.goingPersons.length > 0) {
            this.storage.floors[i].State = FloorType.PersonInElevator;
            this.storage.floors[i].GoingPersonCount = this.storage.goingPersons.length;
        }
    }

}