import React from 'react';
import { Elevator } from './Elevator';
import ElevatorFloor from './ElevatorFloor';
import { PersonType } from './types/PersonType';
import { Floor } from './types/Floor';
import { Person } from './types/Person';

interface ElevatorProps {
    starterFloor: number,
    floorCount: number
}

interface ElevatorState {
    floors: Floor[]
}

export default class ElevatorManagement extends React.Component<ElevatorProps, ElevatorState> {

    private myElevator: Elevator;
    private persons: Array<Person>;

    private timer: any;

    constructor(props: ElevatorProps) {
        super(props);
        this.state = {
            floors: []
        }

        this.myElevator = new Elevator({
            currentElevatorFloor: 10,
            floorCount: 10,
            starterFloor: 1,
            capacity: 4
        });

        this.persons = new Array<Person>();

        let person = new Person();
        person.CurrentFloor = 3;
        person.Destination = 10;
        this.persons.push(person);

        person = new Person();
        person.CurrentFloor = 3;
        person.Destination = 10;
        this.persons.push(person);

        person = new Person();
        person.CurrentFloor = 3;
        person.Destination = 6;
        this.persons.push(person);

        person = new Person();
        person.CurrentFloor = 3;
        person.Destination = 8;
        this.persons.push(person);

        person = new Person();
        person.CurrentFloor = 1;
        person.Destination = 5;
        this.persons.push(person);

        person = new Person();
        person.CurrentFloor = 3;
        person.Destination = 5;
        this.persons.push(person);


        this.myElevator.setCallback((floors: Floor[]) => this.setState({ ...this.state, floors: floors }));
    }

    componentDidMount() {
        this.persons.forEach(p => this.myElevator.callElevator(p));
    }

    public start = () => {
        this.timer = setInterval(this.tick, 500);
    }

    public stop = () => {
        clearInterval(this.timer);
    }

    public tick = () => {
        this.myElevator.processing();
        this.myElevator.log();
    }

    render() {
        const floors = this.state.floors.map((f, i) => <ElevatorFloor key={`key${i}`} floorNumber={i} floorOptions={f} />);
        return (
            <>
                <div>
                    <button onClick={this.tick}>tick</button>
                    <button onClick={this.start}>start</button>
                    <button onClick={this.stop}>stop</button>
                </div>
                <div className="elevator">
                    {floors}
                </div>
            </>
        );
    }
}