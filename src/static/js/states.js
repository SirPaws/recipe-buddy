
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
        if (userdata.rec.is_on) {
            state.updateUserdata(userdata =>{
                userdata.rec.is_on = false;
                return userdata;
            })
        }

        switch (data.id) {
        case 'ingredient-list':
            if (Array.isArray(data.ingredients) && data.ingredients.length > 0)
                userdata.ingredients = data.ingredients;
            break;
        case 'recipe-list':
            self_state.recipes = [];
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

function start(state, {current_recipe, ingredients, recipes, rec, pipe}) {
    state.setState(ProgramState.CHOOSING_RECIPE);
    let json_recipes = JSON.parse(test_data);
    recipes = [];
    for (let result of json_recipes) {
        let recipe = new RecipeSummary(result);
        recipes.push(recipe);
    }

    return {current_recipe, ingredients, recipes, rec, pipe};
}

function modify(state, {current_recipe, ingredients, recipes, rec, pipe}) {
    text('modify', width/2, height/2);
    if (keyIsPressed) state.setState(ProgramState.CHOOSING_RECIPE);

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

let display_offset = 0;
function decay(x) {
    return 5 * Math.log(5 + x) - 5 * Math.log(5);
}

function displaying(state, {current_recipe, ingredients, recipes, rec, pipe}) {
    if (current_recipe == null)
        return {current_recipe, ingredients, recipes, rec, pipe};

    push()
    translate(0, display_offset);
    current_recipe.display();
    pop();


    if (display_offset > 5.1) display_offset -= decay(display_offset);
    return {current_recipe, ingredients, recipes, rec, pipe};
}

function mouseWheel(event) {
    display_offset -= event.delta;
}

let mouse_button = null;
function getMouse() {
    let button = mouse_button;
    mouse_button = null;

    return {
        x: mouseX,
        y: mouseY - display_offset,
        button: button
    };
}

function mousePressed()  { 
    mouse_button = mouseButton; 
}
function mouseReleased() {
    mouse_button = null;
}
