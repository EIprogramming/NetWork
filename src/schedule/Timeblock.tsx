//import {useRef, useState } from 'react'
import State from './state';
import './Timeblock.css'

interface Props {
    col: number,
    row: number,
    value: State,
    handleSelected: (col: number, row: number, isFirstElement: boolean) => void,
}

function Timeblock( {col, row, value, handleSelected} : Props) {
    /*
     * TODO: REMOVE THIS FUNCTION IF NOT NECESSARY
     * Gets the background colour of the Timeblock component based on its `value`
     * @returns CSS colour of form `rgb(R, G, B)`
     */
    //function _getBackgroundColor() {
    //    return value.color;
    //}

    function handleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) { handleMouseDown(e) }

    function handleMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (e.buttons % 2) {
            handleSelected(col, row, true);
        }
    }

    function handleMouseEnter(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (e.buttons % 2) {
            handleSelected(col, row, false);
        }
    }

    /**
     * Gets the bottom border of the Timeblock based on its row.
     * If it is the second row of an hour, it has a dashed border
     * If it is the final row of an hour, it has a solid border
     * @returns CSS border of form `SIZE px | STYLE | COLOUR`
     */
    function getBorderBottom() {
        if (row % 4 == 1) {
            return "1px dashed black";
        } else if (row % 4 == 3) {
            return "1px solid black";
        }
    }
    /*TODO: ADD ACCESSIBLE GRID BY ARROW KEYS */
    return (
        <div
        className="timeblock no-drag"
        id={`C${col} R${row}`}
        onMouseDown={(e) => handleMouseDown(e)}
        onClick={(e) => handleClick(e)}
        onMouseEnter={(e) => handleMouseEnter(e)}
        style={{
            "backgroundColor": value.color,
            borderRight: "1px solid black",
            borderBottom: getBorderBottom(),
        }}></div>
    );
}

export default Timeblock
