import { useEffect, useRef, useState } from 'preact/hooks';
import { Elevator } from '../Elevator/Elevator';
import { TestSituation } from '../helpers/ElevatorSituations';
import { usePeopleFeed } from '../hooks/usePeopleFeed';
import { Floor } from '../types/Floor';
import { Person } from '../types/Person';
import { Situation } from '../types/Situation';
import { getRandomIntInclusive } from '../utils/getRandomIntInclusive';
import ElevatorFloor from './ElevatorFloor';
import TrafficControls from './TrafficControls';

export default function ElevatorManagement() {
    const [floors, setFloors] = useState<Floor[]>([]);

    const currentSituation = useRef<Situation>(TestSituation.get(0));
    const persons = useRef<Array<Person>>(currentSituation.current.persons);
    const myElevator = useRef<Elevator>(null as unknown as Elevator);
    const timer = useRef<ReturnType<typeof setInterval>>();

    // The elevator mutates its floors array in place, so hand the state a new
    // array to trigger a render. slice() keeps the holes below starterFloor.
    const createElevator = (situation: Situation) => {
        const elevator = new Elevator(situation.options);
        elevator.setUpdaterFunc((floors: Floor[]) => setFloors(floors.slice()));
        return elevator;
    }

    if (myElevator.current === null) {
        myElevator.current = createElevator(currentSituation.current);
    }

    const initPersons = () => {
        persons.current.forEach(p => myElevator.current.callElevator(p));
    }

    useEffect(() => {
        initPersons();
        return () => clearInterval(timer.current);
    }, []);

    const tick = () => {
        myElevator.current.processing();
    }

    const start = () => {
        timer.current = setInterval(tick, 500);
    }

    const stop = () => {
        clearInterval(timer.current);
    }

    const getTest = (n: number) => {
        currentSituation.current = TestSituation.get(n);
        persons.current = currentSituation.current.persons;
        myElevator.current = createElevator(currentSituation.current);

        initPersons();
        myElevator.current.updateState();
    }

    const addPerson = (from: number, to: number) => {
        const person = new Person(from, to);
        persons.current.push(person);
        myElevator.current.callElevator(person);
    }

    const generatePersons = (count = 1) => {
        const min = currentSituation.current.options.starterFloor;
        const max = currentSituation.current.options.floorCount;
        const rnd = () => getRandomIntInclusive(min, max);

        for (let i = 0; i < count; i++) {
            addPerson(rnd(), rnd());
        }
    }

    const feed = usePeopleFeed(currentSituation.current.options, addPerson);

    const floorElements = floors.map((f, i) => <ElevatorFloor key={`key${i}`} floorNumber={i} floorOptions={f} />);
    return (
        <>
            <div className="button-box">
                <button onClick={tick}>One step</button>
                <button onClick={start}>Start</button>
                <button onClick={stop}>Stop</button>
                <button onClick={() => getTest(0)}>Test 1</button>
                <button onClick={() => getTest(1)}>Test 2</button>
                <button onClick={() => generatePersons()}>Add person</button>
            </div>

            <TrafficControls feed={feed} />

            <div className="elevator">
                {floorElements}
            </div>
        </>
    );
}
