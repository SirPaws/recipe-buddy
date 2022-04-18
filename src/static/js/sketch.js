let prog_state = new ProgramState(init, [start, modify, choosing, displaying]);
function setup() {
    createCanvas(windowWidth, windowHeight);
}


function draw() {
    background(220);

    textSize(32);
    textAlign(CENTER, CENTER);


    prog_state.update();
}
