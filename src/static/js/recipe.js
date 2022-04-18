

class Recipe {
    #aggregateLikes = null;
    #analyzedInstructions = null;
    #cheap = null;
    #creditsText = null;
    #cuisines = null;
    #dairyFree = null;
    #diets = null;
    #dishTypes = null;
    #extendedIngredients = null;
    #missingIngredients = null;
    #gaps = null;
    #glutenFree = null;
    #healthScore = null;
    #id = null;
    #image = { path: null, is_ready: false, image: null };
    #imageType = null;
    #instructions = null;
    #lowFodmap = null;
    #occasions = null;
    #originalId = null;
    #pricePerServing = null;
    #readyInMinutes = null;
    #servings = null;
    #sourceName = null;
    #sourceUrl = null;
    #spoonacularScore = null;
    #summary = null;
    #sustainable = null;
    #title = null;
    #vegan = null;
    #vegetarian = null;
    #veryHealthy = null;
    #veryPopular = null;
    #weightWatcherSmartPoints = null;
    #winePairing = null;       

    #general_button = null;

    #ingredients_button = null;

    #instructions_button = null;
    constructor(obj) {
        console.log(obj);
        this.#aggregateLikes = obj.aggregateLikes;
        this.#analyzedInstructions = obj.analyzedInstructions;
        this.#cheap = obj.cheap;
        this.#creditsText = obj.creditsText;
        this.#cuisines = obj.cuisines;
        this.#dairyFree = obj.dairyFree;
        this.#diets = obj.diets;
        this.#dishTypes = obj.dishTypes;
        this.#extendedIngredients = obj.extendedIngredients;
        this.#missingIngredients = obj.missingIngredients;
        this.#gaps = obj.gaps;
        this.#glutenFree = obj.glutenFree;
        this.#healthScore = obj.healthScore;
        this.#id = obj.id;

        this.#image.path = obj.image;
        let img = loadImage(obj.image, _=>{ 
            this.#image.is_ready = true;
        });
        this.#image.image = img;
        this.#imageType = obj.imageType;
        this.#instructions = obj.instructions;
        this.#lowFodmap = obj.lowFodmap;
        this.#occasions = obj.occasions;
        this.#originalId = obj.originalId;
        this.#pricePerServing = obj.pricePerServing;
        this.#readyInMinutes = obj.readyInMinutes;
        this.#servings = obj.servings;
        this.#sourceName = obj.sourceName;
        this.#sourceUrl = obj.sourceUrl;
        this.#spoonacularScore = obj.spoonacularScore;
        this.#summary = obj.summary;
        this.#sustainable = obj.sustainable;
        this.#title = obj.title;
        this.#vegan = obj.vegan;
        this.#vegetarian = obj.vegetarian;
        this.#veryHealthy = obj.veryHealthy;
        this.#veryPopular = obj.veryPopular;
        this.#weightWatcherSmartPoints = obj.weightWatcherSmartPoints;
        this.#winePairing = obj.winePairing;       
        
        this.#general_button      = new Button(-50, -50, 10, 10);
        this.#ingredients_button  = new Button(-50, -50, 10, 10);
        this.#instructions_button = new Button(-50, -50, 10, 10);
    }

    #expand_general(state, y, rect_width) {
        if (state != Button.ON) return y;

        let string = '';

