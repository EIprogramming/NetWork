import { useState } from "react";
import './ColorSelect.css';
import { COLORS } from './defaultColors.ts';
import type State from "./state.ts";

interface Props {
    color: string,
    setColor: React.Dispatch<React.SetStateAction<string>>,
    state?: State, // optional - specify state for modification, but not for creation (handled in form logic)
    setState?: React.Dispatch<React.SetStateAction<State>>, // optional - same reasons
    isDefault: boolean,
    tabIndex: number,
}

// ================================================================================= //
// ======================== TODO: npm DELETE react-colorful ======================== //
// ================================================================================= //

function ColorPicker( {color, setColor, state, setState, isDefault, tabIndex } : Props ) {
    const [isDisplayColorPicker, setIsDisplayColorPicker] = useState(false);

    function displayColorPicker() {
        if (!isDefault) { setIsDisplayColorPicker(true); }
    }

    function setStateColor(rgb: string) {
        setColor(rgb);

        // check if modifying current state (no return) or creating new (return)
        if (!state || !setState) return;
        const newState = state;
        newState.color = rgb;
        setState(newState);
    }

    function generateColourOptions() {
        const defaultColors = Object.entries(COLORS);
        const firstRow: Array<React.ReactElement<any, any>> = [];
        const secondRow: Array<React.ReactElement<any, any>> = [];
        const rowLength = 3; // to generate a row with ${rowLength} colour elements

        defaultColors.map((element, index) => { // TODO: add arrow key navigation
            const defaultColor = element[1];
            const colorButton = <button key={`color-select-button${index}`} type="button"
                className="selector-form-element selector-form-color" onClick={() => setStateColor(defaultColor)}
                style={{backgroundColor: defaultColor}} />
            const isFirstRow = (index < rowLength);
            if (isFirstRow) firstRow.push(colorButton);
            else secondRow.push(colorButton);
        });

        const firstDiv = <div className="color-select-row">{firstRow.map((button) => {return button;})}</div>;
        const secondDiv = <div className="color-select-row">{secondRow.map((button) => {return button;})}</div>
        
        return (<>
            {firstDiv}
            {secondDiv}
        </>);
    }

    return (
        <>
            <div className="color-select-parent">
            <button tabIndex={tabIndex} type="button"
            className="selector-form-element selector-form-color" onClick={displayColorPicker}
            style={{
                backgroundColor: color,
            }}/>
            {isDisplayColorPicker ?
                <div className="color-select">
                    {generateColourOptions()}
                </div>
                : null}
            </div>
        </>
    )
}

export default ColorPicker
