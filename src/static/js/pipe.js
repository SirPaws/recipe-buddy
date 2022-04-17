
/*
class Thing {
    private int a = 5;
    Thing() {
        
    }
}
*/


// this is our gateway between python and js
class Pipe {
    static get SLEEPING() { return 0; }
    static get LOADING () { return 1; }
    static get DONE    () { return 2; }
    constructor(result_callback = (self, pipe, data) => {self; pipe; data;}) {
        this._data  = null;
        this._state = Pipe.SLEEPING;
        this.xhr = new XMLHttpRequest();
        
        let self = this;
        this.xhr.onload = function() {
            self._data = JSON.parse(this.responseText);
            if (self._data.id == null)
                console.error('invalid result from xml http request');
            //TODO maybe remove this
            if (self._data.id == 'error') {
                console.warn(self._data.message);
                return;
            }
            result_callback(this, self, self._data);

            if (self._state != Pipe.SLEEPING)
                self._state = Pipe.DONE;
        }
        this.xhr.onerror = (ev) => {
            console.error(ev);
        }
    }

    forceState(data, state) {
        this._data = data;
        this._state = state;
    }

    get state() {
        return this._state;
    }

    get data() {
        if (this._data != null)
            this._state = Pipe.SLEEPING;

        return this._data;
    }

    _write(data, url) {
        const string = JSON.stringify(data);
        this._state = Pipe.LOADING;

        this.xhr.open("POST", url, true);
        this.xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        this.xhr.send(string);
    }

    getIngredients() {
        this.xhr.open("GET", '/get_ingredients', true);
        this.xhr.send();
    }

    removeIngredients(data) {
        this._write(data, '/remove_ingredients');
        this._state = Pipe.SLEEPING;
    }

    addIngredients(data) {
        this._write(data, '/add_ingredients');
        this._state = Pipe.SLEEPING;
    }

    getRecipes() {
        this.xhr.open("GET", '/get_recipes', true);
        this.xhr.send();
    }
    
    getRecipeInfo(id) {
        this.xhr.open("GET", `/get_recipe_info?id=${id}`, true);
        this.xhr.send();
    }
}


