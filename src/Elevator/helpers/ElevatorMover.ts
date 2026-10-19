import { FloorType } from '../../types/FloorType';
import { ElevatorStorage } from './ElevatorStorage';

export class ElevatorMover {

    private storage: ElevatorStorage;

    constructor(storage: ElevatorStorage) {
        this.storage = storage;
    }

    // Moves the elevator one floor towards `floor`, if it isn't there already.
    public chooseMoveAndGo(floor: number) {
        const { floors, goingPersons } = this.storage;
        const current = this.storage.CurrentFloor;
        if (floor === current) {
            return;
        }

        const left = floors[current];
        left.State = left.AwatingPersonCount ? FloorType.PersonAwaiting : FloorType.EmptyFloor;
        left.GoingPersonCount = 0;

        this.storage.moveBy(floor > current ? 1 : -1);

        const reached = floors[this.storage.CurrentFloor];
        if (goingPersons.length > 0) {
            reached.State = FloorType.PersonInElevator;
            reached.GoingPersonCount = goingPersons.length;
        } else {
            reached.State = FloorType.EmptyElevator;
        }
    }
}
