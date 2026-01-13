import { useLayoutEffect, useRef } from 'react';
import State from './state';
import './Timeblock.css'
import type Coordinate from './coordinate.ts'

interface Props {
    col: number,
    row: number,
    value: State,
    handleSelected: (col: number, row: number, isFirstElement: boolean) => void,
    focusedElement: {col: number, row: number},
    setFocusedElement: React.Dispatch<React.SetStateAction<Coordinate>>
}

function Timeblock( {col, row, value, handleSelected, focusedElement, setFocusedElement} : Props) {
    /*
     * TODO: REMOVE THIS FUNCTION IF NOT NECESSARY
     * Gets the background colour of the Timeblock component based on its `value`
     * @returns CSS colour of form `rgb(R, G, B)`
     */
    //function _getBackgroundColor() {
    //    return value.color;
    //}
    const isFocused = useRef(false);

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

    function isFirstGridElem() {
        return (col === focusedElement.col && row === focusedElement.row);
    }

    function setIsFocused(value: boolean) {
        isFocused.current = value;
    }

    const refs = useRef<(HTMLDivElement | null)[][]>([]);

    // TODO: MOVE THIS INTO THE PARENT SCHEDULE
    function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        if (!e.key.startsWith("Arrow")) return;
        const column = focusedElement.col;
        const row = focusedElement.row;
        let nextFocusedElement = null;
        // todo: make a move function for these
        switch (e.key) {
            case "Enter":
                // TODO: add arrow key functionality on grid
                break;
            case "ArrowUp":
                nextFocusedElement = {col: column, row: row - 1};
                setFocusedElement({col: column, row: row - 1});
                break;
            case "ArrowDown":
                nextFocusedElement = {col: column, row: row + 1};
                setFocusedElement(nextFocusedElement);
                break;
            case "ArrowLeft":
                nextFocusedElement = {col: column - 1, row: row};
                setFocusedElement(nextFocusedElement);
                break;
            case "ArrowRight":
                nextFocusedElement = {col: column + 1, row: row};
                setFocusedElement(nextFocusedElement);
                break;
            default:
                break;
        }
        
        //if (nextFocusedElement && isFocused.current) {
        //    console.log("happened!")
        //    refs.current[nextFocusedElement.row]?.[nextFocusedElement.col]?.focus();
        //}
        
        e.preventDefault();
    }

    // TODO: change all logic to parent
    useLayoutEffect(() => {
        if (!isFocused.current) return;
        refs.current[focusedElement.row]?.[focusedElement.col]?.focus();
    }, [focusedElement]);

    /*TODO: ADD ACCESSIBLE GRID BY ARROW KEYS */
    return (
        <div
        role="gridcell"
        tabIndex={isFirstGridElem() ? 0 : 0}
        className="timeblock no-drag"
        id={`C${col} R${row}`}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMouseDown={(e) => handleMouseDown(e)}
        onClick={(e) => handleClick(e)}
        onMouseEnter={(e) => handleMouseEnter(e)}
        ref={(element) => {
            if (!refs.current[row]) refs.current[row] = [];
            if (element) refs.current[row][col] = element;
        }}
        style={{
            "backgroundColor": value.color,
            borderRight: "1px solid black",
            borderBottom: getBorderBottom(),
        }}></div>
    );
}

export default Timeblock
