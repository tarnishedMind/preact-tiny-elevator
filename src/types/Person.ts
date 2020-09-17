import { PersonType } from "./PersonType";

export class Person {
    public State?: PersonType = PersonType.Awaiting;
    public CurrentFloor?: number = undefined;
    public Destination?: number = undefined;

    constructor(curFlr: number, dest: number) {
        this.CurrentFloor = curFlr;
        this.Destination = dest;
    }
}