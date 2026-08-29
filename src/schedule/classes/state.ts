import { DEFAULT_COLORS } from "./defaultColors";

class State {
    name: string;
    color: string;
    isDefault: boolean;

    constructor(name: string, color: string, isDefault: boolean=false) {
        this.name = name;
        this.color = color;
        this.isDefault = isDefault;
    }
}
export const errorState = new State("ERROR", DEFAULT_COLORS.black, true);
export const unavailableState = new State("Unavailable", DEFAULT_COLORS.white, true);
export const unsureState = new State("If Necessary", DEFAULT_COLORS.yellow, true); // todo: remove for final product
export const availableState = new State("Available", DEFAULT_COLORS.green, true);

export default State
