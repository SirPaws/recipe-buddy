
class CommandKind {
    static get ADD_INGREDIENT()    { return 0; }
    static get REMOVE_INGREDIENT() { return 1; }
    static get GET_RECIPE()        { return 2; }
}

// this is general program state handling
let display_offset = 0;
let scrollable_state = false;
class ProgramState {
    static get START_UP()              { return 0; }
    static get MODIFYING_INGREDIENTS() { return 1; }
    static get CHOOSING_RECIPE()       { return 2; }
    static get DISPLAYING_RECIPE()     { return 3; }

    #state = ProgramState.START_UP;
    #functions = null;
    #userdata = null;
    constructor(init, fncs = [start, modify, choosing, displaying]) {
        this.#state = ProgramState.START_UP;
        this.#functions = fncs;
        this.#userdata = init(this);
    }

    update() {
        let data = this.#functions[this.#state](this, this.#userdata);
        this.#userdata = data || this.#userdata;
    }

    get userdata() { return this.#userdata; }

    get state() {
        return this.#state;
    }

    setState(state) {
        if (state < ProgramState.START_UP || state > ProgramState.DISPLAYING_RECIPE)
            return;
        this.#state = state;
        display_offset = 0;
    }

    updateUserdata(updater = userdata => userdata) {
        this.#userdata = updater(this.#userdata);
        return this.#userdata;
    }
}

// utility function

function withState(callback = _=>{}) {
    push()
    callback();
    pop()
}

function mouseWheel(event) {
    display_offset -= event.delta;
}

function decay(max, x) {
    return max * Math.log(max + x) - max * Math.log(max);
}

function scrollable(max_offset, callback = _=>{}) {
    scrollable_state = true;

    push()
    translate(0, display_offset);
    callback();
    pop();

    if (display_offset > max_offset + 0.1) display_offset -= decay(max_offset, display_offset);

    scrollable_state = false;
}

let mouse_button = null;
function getMouse() {
    let button = mouse_button;
    mouse_button = null;
    let mouse_y = mouseY;

    if (scrollable_state) mouse_y -= display_offset;

    return {
        x: mouseX,
        y: mouse_y,
        button: button
    };
}

function mousePressed()  { 
    mouse_button = mouseButton; 
}
function mouseReleased() {
    mouse_button = null;
}
