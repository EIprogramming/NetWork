import type React from 'react';
import State from './classes/state';
import './Timeblock.css';
import Coordinate from './classes/coordinate';

interface Props {
    col: number,
    row: number,
    value: State,
    ariaLabel: string,
    handleSelected: (col: number, row: number, isFirstElement: boolean) => void,
    focusIndex: number,
    refs: React.RefObject<(HTMLDivElement | null)[][]>,
    hoveredTimeblock: Coordinate,
    setHoveredTimeblock: React.Dispatch<React.SetStateAction<Coordinate>>,
}

function Timeblock({
    col,
    row,
    value,
    ariaLabel,

    handleSelected,
    focusIndex,
    refs,
    hoveredTimeblock,
    setHoveredTimeblock } : Props) {

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

        setHoveredTimeblock( new Coordinate(col, row));
    }

    function handleMouseLeave() {
        if (hoveredTimeblock.col == col && hoveredTimeblock.row == row) {
            setHoveredTimeblock( new Coordinate(-1, -1) );
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

    function getBorderLeft() {
        if (col === 0) { return "1px solid black"; }
        return "";
    }

    return (
        <div
        aria-label={ariaLabel}
        role="gridcell"
        tabIndex={focusIndex}
        className="timeblock no-drag"
        id={`C${col} R${row}`}
        //onKeyDown={handleKeyDown}
        //onFocus={() => setIsFocused(true)}
        //onBlur={() => setIsFocused(false)}
        onMouseDown={(e) => handleMouseDown(e)}
        onClick={(e) => handleClick(e)}
        onMouseEnter={(e) => handleMouseEnter(e)}
        onMouseLeave={() => handleMouseLeave()}
        ref={(element) => {
            if (!refs.current[row]) refs.current[row] = []; // add a new row to the 2D array for each row
            if (element) refs.current[row][col] = element;
        }}
        style={{ /*TODO: MAKE A GENERIC BORDER FUNCTION */
            backgroundColor: value.color,
            borderTop: row === 0 ? "1px solid black" : "",
            borderRight: "1px solid black",
            borderBottom: getBorderBottom(),
            borderLeft: getBorderLeft()
        }}></div>
    );
}

export default Timeblock
