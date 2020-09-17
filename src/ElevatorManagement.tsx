import React from 'react';
import { Elevator } from './Elevator';
import ElevatorFloor from './ElevatorFloor';
import { Floor } from './types/Floor';
import { Person } from './types/Person';
import { TestSituation_1 } from './utils/ElevatorSituations';
import { getRandomIntInclusive } from './utils/getRandomIntInclusive';

interface ElevatorProps {
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

        this.myElevator = new Elevator(TestSituation_1.options);
        this.persons = TestSituation_1.getPersons();
        this.myElevator.setUpdaterFunc((floors: Floor[]) => this.setState({ ...this.state, floors: floors }));
    }

    public componentDidMount() {
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
    }

    public generatePersons = (count = 1) => {
        const min = TestSituation_1.options.starterFloor;
        const max = TestSituation_1.options.floorCount;
        const rnd = () => getRandomIntInclusive(min, max);

        let person = null;
        for (let i = 0; i < count; i++) {
            person = new Person(rnd(), rnd());
            this.persons.push(person);
            this.myElevator.callElevator(person);
        }
    }    

    render() {
        const floors = this.state.floors.map((f, i) => <ElevatorFloor key={`key${i}`} floorNumber={i} floorOptions={f} />);
        return (
            <>
                <div>
                    <button onClick={this.tick}>One step</button>
                    <button onClick={this.start}>Start</button>
                    <button onClick={this.stop}>Stop</button>
                    <button onClick={() => this.generatePersons()}>Add person</button>
                </div>

                <div className="elevator">
                    {floors}
                </div>
            </>
        );
    }
}