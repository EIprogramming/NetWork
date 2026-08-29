import './MultiSelect.css';
import './MultiSelectElement.css';
import type State from '../classes/state';
import { insertStateInOrder, isStateinStates, removedState } from '../utils/availabilityUtils';

interface Props {
    states: State[],
    selectedStates: State[]
    setSelectedStates: React.Dispatch<React.SetStateAction<State[]>>
}

export function MultiSelectElement({ states, selectedStates, setSelectedStates } : Props) {

    function toggleSelectedState(state: State) {
        if (isStateinStates(state, selectedStates)) {
            const newSelectedStates = removedState(state, selectedStates);
            setSelectedStates(newSelectedStates);
        } else {
            const newSelectedStates = insertStateInOrder(state, selectedStates, states);
            setSelectedStates(newSelectedStates);
        }
    }

    function generateMultiselectElements() {
        return states.map(state => {
            return (
            <>
                <label className="multiselect-element" htmlFor={`select-elem${state.name}`}>
                    <input 
                        type="checkbox"
                        id={`select-elem${state.name}`}
                        checked={isStateinStates(state, selectedStates)}
                        onChange={() => toggleSelectedState(state)} />
                    {state.name}
                </label>
                </>
            );
        });
    }

    return (
        <div className="multiselect-element-container">
            {generateMultiselectElements()}
        </div>
    );
}
