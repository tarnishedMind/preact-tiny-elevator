import React from 'react';
import { FloorType } from './types/FloorType';
import { Floor } from './types/Floor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

interface ElevatorFloorProps {
    floorNumber: number,
    floorOptions: Floor
}

export default class ElevatorFloor extends React.Component<ElevatorFloorProps> {

    private userIcon = <FontAwesomeIcon icon={faUser} />;
    private cellContent: string | JSX.Element = '';

    private fillCellContent = (type: FloorType): void => {
        switch (type) {
            case FloorType.EmptyElevator:
                this.cellContent = '|_____|';
                break;
            case FloorType.EmptyFloor:
                this.cellContent = '_____';
                break;
            case FloorType.PersonAwaiting:
                this.cellContent = `Awaiting`;
                break;
            case FloorType.PersonInElevator:
                const count = this.props.floorOptions.GoingPersonCount;
                this.cellContent = <>| {this.getUserIconContentByCount(count)} |</>;
                break;

            default:
                throw new Error("Incorrect FloorType!");
        }
    }

    private getUserIconContentByCount = (count: number): JSX.Element => {
        return count > 0 ? <>{this.userIcon} {`: ${count}`}</> : <span>_____</span>;
    }

    render(): JSX.Element {
        let floorType = this.props.floorOptions.State;
        this.fillCellContent(floorType);

        let awaitCount = this.props.floorOptions.AwatingPersonCount;
        let awaitContent = this.getUserIconContentByCount(awaitCount);

        return (
            <div className="floor">
                <h1 className="number">{this.props.floorNumber}</h1>
                <p className="cell">{this.cellContent}</p>
                <p className="count">{awaitContent}</p>
            </div>
        );
    }
}
