
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

