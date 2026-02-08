import SelectorButton from './SelectorButton';
import State from '../classes/state.ts';
import './ColorSelect.css';
import './Selector.css';
import './SelectorButton.css';

interface Props {
    activeStates: Array<State>,
    setActiveStatesMapped: (newActiveStates: State[]) => void
    setActiveState: React.Dispatch<React.SetStateAction<State>>
}

function ViewSelector( {activeStates, setActiveStatesMapped, setActiveState} : Props ) {
    function isDefaultSelected(activeState: State) { return activeState.name === "Available"; }

    function createSelectors() {
        return (
            <>
            {activeStates.map((activeState, index)  => {
                // generate unique label for the input box based on activeState and index, for example: available0, unavailable1
                const label: string = `${activeState.name}${index}`;
                //if (activeState.name == "Unavailable") {return null;} // skip the unavailable state
                return (
                    <div key={`${label}`} className="selector-list-element">
                        <input type="checkbox" id={label} className="selector-radio" name="selector"
                        onChange={() => setActiveState(activeState)}
                        //checked={isChecked} continue from here...
                        defaultChecked={isDefaultSelected(activeState)}/>
                        <label htmlFor={label}>{activeState.name}</label>
                        <span className="selector-spacer"></span>
                        <div
                        className="selector-form-element selector-form-color"
                        style={{
                            backgroundColor: activeState.color,
                        }}/>
                        <div className="selector-trash-spacer"></div>
                    </div>);
            })}
            </>
        )
    }

    return (
        <div className="selector-container">
            <h2 className="selector-title">Status to Filter</h2>
            {createSelectors()}
            <SelectorButton 
            activeStates={activeStates}
            setActiveStatesMapped={setActiveStatesMapped} />
        </div>
    );
}

export default ViewSelector
