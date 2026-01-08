import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import './ColorPicker.css';

interface Props {
    color: string,
    setColor: React.Dispatch<React.SetStateAction<string>>,
    isDefault: boolean,
}

// BIG TODO: MAKE A LIST OF PRESET COLOURS INSTEAD OF A COLOUR PICKER

function ColorPicker( {color, setColor, isDefault } : Props ) {
    const [isDisplayColorPicker, setIsDisplayColorPicker] = useState(false);
    //return <HexColorPicker color={color} onChange={setColor} />;

    function displayColorPicker() {
        if (!isDefault) { setIsDisplayColorPicker(true); }
    }

    return (
        <>
            <button type="button" className="selector-form-element selector-form-color" onClick={displayColorPicker}
            style={{
                backgroundColor: color,
            }}/>
            {isDisplayColorPicker ?
                <HexColorPicker className="color-picker"
                color={color}
                onChange={setColor}
                onMouseLeave={() => setIsDisplayColorPicker(false)} /> 
                : <></>}
        </>
    )
}

export default ColorPicker
