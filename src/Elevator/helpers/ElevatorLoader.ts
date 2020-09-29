import { PersonType } from '../../types/PersonType';
import { FloorType } from '../../types/FloorType';
import { ElevatorStaticStorage } from './ElevatorStaticStorage';

const Storage = ElevatorStaticStorage;

interface ElevatorLoaderInterface {
    loadElevator(floor: number): void;
    unloadElevator(floor: number): void;
}

export class ElevatorLoader implements ElevatorLoaderInterface {

    private targetClearer: () => void;

    constructor(targetClearer: () => void) {
        this.targetClearer = targetClearer;
    }

    public loadElevator(floor: number) {
        if (floor === Storage.getCurrentFloor() && Storage.floors[floor].AwatingPersonCount > 0 && this.isFreePlace()) {
            this.loadElevatorByFloor(floor);
        }
    }

    public unloadElevator(floor: number) {
        if (floor === Storage.getCurrentFloor() && Storage.floors[floor].GoingPersonCount > 0) {
            this.unloadElevatorByFloor(floor);
        }
    }  

    private isFreePlace() {
        return Storage.goingPersons.length < Storage.capacity;
    }

    private loadElevatorByFloor(idx: number) {
        for (let i = 0; i < Storage.awatingPersons.length; i++) {
            const p = Storage.awatingPersons[i];

            if (p.CurrentFloor === idx && this.isFreePlace()) {
                p.State = PersonType.InElevator;
                Storage.addPersonByState(p);

                Storage.floors[idx].AwatingPersonCount--;
                Storage.awatingPersons.splice(i, 1);
                i--;
            }
        }
    }

    private unloadElevatorByFloor(idx: number) {
        for (let i = 0; i < Storage.goingPersons.length; i++) {
            const p = Storage.goingPersons[i];

            if (p.Destination === idx) {
                Storage.floors[idx].GoingPersonCount--;
                Storage.floors[idx].ArrivedPersonCountView++;

                setTimeout(() => {
                    Storage.floors[idx].ArrivedPersonCountView = 0;
                    Storage.updateState();
                }, 1000);

                if (Storage.floors[idx].GoingPersonCount === 0) {
                    Storage.floors[idx].State = FloorType.EmptyElevator;
                }

                const arrived = Storage.goingPersons.splice(0, 1)[0];
                arrived.State = PersonType.Done;
                console.log(arrived, ' --- Was arrived! --- ');

                this.targetClearer();
            }
        }
    }


}