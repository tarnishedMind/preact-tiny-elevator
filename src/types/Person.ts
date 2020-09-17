import { PersonType } from "./PersonType";

export class Person {
    public State?: PersonType = PersonType.Awaiting;
    public CurrentFloor?: number = undefined;
    public Destination?: number = undefined;
}