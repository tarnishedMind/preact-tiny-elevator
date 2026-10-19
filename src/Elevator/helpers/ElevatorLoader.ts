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

        // Everyone riding to this floor gets off; the rest keep their delivery order.
        const riders = storage.goingPersons;
        let kept = 0;
        for (const p of riders) {
            if (p.Destination === floor) {
                p.State = PersonType.Done;
            } else {
                riders[kept++] = p;
            }
        }
        const arrivedCount = riders.length - kept;
        riders.length = kept;

        if (arrivedCount === 0) {
            return;
        }

        target.GoingPersonCount -= arrivedCount;
        target.ArrivedPersonCountView += arrivedCount;
        if (target.GoingPersonCount === 0) {
            target.State = FloorType.EmptyElevator;
        }
        this.targetClearer();

        setTimeout(() => {
            target.ArrivedPersonCountView = 0;
            storage.updateState();
        }, ARRIVED_VIEW_MS);
    }
}
