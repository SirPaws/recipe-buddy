class CommandKind {
    static get ADD_INGREDIENT()    { return 0; }
    static get REMOVE_INGREDIENT() { return 1; }
    static get GET_RECIPE()        { return 2; }
}

let prog_state = new ProgramState(init, [start, modify, choosing, displaying]);

/*
let rec;

let enable_rec;
let disable_rec;

let ingredients ;
let recipes = [];

let full_recipe = null;

let pipe = new Pipe((_0, _1, data) => {
    if (rec.is_on) rec.is_on = false;

    switch (data.id) {
    case 'ingredient-list':
        if (Array.isArray(data.ingredients) && data.ingredients.length > 0)
            ingredients = data.ingredients;
        break;
    case 'recipe-list':
        full_recipe = NULL;
        break;
    case 'recipe-info':
        recipes = [];
        for (let result of data.recipes) {
            let recipe = new RecipeSummary(result);
            recipes.push(recipe);
        }
    default: break;
    }
});
*/

function setup() {
    createCanvas(windowWidth, windowHeight);
    /*
    rec = new RecipeSummarySpeechRecognition("en-US");

    enable_rec = createButton("enable recognition");
    enable_rec.position(width - 300, 0);
    enable_rec.mousePressed(() => rec.enable());

    disable_rec = createButton("disable recognition");
    disable_rec.position(width - 150, 0);
    disable_rec.mousePressed(() => rec.disable());

    // pipe.getIngredients();
    ingredients = [
        'cream cheese',
        'banana',
        'fruit paste',
        'flour',
        'salt',
    ]
    pipe.forceState(JSON.parse(test_data), Pipe.DONE);
    */
}


function draw() {
    background(220);

    textSize(32);
    textAlign(CENTER, CENTER);


    prog_state.update();

    /*
    if (pipe.state == Pipe.LOADING) {
        text('Loading', width/2, height/2);
    }
    else if (pipe.state == Pipe.DONE) {
        recipes = [];
        for (let result of pipe.data) {
            let recipe = new RecipeSummary(result);
            recipes.push(recipe);
        }
    }

    if (ingredients != null) {
        push();
        textSize(32);
        textAlign(LEFT, TOP);
        let y_offset = 0;
        for (let ingredient of ingredients) {
            text(ingredient, 0, y_offset)
            y_offset += 32;
        }
        pop();
    }

    let mouse = getMouse();
    let got_request = { 0: false, id: null };
    let offset = 0;
    let y = height / 2;
    
    {
        let full_width = 0;
        for (recipe of recipes) {
            full_width += recipe.width + 5;
        }
        full_width = constrain(full_width, 0, width);
        offset = abs(full_width - width)/2;
    }


    for (recipe of recipes) {
        push();
        if (mouse.x >= offset && mouse.x <= offset + recipe.width &&
            mouse.y >= y      && mouse.y <= y + recipe.height*2)
        {
            if (mouse.button == LEFT) {
                fill(0, 255, 0);
                console.log(`requested recipe(${recipe.id}): ${recipe.title}`);
                got_request[0] = true;
                got_request.id = recipe.id;
            } else fill(255, 0, 0);
        } else fill(255);
        rect(offset, y, recipe.width, recipe.height*2);
        pop();

        recipe.draw(offset, y);
        offset += recipe.width + 5;
    }
    if (got_request[0]) {
        recipes = [];
        pipe.getRecipeInfo(got_request.id);
    }

    if (rec.sentences != null) {
        
        let sentences = [];
        let should_get_recipes = false;
        for (let sentence of rec.sentences) {
            let state = CommandKind.ADD_INGREDIENT;
            if (sentence.toLowerCase().includes('what can i make')) {
                should_get_recipes = true;
                break;
            } else if (sentence.toLowerCase().includes('remove')) {
                state = CommandKind.REMOVE_INGREDIENT;
            } else if (sentence.toLowerCase().includes('out of')) {
                state = CommandKind.REMOVE_INGREDIENT;
            }
            sentences.push({text: sentence, state: state});
        }

        let add_list    = [];
        let remove_list = [];
        for (let sentence of sentences) {
            switch (sentence.state) {
            case CommandKind.REMOVE_INGREDIENT:
                    remove_list.push(sentence.text);
                    break;
            case CommandKind.ADD_INGREDIENT:
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
    */
}
