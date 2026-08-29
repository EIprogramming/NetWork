import { useRef, useState } from 'react';
import './MultiSelect.css';
import { MultiSelectElement } from './MultiSelectElement';
import State, { availableState, unsureState } from '../classes/state';

interface Props {
    selectedStates: State[],
    setSelectedStates: React.Dispatch<React.SetStateAction<State[]>>,
}

export function MultiSelect({ selectedStates, setSelectedStates } : Props) {
    const ref = useRef<HTMLButtonElement | null>(null);
    const [width, setWidth] = useState(0);

    function setOverlayWidth() {
        if (!ref.current) return;
        const multiselectButtonWidth = ref.current.getBoundingClientRect().width
        setWidth(multiselectButtonWidth);
    }

    const [isSelecting, setIsSelecting] = useState(false);
    function toggleIsSelecting() {
        setIsSelecting(!isSelecting);
        setOverlayWidth();
    }

    function listSelectedStates(states: State[]) {
        return (<>
        {"Viewing: "} 
        {states.map(state => {
            return (<>{state.name + " "}</>)
        })}
        </>);
    }

    return (
    <>
        <button
        className="multiselect-button"
        onClick={toggleIsSelecting}
        ref={ref}>
            {
                selectedStates.length > 0 ?
                listSelectedStates(selectedStates) : // todo: display the actual states
                "View All Responses"
            }
        </button>
        {isSelecting &&
        <div className="multiselect-overlay-container" style={{
            width: `${width}px`,
        }}>
            <div
            className="multiselect-overlay"
            style={{
                width: `${width}px`,
            }}>
                <MultiSelectElement
                    states={[availableState, unsureState]}
                    selectedStates={selectedStates}
                    setSelectedStates={setSelectedStates}
                    />
            </div>
        </div>}
    </>
    );
}
