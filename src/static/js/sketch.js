let rec;
let button;
function setup() {
    createCanvas(windowWidth, windowHeight);
    rec = new RecipeSpeechRecognition("en-US");
    button = createButton("click me");
    button.position(0, 0);
    button.mousePressed(() => rec.toggle());
}

let matches;
function draw() {
    background(220);

    textSize(32);
    textAlign(CENTER, CENTER);
    text(`heres a joke: ${joke}`, width/2, height/2); 

    matches = rec.contains([ 'rice', 'blueberries', 'potatoes', 'flour', 'cherries']);
    if (matches) {
        console.log(matches)
        console.log(`longest match was ${matches[0].values}`);
        noLoop();
    }
}
