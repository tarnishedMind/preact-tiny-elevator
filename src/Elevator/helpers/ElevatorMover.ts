import { MoveDirection } from '../../types/MoveDirection';
import { FloorType } from '../../types/FloorType';
import { ElevatorStaticStorage } from './ElevatorStaticStorage';

const Storage = ElevatorStaticStorage;

interface ElevatorMoverInterface {
    chooseMoveAndGo(floor: number): void
}

export class ElevatorMover implements ElevatorMoverInterface {

    public chooseMoveAndGo(floor: number) {
        const currentFloor = Storage.getCurrentFloor();
        if (floor < currentFloor) {
            this.move(MoveDirection.Down);
        } else if (floor > currentFloor) {
            this.move(MoveDirection.Up);
        } else if (floor === currentFloor) {
            return;
        }
    }

    private move(dir: MoveDirection) {
        const prevFloor = Storage.getCurrentFloor();
        this.fillPrevFloor(prevFloor);

        this.changeFloorByDirection(dir);
        
        const floorAfterChange = Storage.getCurrentFloor();
        this.fillCurrentFloor(floorAfterChange);
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

    private changeFloorByDirection(dir: MoveDirection) {
        dir === MoveDirection.Down ? Storage.decrementCurrentFloor() : Storage.incrementCurrentFloor();
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