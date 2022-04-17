
class RecipeSummary {
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
