import React from 'react';
import { Elevator } from '../Elevator/Elevator';
import { ElevatorStorage } from '../Elevator/helpers/ElevatorStorage';
import { TestSituation } from '../helpers/ElevatorSituations';
import { Floor } from '../types/Floor';
import { Person } from '../types/Person';
import { Situation } from '../types/Situation';
import { getRandomIntInclusive } from '../utils/getRandomIntInclusive';
import ElevatorFloor from './ElevatorFloor';

interface ElevatorProps {
}

interface ElevatorState {
    floors: Floor[]
}

export default class ElevatorManagement extends React.Component<ElevatorProps, ElevatorState> {
    private storage: ElevatorStorage;
    private currentSituation: Situation;
    private myElevator: Elevator;
    private persons: Array<Person>;
    private timer: any;    

    constructor(props: ElevatorProps) {
        super(props);

        this.state = {
            floors: []
        }

        this.currentSituation = TestSituation.get(0);
        this.persons = this.currentSituation.persons;
        this.storage = new ElevatorStorage(this.currentSituation.options);
        this.myElevator = new Elevator(this.storage);     
        this.myElevator.setUpdaterFunc(
            (floors: Floor[]) => this.setState({ ...this.state, floors: floors })
        );
    }

    public componentDidMount() {
        this.initPersons();
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

    public getTest = (n: number) => {
        this.currentSituation = TestSituation.get(n);
        this.persons = this.currentSituation.persons;
        this.storage = new ElevatorStorage(this.currentSituation.options);
        this.myElevator = new Elevator(this.storage);
        this.myElevator.setUpdaterFunc(
            (floors: Floor[]) => this.setState({ ...this.state, floors: floors })
        ); 
        
        this.initPersons();
        this.storage.updateState();
    }

    public generatePersons = (count = 1) => {
        const min = this.currentSituation.options.starterFloor;
        const max = this.currentSituation.options.floorCount;
        const rnd = () => getRandomIntInclusive(min, max);

        let person = null;
        for (let i = 0; i < count; i++) {
            person = new Person(rnd(), rnd());
            this.persons.push(person);
            this.myElevator.callElevator(person);
        }
    }

    private initPersons = () => {
        this.persons.forEach(p => this.myElevator.callElevator(p));
    }

    render() {
        const floors = this.state.floors.map((f, i) => <ElevatorFloor key={`key${i}`} floorNumber={i} floorOptions={f} />);
        return (
            <>
                <div className="button-box">
                    <button onClick={this.tick}>One step</button>
                    <button onClick={this.start}>Start</button>
                    <button onClick={this.stop}>Stop</button>
                    <button onClick={() => this.getTest(0)}>Test 1</button>
                    <button onClick={() => this.getTest(1)}>Test 2</button>
                    <button onClick={() => this.generatePersons()}>Add person</button>
                </div>

                <div className="elevator">
                    {floors}
                </div>
            </>
        );
    }
}