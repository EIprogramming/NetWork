import ColorSelect from './ColorSelect';
import './Selector.css';
import SelectorButton from './SelectorButton';
import State from './state';
import trash from '../assets/icons/trash.svg';

interface Props {
    activeStates: Array<State>,
    setActiveStates: React.Dispatch<React.SetStateAction<Array<State>>>,
    setActiveState: React.Dispatch<React.SetStateAction<State>>
}

function Selector( {activeStates, setActiveStates, setActiveState} : Props ) {
    function removeActiveState(activeState: State) {
        let nextActiveStates = structuredClone(activeStates);
        let stateIndex: number = -1;
        nextActiveStates.forEach((state, index) => {
            if (state.name === activeState.name && state.color === activeState.color && !state.isDefault) {stateIndex = index}
        })
        
        if (stateIndex > -1) nextActiveStates.splice(stateIndex, 1); // remove the element at specific index
        setActiveStates(nextActiveStates);
    }

    function setStateColor(state: State, nextColor: React.SetStateAction<string>) {
        let nextActiveStates = structuredClone(activeStates);
        activeStates.forEach((activeState, index) => {
            if (activeState.name === state.name && activeState.color === state.color) {
                nextActiveStates[index] = new State(state.name, nextColor.toString());
            }
        })

        setActiveStates(nextActiveStates);
    }

     // hardcoded for now, TODO: make this dynamic for future changes.
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
                        <input type="radio" id={label} className="selector" name="selector"
                        onChange={() => setActiveState(activeState)}
                        defaultChecked={isDefaultSelected(activeState)}/>
                        <label htmlFor={label}>{activeState.name}</label>
                        <span className="selector-spacer"></span>
                        {/*<ColorPicker
                            color={activeState.color}
                            setColor={(color) => {setStateColor(activeState, color)}}
                            isDefault={activeState.isDefault}
                            tabIndex={activeState.isDefault? -1 : 0} />*/}
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
                            <button className="selector-form-trash"
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
            <div className="selector-title"></div>
            {createSelectors()}
            <SelectorButton 
            activeStates={activeStates}
            setActiveStates={setActiveStates} />
        </div>
    );
}

export default Selector
