//import { useState } from 'react'
import ColorPicker from './ColorPicker';
import './Selector.css'
import SelectorButton from './SelectorButton';
import State from './state';

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

    function createSelectors() {
        return (
            <>
            {activeStates.map((activeState, index)  => {
                // generate unique label for the input box based on activeState and index, for example: available0, unavailable1
                const label: string = `${activeState.name}${index}`;
                return <>
                    <div key={`div-${label}`} className="selector-list-element">
                    <input key={label} onChange={() => setActiveState(activeState)} type="radio" className="selector" name="selector" id={label} />
                    <label htmlFor={label}>{activeState.name}</label>
                    <span className="selector-spacer"></span>
                    <ColorPicker
                        color={activeState.color}
                        setColor={(color) => {setStateColor(activeState, color)}}
                        isDefault={activeState.isDefault}
                        tabIndex={activeState.isDefault? -1 : 1} />
                    { activeState.isDefault ?
                        <div className="selector-trash"></div>
                        : <button key={`selector-trash-${label}`}className="selector-trash"
                            onClick={() => removeActiveState(activeState)}>T</button>}
                </div>
                </>
            })}
            </>
        )
    }

    return (
        <>
        <div className="selector-container">
            <h2 className="selector-title">Select Modifier</h2>
            <div className="selector-title"></div>
            {createSelectors()}
            <SelectorButton 
            activeStates={activeStates}
            setActiveStates={setActiveStates} />
        </div>
        </>
    )    
}

export default Selector
