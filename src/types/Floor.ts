import { FloorType } from "./FloorType";

export class Floor {
    public State: FloorType = FloorType.EmptyFloor;
    public GoingPersonCount: number = 0;
    public AwatingPersonCount: number = 0;
    public ArrivedPersonCountView: number = 0;
}