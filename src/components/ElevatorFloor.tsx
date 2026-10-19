import { faUser, faWalking } from '@fortawesome/free-solid-svg-icons';
import type { ComponentChildren } from 'preact';
import { Floor } from '../types/Floor';
import { FloorType } from '../types/FloorType';
import { Icon } from './Icon';

interface ElevatorFloorProps {
    floorNumber: number,
    floorOptions: Floor
}

const userIcon = <Icon icon={faUser} />;
const walkingIcon = <Icon icon={faWalking} />;

const getUserIconContentByCount = (count: number) => {
    return count > 0 ? <>{userIcon} {`: ${count}`}</> : <></>;
}

const getWalkingIconContentByCount = (count: number) => {
    return count > 0 ? <>{walkingIcon} {`: ${count}`}</> : <></>;
}

const getCellContent = (floorOptions: Floor): ComponentChildren => {
    switch (floorOptions.State) {
        case FloorType.EmptyElevator:
            return '|_____|';
        case FloorType.EmptyFloor:
            return '_____';
        case FloorType.PersonAwaiting:
            return `Awaiting`;
        case FloorType.PersonInElevator:
            return <>| {getUserIconContentByCount(floorOptions.GoingPersonCount)} |</>;

        default:
            throw new Error("Incorrect FloorType!");
    }
}

const getCountContent = (floorOptions: Floor) => {
    const awaitContent = getUserIconContentByCount(floorOptions.AwatingPersonCount);
    const arrivedContent = getWalkingIconContentByCount(floorOptions.ArrivedPersonCountView);

    return <>{awaitContent} {arrivedContent}</>;
}

export default function ElevatorFloor({ floorNumber, floorOptions }: ElevatorFloorProps) {
    return (
        <div className="floor">
            <h1 className="number">{floorNumber}</h1>
            <p className="cell">{getCellContent(floorOptions)}</p>
            <p className="count">{getCountContent(floorOptions)}</p>
        </div>
    );
}
