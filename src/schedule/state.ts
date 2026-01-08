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

export default State
