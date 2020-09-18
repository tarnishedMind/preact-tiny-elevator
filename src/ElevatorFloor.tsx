import React from 'react';
import { FloorType } from './types/FloorType';
import { Floor } from './types/Floor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faWalking } from '@fortawesome/free-solid-svg-icons';

interface ElevatorFloorProps {
    floorNumber: number,
    floorOptions: Floor
}

export default class ElevatorFloor extends React.Component<ElevatorFloorProps> {

    private userIcon = <FontAwesomeIcon icon={faUser} />;
    private walkingIcon = <FontAwesomeIcon icon={faWalking} />;
    
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

    private getCountContent = () => {
        let awaitCount = this.props.floorOptions.AwatingPersonCount;
        let arrivedCount = this.props.floorOptions.ArrivedPersonCountView;

        let awaitContent = this.getUserIconContentByCount(awaitCount);        
        let arrivedContent = this.getWalkingIconContentByCount(arrivedCount);

        return <>{awaitContent} {arrivedContent}</>;
    }

    private getUserIconContentByCount = (count: number): JSX.Element => {
        return count > 0 ? <>{this.userIcon} {`: ${count}`}</> : <></>;
    }

    private getWalkingIconContentByCount = (count: number): JSX.Element => {
        return count > 0 ? <>{this.walkingIcon} {`: ${count}`}</> : <></>;
    }

    render(): JSX.Element {
        let floorType = this.props.floorOptions.State;
        this.fillCellContent(floorType);

        return (
            <div className="floor">
                <h1 className="number">{this.props.floorNumber}</h1>
                <p className="cell">{this.cellContent}</p>
                <p className="count">{this.getCountContent()}</p>
            </div>
        );
    }
}
