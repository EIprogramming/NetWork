//import { useState } from 'react'
import { useState } from 'react';
import './SelectorButton.css'
import State from './state';
import ColorPicker from './ColorPicker';

interface Props {
    activeStates: Array<State>,
    setActiveStates: React.Dispatch<React.SetStateAction<Array<State>>>
}

function Selector( { activeStates, setActiveStates } : Props ) {
    const [isButtonVisible, setIsButtonVisible] = useState(true);
    const defaultColor = "#ffffff";
    const [color, setColor] = useState(defaultColor);

    function includesStateName(states: Array<State>, name: string) {
        let isIncluded = false;
        states.forEach(state => {
            if (state.name === name) {
                isIncluded = true;
                return;
            }
        });

        return isIncluded;
    }

    function addNewState(state: State) {
        let nextActiveStates = structuredClone(activeStates);
        let trimmedStateName = state.name.trim();
        // make sure the new state is not a duplicate
        if (trimmedStateName == '' || includesStateName(activeStates, trimmedStateName)) { return; }
        setIsButtonVisible(true)
        
        nextActiveStates.push(state);
        setActiveStates(nextActiveStates); // TODO: add colours for these new states, etc.
    }

    function handleSubmitNewState(e: React.FormEvent<HTMLFormElement>) {
        // Prevent the browser from reloading the page
        e.preventDefault();

        // Read the form data
        const form = e.currentTarget;
        const formData = new FormData(form);
        const formJson = Object.fromEntries(formData.entries());
        const newStateName = formJson.newState.toString();
        const newStateColor = color;

        // add the new state to the list of available states
        addNewState(new State(newStateName, newStateColor));
        setColor(defaultColor);
        form.reset();
    }

    return (
        <div className="selector-button">
            {
            isButtonVisible ?
            <button onClick={() => setIsButtonVisible(false)} className="selector-add">Add your own status!</button>
            :
            <form onSubmit={(e) => handleSubmitNewState(e)} className="selector-form">
                <button type="submit" className="selector-form-element selector-form-submit">P</button>
                <input name="newState" className="selector-form-element selector-form-input" id="newState"
                    type="text" autoFocus autoComplete="off" />
                <ColorPicker color={color} setColor={setColor} isDefault={false} tabIndex={0} />
                <button type="button" className="selector-form-element selector-form-trash" onClick={() => setIsButtonVisible(true)}>T</button>
            </form>
            }
        </div>
    );
}

export default Selector