        if (this.#vegan)       string += 'vegan';
        if (this.#vegetarian)  string += ' vegetarian';
        if (this.#sustainable) string += ' sustainable';
        if (string.length > 0) string += '\n';

        let old_length = string.length;
        if (this.#glutenFree) string += ' gluten free';
        if (this.#dairyFree)  string += ' dairyFree';
        if (string.length != old_length) string += '\n'

        if (this.#creditsText) string += `Credits: ${this.#creditsText}\n`
        if (this.#sourceUrl) string += `url: ${this.#sourceUrl}\n`

        if (this.#servings)       string += `servings: ${this.#servings}\n`;
        if (this.#readyInMinutes) string += `ready in: ${this.#readyInMinutes} minutes\n`;

        withState(_=>{
            rectMode(CORNER);
            rect(width /2 - rect_width/2 + 20, y + 50, rect_width - 40, 300); 
        });
        
        withState(_=>{
            rectMode(CENTER);
            textAlign(CENTER, CENTER);
            text(string, width/2 - 10, y + 230, rect_width - 40, 200); 
        });
        return y + 300;
    }

    #expand_ingredients(state, y, rect_width) {
        if (state != Button.ON) return y;

        let size = this.#extendedIngredients.length * 32;
        size += this.#extendedIngredients.length * 5;

        let offset = 50 + 32;

        withState(_=>{
            rectMode(CORNER);
            rect(width /2 - rect_width/2 + 20, y + 50, rect_width - 40, size + 32); 
        });
        
        withState(_=>{
            textSize(32);
            textAlign(CENTER, CENTER);
            for (let ingredient of this.#extendedIngredients) {
                let result = this.#missingIngredients.filter(value => value.processedName == ingredient.processedName);
                if (result.length > 0) 
                     fill(255, 0, 0);
                else fill(0);
                text(ingredient.original, width/2, y + offset);
                offset += 32 + 5;
            }
        })

        return y + size + 32;
    }

    #expand_instructions(state, y, rect_width) {
        if (state != Button.ON) return y;



        withState(_=>{
            rectMode(CORNER);
            rect(width /2 - rect_width/2 + 20, y + 50, rect_width - 40, 600); 
        });
        withState(_=>{
            // can't figure out a good solution, so i'm giving up and just placing the text besides
            textAlign(CENTER, TOP);
            text(this.#instructions, width /2 - rect_width/2 + 20, y + 70, rect_width); 
            // text('heres some text\nwith a newline', width /2 - rect_width/2 + 20, y + 100, rect_width - 40);
        });
        return y + 600;
    }

    display() {

        if (!this.#image.is_ready) return;
        let img = this.#image.image;
        let mouse = getMouse();
        
        let y = 5;
        withState(_=>{
            textSize(32);
            textAlign(CENTER, CENTER);
            text(this.#title, width/2 - img.width/2, y, img.width, img.height/2);
        });

        y += img.height/2;
        image(img, width/2 - img.width/2, y);

        let state;

        y += img.height;
        let rect_width = img.width + 60;
        withState(_=>{
            if (this.#general_button.y != y + 30 - 50 * .5) {
                let old_state = this.#general_button.current_state;
                this.#general_button = new Button(width/2, y + 30, rect_width, 50, {off: 255, text_off: 0, text: "general", corners: 18, is_toggle: true}) 
                this.#general_button.current_state = old_state;
            }
            state = this.#general_button.update(mouse.x, mouse.y, mouse.button == LEFT);
        });
        y = this.#expand_general(state, y, rect_width);
        this.#general_button.draw();

        y += 30 + 50;
        withState(_=>{
            if (this.#ingredients_button.y != y + 30 - 50 * .5) {
                let old_state = this.#ingredients_button.current_state;
                this.#ingredients_button = new Button(width/2, y + 30, rect_width, 50, 
                    {off: 255, text_off: 0, text: "ingredients", corners: 18, is_toggle: true}) 
                this.#ingredients_button.current_state = old_state;
            }
            state = this.#ingredients_button.update(mouse.x, mouse.y, mouse.button == LEFT);
        });
        y = this.#expand_ingredients(state, y, rect_width);
        this.#ingredients_button.draw();

        y += 50 + 30;
        withState(_=>{
            if (this.#instructions_button.y != y + 30 - 50 * .5) {
                let old_state = this.#instructions_button.current_state;
                this.#instructions_button = new Button(width/2, y + 30, rect_width, 50, 
                    {off: 255, text_off: 0, text: "instructions", corners: 18, is_toggle: true}) 
                this.#instructions_button.current_state = old_state;
            }
            state = this.#instructions_button.update(mouse.x, mouse.y, mouse.button == LEFT);
        });
        y = this.#expand_instructions(state, y, rect_width);
        this.#instructions_button.draw();

        y += 30 + 50;
    }
}

