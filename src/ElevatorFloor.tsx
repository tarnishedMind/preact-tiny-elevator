import React from 'react';
import { FloorType } from './types/FloorType';
import { Floor } from './types/Floor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';


interface ElevatorFloorProps {
    floorNumber: number,
    floorOptions: Floor
}

interface ElevatorFloorState {
}

export default class ElevatorFloor extends React.Component<ElevatorFloorProps, ElevatorFloorState> {

    constructor(props: ElevatorFloorProps) {
        super(props);
    }

    render() {
        let goingCount = this.props.floorOptions.GoingPersonCount;
        let awaitCount = this.props.floorOptions.AwatingPersonCount;
        let state = this.props.floorOptions.State;
        let typeString = null;       

        switch (this.props.floorOptions.State) {
            case FloorType.EmptyElevator:
                typeString = '|===|';
                break;
            case FloorType.EmptyFloor:
                typeString = '____';
                break;
            case FloorType.PersonAwaiting:
                typeString = `PersonAwaiting`;
                break;
            case FloorType.PersonInElevator:
                typeString = `PersonInElevator ${goingCount}`;
                break;
        
            default:
                break;
        }

        return (
            <div className="floor">
                {/* <FontAwesomeIcon icon={faCoffee} /> */}
                <h1>{this.props.floorNumber}</h1>
                <p>{typeString}</p>
                <p>{awaitCount > 0 && `${awaitCount}`}</p> 
            </div>
        );
    }
}
