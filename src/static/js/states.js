
// initialise 'persitent' data
function init(state) {
    state.updateUserdata(()=>{
        return {
            current_recipe: null,
            ingredients: [],
            recipes: [],
            rec: new RecipeSpeechRecognition("en-US"),
            pipe: null,
        };
    })

    let pipe = new Pipe((_0, _1, data) => {
        let userdata = state.userdata;

        switch (data.id) {
        case 'ingredient-list':
            if (Array.isArray(data.ingredients) && data.ingredients.length > 0)
                userdata.ingredients = data.ingredients;
            break;
        case 'recipe-list':
            userdata.recipes = [];
            for (let result of data.recipes) {
                let recipe = new RecipeSummary(result);
                userdata.recipes.push(recipe);
            }
            break;
        case 'recipe-info':
                userdata.current_recipe = new Recipe(data.info);
        default: break;
        }

        state.updateUserdata(_=>{
            return userdata;
        });
    });
    
    pipe.getIngredients();
    return state.updateUserdata( userdata=>{
        userdata.pipe = pipe;
        return userdata;
    });
}

let debug_choosing;
let start_button;
let initialised_start = false;
let first_enable = true;
let skip_button
function start(state, {current_recipe, ingredients, recipes, rec, pipe}) {
    if (!initialised_start) {
        start_button   = new Button(width/2, height/2, 900, 200, {is_toggle: true});
        skip_button    = new Button(width/2, height/2 + 200, 500, 100, { text: 'show ingredients'});
        initialised_start = true;
    }

    let mouse = getMouse();
    let start_state    = start_button.update(mouse.x, mouse.y, mouse.button == LEFT);
    let skip_state     = skip_button.update(mouse.x, mouse.y, mouse.button == LEFT);

    start_button.draw();
    skip_button.draw();

    withState(_=>{
        if (start_state == Button.ON) {
            fill(255, 0, 0);    
            if (first_enable) {
                rec.enable();
                first_enable = false;
            }

            if (!rec.is_on)
                start_state = start_button.update(start_button.x + start_button.width/2, start_button.y + start_button.height/2, true);
        } else {
            if (!first_enable) {
                if (rec.is_on) rec.disable();
                first_enable = true;
            }
            fill(255);
        }
        circle(width/2, height/2, 100);
    })
    

    withState(_=>{
        textSize(98);
        textAlign(CENTER, CENTER);
        text('RECIPE BUDDY', width/2, height/2 - 200 - 100);
    });
    
    if (skip_state == Button.ON) {
        state.setState(ProgramState.MODIFYING_INGREDIENTS);
    }

    if (rec.is_on && rec.is_listening && rec.sentences != null) {
        state.setState(ProgramState.MODIFYING_INGREDIENTS);
    }
    return {current_recipe, ingredients, recipes, rec, pipe};
}

let initialised_modify = false;
let mic_button;
function modify(state, {current_recipe, ingredients, recipes, rec, pipe}) {
    if (!initialised_modify) {
        mic_button = new Button(width - (100 + 10), 60/2, 200, 60, {is_toggle: true});
        mic_button.update(mic_button.x + mic_button.width/2, mic_button.y + mic_button.height/2, true);
        initialised_modify = true;
    }

    let mouse = getMouse();
    let mic_button_state = mic_button.update(mouse.x, mouse.y, mouse.button == LEFT);
    mic_button.draw();
    
    if (ingredients != null) {
        withState(_=>{
            scrollable(5, _=>{
                textSize(98);
                textAlign(CENTER, CENTER);
                let y_offset = 98;
                for (let ingredient of ingredients) {
                    text(ingredient, width/2, y_offset)
                    y_offset += 98;
                }
            });
        });
    }

    withState(_=>{
        if (mic_button_state == Button.ON) {
            fill(255, 0, 0);    
            if (first_enable) {
                rec.enable();
                first_enable = false;
            }

            if (!rec.is_on)
                mic_button_state = mic_button.update(mic_button.x + mic_button.width/2, mic_button.y + mic_button.height/2, true);
        } else {
            if (!first_enable) {
                if (rec.is_on) rec.disable();
                first_enable = true;
            }
            fill(255);
        }
        circle(width - (100 + 10), 60/2, 30);
    })


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
            if (rec.is_on) rec.disable();
            pipe.getRecipes();
            state.setState(ProgramState.CHOOSING_RECIPE);
        }
        rec.clear();
    }

    return {current_recipe, ingredients, recipes, rec, pipe};
}

function choosing(state, {current_recipe, ingredients, recipes, rec, pipe}) {
    (state);
    
    let mouse = getMouse();
    let got_request = { 0: false, id: null };
    let offset = 0;
    let y = height / 2;
    
    {
        let full_width = 0;
        for (let recipe of recipes) {
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
        state.setState(ProgramState.DISPLAYING_RECIPE)
    }
    
    return {current_recipe, ingredients, recipes, rec, pipe};
}


function displaying(state, {current_recipe, ingredients, recipes, rec, pipe}) {
    if (current_recipe == null)
        return {current_recipe, ingredients, recipes, rec, pipe};

    scrollable(5, _=>{
        current_recipe.display();
    });

    return {current_recipe, ingredients, recipes, rec, pipe};
}
