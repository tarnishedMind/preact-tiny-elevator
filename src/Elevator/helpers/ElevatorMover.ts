import { MoveDirection } from '../../types/MoveDirection';
import { FloorType } from '../../types/FloorType';
import { ElevatorStaticStorage } from './ElevatorStaticStorage';

const Storage = ElevatorStaticStorage;

interface ElevatorMoverInterface {
    chooseMoveAndGo(floor: number): void
}

export class ElevatorMover implements ElevatorMoverInterface {

    public chooseMoveAndGo(floor: number) {
        if (floor < Storage.currentFloor) {
            this.move(MoveDirection.Down);
        } else if (floor > Storage.currentFloor) {
            this.move(MoveDirection.Up);
        } else if (floor === Storage.currentFloor) {
            return;
        }
    }

    private move(dir: MoveDirection) {
        this.fillPrevFloor(Storage.currentFloor);
        this.calculateFloor(dir);
        this.fillCurrentFloor(Storage.currentFloor);
    }

    private fillPrevFloor(floorBeforeMove: number) {
        let i = floorBeforeMove;
        if (Storage.floors[i].AwatingPersonCount) {
            Storage.floors[i].State = FloorType.PersonAwaiting;
        } else {
            Storage.floors[i].State = FloorType.EmptyFloor;
        }
        Storage.floors[i].GoingPersonCount = 0;
    }

    private calculateFloor(dir: MoveDirection) {
        dir === MoveDirection.Down ? Storage.currentFloor-- : Storage.currentFloor++;
    }

    private fillCurrentFloor(floorAfterMove: number) {
        let i = floorAfterMove;
        if (Storage.goingPersons.length === 0) {
            Storage.floors[i].State = FloorType.EmptyElevator;
        }
        if (Storage.goingPersons.length > 0) {
            Storage.floors[i].State = FloorType.PersonInElevator;
            Storage.floors[i].GoingPersonCount = Storage.goingPersons.length;
        }
    }

}