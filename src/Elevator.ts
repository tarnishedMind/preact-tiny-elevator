import { PersonType } from "./types/PersonType";
import { Floor } from "./types/Floor";
import { Person } from "./types/Person";
import { FloorType } from "./types/FloorType";
import { MoveDirection } from "./types/MoveDirection";
import { Queue } from "./types/Queue";

const NOT_TARGET = -1;

interface ElevatorOptions {
    currentElevatorFloor: number;
    floorCount: number;
    starterFloor: number;
    capacity: number;
}

interface ElevatorInterface {
    getCurrentElevatorFloor(): number
}

export class Elevator implements ElevatorInterface {

    private targetFloor: number = NOT_TARGET;

    private currentFloor: number;
    private floorCount: number;
    private starterFloor: number;
    private capacity: number;

    private floors: Floor[];
    private callQueue: Queue<number>
    private awatingPersons: Array<Person>;
    private goingPersons: Array<Person>;

    private stateSetter: (floors: Floor[]) => void;

    constructor(options: ElevatorOptions) {
        this.currentFloor = options.currentElevatorFloor;
        this.floorCount = options.floorCount;
        this.starterFloor = options.starterFloor;
        this.capacity = options.capacity;

        this.floors = new Array<Floor>(this.floorCount);
        this.callQueue = new Queue<number>();
        this.awatingPersons = new Array<Person>();
        this.goingPersons = new Array<Person>();

        this.stateSetter = ([]) => {};

        this.initFloors();
    }

    public log() {
        console.log('=== === === === ===');
        console.log(this.floors);
        console.log(this.callQueue);
        console.log('awatingPersons', this.awatingPersons);
        console.log('goingPersons', this.goingPersons);
        console.log('targetFloor', this.targetFloor);
        console.log('currentElevatorFloor: ', this.currentFloor);
    }

    public callElevator(p: Person) {
        this.addPersonByState(p);
    }

    public setCallback(func: (floors: Floor[]) => void) {
        this.stateSetter = func;
    }

    public updateState() {
        this.stateSetter(this.floors);
    }

    public getCurrentElevatorFloor(): number {
        return this.currentFloor;
    }

    public processing() {
        // somewhere here will be smart logic for find optimal way...
        this.updateCallQueue();
        this.countTargetFloor();     
        this.targetFloor !== NOT_TARGET && this.goToFloor(this.targetFloor);  
        // update ??? state      
    }

    private updateCallQueue() {        
        // some sort and ordering
        // ? by current floor
        // ? by current move direction
        this.callQueue.clear();
        this.awatingPersons.forEach(p => this.callQueue.uniqueAdd(p.CurrentFloor as number));
    } 

    private countTargetFloor() {
        if (this.targetFloor === NOT_TARGET && this.awatingPersons.length > 0 && this.goingPersons.length === 0) {
            this.targetFloor = this.callQueue.extract() as number;
        }
        if (this.goingPersons.length > 0) {
            this.sortGoing();
            this.targetFloor = this.goingPersons[0].Destination as number;
        }
    }

    private goToFloor(iterFloor: number) {      
        this.chooseMove(iterFloor);
        this.loadElevator(iterFloor);       
        this.unloadElevator(iterFloor);      
        this.updateState();        
    }

    private chooseMove(iterFloor: number) {
        if (iterFloor < this.currentFloor) {
            this.move(MoveDirection.Down);
        } else if (iterFloor > this.currentFloor) {
            this.move(MoveDirection.Up);
        }
    }    

    private loadElevator(iterFloor: number) {
        if (iterFloor === this.currentFloor && this.floors[iterFloor].AwatingPersonCount > 0) {
            this.isFreePlace() && this.loadElevatorByFloor(iterFloor);
            this.countTargetFloor();
        }
    }

    private unloadElevator(iterFloor: number) {
        if (this.targetFloor === this.currentFloor) {
            // this.floors[this.currentElevatorFloor].State = ???; чтобы заполнить пропуск
            this.unloadElevatorByFloor(iterFloor);          
        } 
    }

    private move(dir: MoveDirection) {    

        if (this.floors[this.currentFloor].AwatingPersonCount) {
            this.floors[this.currentFloor].State = FloorType.PersonAwaiting;
        } else {
            this.floors[this.currentFloor].State = FloorType.EmptyFloor;
        }        
        this.floors[this.currentFloor].GoingPersonCount = 0; 


        this.changeFloorByDirection(dir);


        if (this.goingPersons.length === 0) {
            this.floors[this.currentFloor].State = FloorType.EmptyElevator;
        }

        if (this.goingPersons.length > 0) {
            this.floors[this.currentFloor].State = FloorType.PersonInElevator;
            this.floors[this.currentFloor].GoingPersonCount = this.goingPersons.length;        
        }
    }

    private changeFloorByDirection(dir: MoveDirection) {
        if (dir === MoveDirection.Down) {
            this.currentFloor--;
        } else {
            this.currentFloor++;
        }
    }

    private isFreePlace() {
        return this.goingPersons.length < this.capacity;
    }

    private loadElevatorByFloor(floor: number) {
        for (let i = 0; i < this.awatingPersons.length; i++) {
            const p = this.awatingPersons[i];

            if (p.CurrentFloor === floor && this.isFreePlace()) {
                p.State = PersonType.InElevator;                  
                this.addPersonByState(p);

                this.floors[floor].AwatingPersonCount--;
                this.awatingPersons.splice(i, 1);
                i--;
            }
        }    
    }

    private unloadElevatorByFloor(iterFloor: number) {
        this.floors[iterFloor].GoingPersonCount--;
        const arrived = this.goingPersons.splice(0, 1);            
        this.targetFloor = NOT_TARGET;
    }       

    private addPersonByState(p: Person) {
        const i = p.CurrentFloor as number;

        if (p.State == PersonType.Awaiting || p.State == undefined) {
            this.awatingPersons.push(p);
            this.floors[i].State = FloorType.PersonAwaiting;
            this.floors[i].AwatingPersonCount++;            
        } else if (p.State == PersonType.InElevator) {
            this.goingPersons.push(p);
            this.floors[i].State = FloorType.PersonInElevator;
            this.floors[i].GoingPersonCount++;            
        }

        this.updateState();
    }

    private sortGoing() {
        this.goingPersons.sort((_a, _b) => {
            const a = _a.Destination as number;
            const b = _b.Destination as number;
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
          });
    }

    private initFloors(): void {
        for (let i = this.starterFloor; i < this.floorCount + 1; i++) {
            this.floors[i] = new Floor();

            if (i === this.currentFloor) {
                this.floors[i].State = FloorType.EmptyElevator;
            } else {
                this.floors[i].State = FloorType.EmptyFloor;
            }
        }
    }
}



