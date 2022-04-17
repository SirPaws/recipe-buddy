/*
 * This class creates a button
 * constructor ( x, y, width, height, [optionals] )
 *  x: the x position of the center of the button 
 *  y: the y position of the center of the button 
 *  width: width of the button
 *  height: height of the button
 *  optionals: 
 *    double_click_time: the maximum amount of time in milliseconds 
        between clicks for a double click
 *    corners: this structure is to round the corners of the rectange
          if this is a number it will set each corner to be that value
          example: new Button (x, y, width, height, { corners: 20 })
          will make a rounded button where the corners have a radius of 20. 
          Check p5 rect reference for more information.
          other valid ways to set the corners are shown here
          array:         [20, 20, 20, 20]
          short names:   {tl: 20, bl: 20, tr: 20, br: 20}
          verbose names: {top_left: 20, bottom_left: 20, top_right: 20, bottom_right: 20}
 *    the parameters off, on, hover, hold, text_on, text_off, text_hover and text_hold
        are all colors (rgb) and can either be used
          array        : [255, 255, 255]
          short names  : {r: 255, g: 255, b: 255}
          verbose names: {red: 255, green: 255, blue: 255}
 *    text: this will be the text written on the button,
 */
class Button {
    static get OFF()         { return 0; }
    static get ON()          { return 1; }
    static get HOVER()       { return 2; }
    static get HOLD()        { return 3; }
    static get DBL_CLICK()   { return 4; }
    static get LONG_PRESS()  { return 5; }

    constructor(
        x,
        y,
        width,
        height,
        {
            is_toggle = false,
            double_click_time = 500,
            long_press_time   = 3000,
            corners = null,
            off   = [127, 127, 127],
            on    = [55, 55, 55],
            hover = [72, 72, 72],
            hold  = undefined,
            text_on = [255, 255, 255],
            text_off = [255, 255, 255],
            text_hover = [255, 255, 255],
            text_hold  = undefined,
            text = "",
        } = {}
    ) {
        this.x = x - .5 * width;
        this.y = y - .5 * height;
        this.width = width;
        this.height = height;
        this.rect_corners = this._corners_helper(corners);
        this.is_toggle = is_toggle;

        let colors = {};
        colors.off        = this._color_helper(off); 
        colors.on         = this._color_helper(on); 
        colors.hover      = this._color_helper(hover); 
        colors.text_on    = this._color_helper(text_on); 
        colors.text_off   = this._color_helper(text_off); 
        colors.text_hover = this._color_helper(text_hover);
        if (this._is_nil_non_zero(hold))
            colors.hold = colors.on;
        else colors.hold = this._color_helper(hold);
        if (this._is_nil_non_zero(text_hold))
            colors.text_hold = colors.text_on;
        else colors.text_hold = this._color_helper(text_hold);

        this.colors = colors;  

        this.text = text;
        this.current_state  = Button.OFF;
        this.previous_state = Button.OFF;
        this.double_click_time = double_click_time;
        this.long_press_time   = long_press_time;
        this.last_click = 0;
        this.last_press = 0;
    }

    _color_helper(c) {
        const nil = this._is_nil_non_zero;
        if (typeof(c) === 'number') return [c, c, c];

        let result = [];
        if (!nil(c[0]))             result[0] = c[0];
        else if (!nil(corners.r))   result[0] = c.r;
        else if (!nil(corners.red)) result[0] = c.red;

        if (!nil(c[1]))               result[1] = c[1];
        else if (!nil(corners.g))     result[1] = c.g;
        else if (!nil(corners.green)) result[1] = c.green;

        if (!nil(c[2]))              result[2] = c[2];
        else if (!nil(corners.b))    result[2] = c.b;
        else if (!nil(corners.blue)) result[2] = c.blue;
        return result;
    }

    _is_nil_non_zero(value) {
        return value === null || value === undefined;
    }

