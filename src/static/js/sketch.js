let rec;
let button;
let ingredients;
let recipes = [];
let pipe = new Pipe((_0, _1, data) => {
    if (data.ingredients != null) {
        ingredients = data.ingredients || ingredients;
        return;
    }
    if (result.length) {
        recipes = [];
        for (let result of data) {
            let recipe = new Recipe(result);
            recipes.push(recipe);
        }
    }
});

function setup() {
    createCanvas(windowWidth, windowHeight);
    rec = new RecipeSpeechRecognition("en-US");
    button = createButton("click me");
    button.position(0, 0);
    button.mousePressed(() => rec.toggle());
    // pipe.forceState(JSON.parse(test_data), Pipe.DONE);

    pipe.getIngredients();
}

class Recipe {
    constructor(obj) {
        this._ready = false;
        this.id = obj.id;
        this.title = obj.title;
        this.image_path = obj.image;
        this.image = loadImage(obj.image, () => { this._ready = true });
        this.usedIngredientCount = obj.usedIngredientCount;
        this.missedIngredientCount = obj.missedIngredientCount;
        this.likes = obj.likes;
    }

    get width() {
        if (this._ready == false) return 0;
        return this.image.width;
    }
    
    get height() {
        if (this._ready == false) return 0;
        return this.image.height;
    }

    draw(x, y) {
        if (this._ready == false) return;

        image(this.image, x, y);
        push()
        textSize(32);
        textAlign(CENTER, CENTER);
        text(this.title, x, y + this.height, this.width, this.height);
        pop()
    }
}

class ProgramState {
    static get ADD_INGREDIENT()    { return 0; }
    static get REMOVE_INGREDIENT() { return 1; }
    static get GET_RECIPE()        { return 2; }
}

function draw() {
    background(220);

    textSize(32);
    textAlign(CENTER, CENTER);

    if (pipe.state == Pipe.LOADING) {
        text('Loading', width/2, height/2);
    }
    else if (pipe.state == Pipe.DONE) {
        recipes = [];
        for (let result of pipe.data) {
            let recipe = new Recipe(result);
            recipes.push(recipe);
        }
    }

    let offset = 0;
    let y = height / 2;
    for (recipe of recipes) {
        recipe.draw(offset, y);
        offset += recipe.width + 5;
    }

    if (rec.sentences != null) {
        
        let sentences = [];
        let should_get_recipes = false;
        for (let sentence of rec.sentences) {
            let state = ProgramState.ADD_INGREDIENT;
            if (sentence.toLowerCase().includes('what can i make')) {
                should_get_recipes = true;
                break;
            } else if (sentence.toLowerCase().includes('remove')) {
                state = ProgramState.REMOVE_INGREDIENT;
            } else if (sentence.toLowerCase().includes('out of')) {
                state = ProgramState.REMOVE_INGREDIENT;
            }
            sentences.push({text: sentence, state: state});
        }

        let add_list    = [];
        let remove_list = [];
        for (let sentence of sentences) {
            switch (sentence.state) {
            case ProgramState.REMOVE_INGREDIENT:
                    remove_list.push(sentence.text);
                    break;
            case ProgramState.ADD_INGREDIENT:
                    add_list.push(sentence.text);
                    break;
            }
        }
        if (add_list.length > 0)    pipe.addIngredients(add_list);
        if (remove_list.length > 0) pipe.removeIngredients(remove_list);

        if (should_get_recipes) {
            pipe.getRecipes(null);
            sentences = [];
        }
        rec.clear();
    }
    //     noLoop();
    // }
}
