import { FloorType } from '../../types/FloorType';
import { PersonType } from '../../types/PersonType';
import { ElevatorStorage } from './ElevatorStorage';

interface ElevatorLoaderInterface {
    loadElevator(floor: number): void;
    unloadElevator(floor: number): void;
}

export class ElevatorLoader implements ElevatorLoaderInterface {

    private targetClearer: () => void;
    private storage: ElevatorStorage;

    constructor(storage: ElevatorStorage, targetClearer: () => void) {
        this.targetClearer = targetClearer;
        this.storage = storage;
    }

    public loadElevator(floor: number) {
        if (floor === this.storage.CurrentFloor && this.storage.floors[floor].AwatingPersonCount > 0 && this.isFreePlace()) {
            this.loadElevatorByFloor(floor);
        }
    }

    public unloadElevator(floor: number) {
        if (floor === this.storage.CurrentFloor && this.storage.floors[floor].GoingPersonCount > 0) {
            this.unloadElevatorByFloor(floor);
        }
    }  

    private isFreePlace() {
        return this.storage.goingPersons.length < this.storage.Capacity;
    }

    private loadElevatorByFloor(idx: number) {
        for (let i = 0; i < this.storage.awatingPersons.length; i++) {
            const p = this.storage.awatingPersons[i];

            if (p.CurrentFloor === idx && this.isFreePlace()) {
                p.State = PersonType.InElevator;
                this.storage.addPersonByState(p);

                this.storage.floors[idx].AwatingPersonCount--;
                this.storage.awatingPersons.splice(i, 1);
                i--;
            }
        }
    }

    private unloadElevatorByFloor(idx: number) {
        for (let i = 0; i < this.storage.goingPersons.length; i++) {
            const p = this.storage.goingPersons[i];

            if (p.Destination === idx) {
                this.storage.floors[idx].GoingPersonCount--;
                this.storage.floors[idx].ArrivedPersonCountView++;

                setTimeout(() => {
                    this.storage.floors[idx].ArrivedPersonCountView = 0;
                    this.storage.updateState();
                }, 1000);

                if (this.storage.floors[idx].GoingPersonCount === 0) {
                    this.storage.floors[idx].State = FloorType.EmptyElevator;
                }

                const arrived = this.storage.goingPersons.splice(0, 1)[0];
                arrived.State = PersonType.Done;
                console.log(arrived, ' --- Was arrived! --- ');

                this.targetClearer();
            }
        }
    }


}