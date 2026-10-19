import { FloorType } from '../../types/FloorType';
import { PersonType } from '../../types/PersonType';
import { ElevatorStorage } from './ElevatorStorage';

const ARRIVED_VIEW_MS = 1000;

export class ElevatorLoader {

    private targetClearer: () => void;
    private storage: ElevatorStorage;

    constructor(storage: ElevatorStorage, targetClearer: () => void) {
        this.targetClearer = targetClearer;
        this.storage = storage;
    }

    // Boards the callers waiting on `floor`, in call order, while there is room.
    public loadElevator(floor: number) {
        const { storage } = this;
        const waiting = storage.floors[floor];
        if (floor !== storage.CurrentFloor || waiting.AwatingPersonCount === 0 || storage.FreePlaces === 0) {
            return;
        }

        // Remove boarded persons from the queue in place, in a single pass.
        const queue = storage.awatingPersons;
        let kept = 0;
        for (const p of queue) {
            if (p.CurrentFloor === floor && storage.FreePlaces > 0) {
                p.State = PersonType.InElevator;
                storage.addPersonByState(p);
                waiting.AwatingPersonCount--;
            } else {
                queue[kept++] = p;
            }
        }
        queue.length = kept;
    }

    public unloadElevator(floor: number) {
        const { storage } = this;
        const target = storage.floors[floor];
        if (floor !== storage.CurrentFloor || target.GoingPersonCount === 0) {
            return;
        }

        // Kept exactly as the original algorithm: the scan index moves forward while each
        // match takes the rider at the front of the delivery order off the elevator.
        const riders = storage.goingPersons;
        let arrivedCount = 0;
        for (let i = 0; i < riders.length; i++) {
            if (riders[i].Destination !== floor) {
                continue;
            }
            target.GoingPersonCount--;
            target.ArrivedPersonCountView++;
            if (target.GoingPersonCount === 0) {
                target.State = FloorType.EmptyElevator;
            }

            (riders.shift() as typeof riders[number]).State = PersonType.Done;
            arrivedCount++;
            this.targetClearer();
        }

        if (arrivedCount > 0) {
            setTimeout(() => {
                target.ArrivedPersonCountView = 0;
                storage.updateState();
            }, ARRIVED_VIEW_MS);
        }
    }
}
