import ColorSelect from './ColorSelect';
import './Selector.css';
import SelectorButton from './SelectorButton';
import State, { availableState } from '../classes/state.ts';
import trash from '../../assets/icons/trash.svg';
import { isSameState } from '../utils/availabilityUtils.ts';

interface Props {
    activeStates: Array<State>,
    setActiveStatesMapped: (newActiveStates: State[]) => void
    setActiveState: React.Dispatch<React.SetStateAction<State>>
}

function Selector( {activeStates, setActiveStatesMapped, setActiveState} : Props ) {
    function removeActiveState(activeState: State) {
        let nextActiveStates = structuredClone(activeStates);
        let stateIndex: number = -1;
        nextActiveStates.forEach((state, index) => {
            if (isSameState(state, activeState) &&
                !state.isDefault) {
                stateIndex = index;
            }
        })
        
        if (stateIndex > -1) nextActiveStates.splice(stateIndex, 1); // remove the element at specific index
        setActiveStatesMapped(nextActiveStates);
    }

    function setStateColor(state: State, nextColor: React.SetStateAction<string>) {
        let nextActiveStates = structuredClone(activeStates);
        activeStates.forEach((activeState, index) => {
            if (isSameState(state, activeState)) {
                nextActiveStates[index] = new State(state.name, nextColor.toString());
            }
        })

        setActiveStatesMapped(nextActiveStates);
    }

    function isDefaultSelected(activeState: State) {
        return isSameState(activeState, availableState);
    }

    function createSelectors() {
        return (
            <>
            {activeStates.map((activeState, index)  => {
                // generate unique label for the input box based on activeState and index, for example: available0, unavailable1
                const label: string = `${activeState.name}${index}`;
                //if (activeState.name == "Unavailable") {return null;} // skip the unavailable state
                return (
                    <div key={`${label}`} className="selector-list-element">
                        <input type="radio" id={label} className="selector-radio" name="selector"
                        onChange={() => setActiveState(activeState)}
                        defaultChecked={isDefaultSelected(activeState)}/>
                        <label htmlFor={label}>{activeState.name}</label>
                        <span className="selector-spacer"></span>   
                        {<ColorSelect
                            color={activeState.color}
                            setColor={(color) => {setStateColor(activeState, color)}}
                            state={activeState}
                            setState={setActiveState}
                            isDefault={activeState.isDefault}
                            tabIndex={activeState.isDefault? -1 : 0} />}
                        { activeState.isDefault ?
                            <div className="selector-trash-spacer"></div>
                            :
                            <button className="selector-trash"
                            onClick={() => removeActiveState(activeState)}>
                                <img className="icon" src={trash}/>
                            </button>}
                    </div>);
            })}
            </>
        )
    }

    return (
        <div className="selector-container">
            <h2 className="selector-title">Select Modifier</h2>
            {createSelectors()}
            <SelectorButton 
            activeStates={activeStates}
            setActiveStatesMapped={setActiveStatesMapped} />
        </div>
    );
}

export default Selector