    _corners_helper(corners) {
        if (typeof corners === "number")
            return { tl: corners, tr: corners, br: corners, bl: corners };
        let nil = this._is_nil_non_zero;
        let result = {};

        if (corners == null) return { tl: 0, tr: 0, br: 0, bl: 0 };

        if (!nil(corners[0])) result.tl = corners[0];
        else if (!nil(corners.tl)) result.tl = corners.tl;
        else if (!nil(corners.top_left)) result.tl = corners.top_left;
        else result.tl = 0;

        if (!nil(corners[1])) result.tr = corners[1];
        else if (!nil(corners.tr)) result.tr = corners.tr;
        else if (!nil(corners.top_right)) result.tr = corners.top_right;
        else result.tr = 0;

        if (!nil(corners[2])) result.bl = corners[2];
        else if (!nil(corners.bl)) result.bl = corners.bl;
        else if (!nil(corners.bottom_left)) result.bl = corners.bottom_left;
        else result.bl = 0;

        if (!nil(corners[3])) result.br = corners[3];
        else if (!nil(corners.br)) result.br = corners.br;
        else if (!nil(corners.bottom_right)) result.br = corners.bottom_right;
        else result.br = 0;

        return result;
    }

    #toggle_update(state) {
        if (state == Button.ON) {
            if (this.previous_state == Button.ON)
                 this.current_state = Button.OFF;
            else this.current_state = Button.ON;
        } else if (state == Button.HOVER && this.previous_state == Button.OFF) {
            this.current_state = Button.HOVER;
        } else if (state == Button.OFF && this.previous_state == Button.HOVER) {
            this.current_state = Button.OFF;
        } else {
            this.current_state = this.previous_state;
        }
        return this.current_state;
    }

    #generic_update(state) {
        if (state == Button.ON) {
            if (this.previous_state == Button.ON) {
                this.last_press = millis();
                state = Button.HOLD;
            } else if (this.previous_state == Button.HOLD) {
                if (millis() - this.last_press >= this.long_press_time) {
                    state = Button.LONG_PRESS
                    this.last_press = Infinity;
                } else state = Button.HOLD;
            } else if (this.previous_state == Button.DBL_CLICK) {
                state = Button.HOLD;
            } else if (this.previous_state == Button.OFF || this.previous_state == Button.HOVER) {
                let current = millis();
                if (current - this.last_press < this.double_click_time) {
                    state = Button.DBL_CLICK;
                    this.last_click = 0;
                }
            }
        }

        if (state == Button.OFF || state == Button.HOVER) {
            if (this.previous_state == Button.HOLD || this.previous_state == Button.ON) {
                this.last_click = millis();
            }

        }

        if (state == Button.DBL_CLICK || state == Button.LONG_PRESS)
            this.current_state = Button.HOLD;
        else this.current_state = state;
    }

    update(x, y, press) {
        this.previous_state = this.current_state;
        let state = Button.OFF;
        if (
            x >= this.x &&
            x <= this.x + this.width &&
            y >= this.y &&
            y <= this.y + this.height
        ) {
            if (press) {
                state = Button.ON;
            } else {
                state = Button.HOVER;
            }
        }

        if (this.is_toggle)
             return this.#toggle_update(state);
        else return this.#generic_update(state);
    }

    draw() {
        let button_color;
        let text_color;
        switch (this.current_state) {
            case Button.OFF:
                button_color = this.colors.off;
                text_color = this.colors.text_off;
                break;
            case Button.LONG_PRESS:
            case Button.DBL_CLICK:
            case Button.HOLD:
                button_color = this.colors.hold;
                text_color = this.colors.text_hold;
                break;
            case Button.ON:
                button_color = this.colors.on;
                text_color = this.colors.text_on;
                break;
            case Button.HOVER:
                button_color = this.colors.hover;
                text_color = this.colors.text_hover;
                break;
        }

        push();
        let corners = this.rect_corners;
        rectMode(CORNER);
        fill(button_color[0], button_color[1], button_color[2]);
        rect(
            this.x,
            this.y,
            this.width,
            this.height,
            corners.tl,
            corners.tr,
            corners.br,
            corners.bl
        );
        if (this.text != "") {
            textAlign(CENTER, CENTER);
            fill(text_color);
            text(this.text, this.x + this.width / 2, this.y + this.height / 2);
        }
        pop();
    }
}
