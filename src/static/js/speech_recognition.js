class RecipeSpeechRecognition {
    // 'lang' is a BCP 47 language tag
    // 'maxAlternatives' is how many interpretations the engine should attempt
    //TODO(jpm): maybe make some optional parameters to expose options like continuous?
    //           right now to make it continuous you would either have to hack it
    //           or change the implementation
    //
    constructor(lang, maxAlternatives = 5) {
        let SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
        this.lang = lang;

        // maybe we should have it as continuous
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.lang = lang;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = maxAlternatives || 5;
        this.is_on = false;
        this.is_listening = false;

        this.results = null;

        //HACK(jmp): javascript fuckery
        //           'this' would be overwritten in the function
        //           so we need a 'self' variable in scope of the closure
        //
        let self = this;
        this.recognition.onresult = (event) => {
            let results = event.results[0];
            if (self.is_listening == false) {
                let first = results[0];
                let result = first.transcript.includes('recipe buddy');
                result = result || first.transcript.includes('recipe body');
                if (result) {
                    self.is_listening = true;  
                    let text;
                    if (first.transcript.includes('recipe buddy'))
                         text = first.transcript.split('recipe buddy')[1];
                    else text = first.transcript.split('recipe body')[1];
                    if (text.length > 0) {
                        self.results = [ first ];
                    }
                }

                // intentionally sepperated so we can detect 'hey recipe buddy shut down'
                if (first.transcript.includes('shut down'))      first = null;
                else if (first.transcript.includes('shot down')) first = null;
                else if (first.transcript.includes('turn off'))  first = null;
                else if (first.transcript.includes('stop'))      first = null;
                if (first == null) {
                    self.results = null;
                    setTimeout(() => self.disable(), 200);
                }
            } else {
                let first = results[0];
                if (first.transcript.includes('shut down'))      first = null;
                else if (first.transcript.includes('shot down')) first = null;
                else if (first.transcript.includes('turn off'))  first = null;
                else if (first.transcript.includes('stop'))      first = null;
                if (first == null) {
                    setTimeout(() => self.disable(), 200);
                    return;
                }
                self.results = results;
            }
        };

        this.recognition.onend = event => {
            event;
            if (self.is_on) {
                setTimeout(_=>{
                    self.recognition.start();
                }, 250)
            }
        }
    }

    clear() {
        this.results = null;
    }

    get sentences() {
        if (this.results == null) return null;

        let result = [];
        for (let i = 0; i < this.results.length; i++) {
            result.push(this.results[i].transcript);
        }

        if (result.length == 0) return null;
        return result;
    }

    // toggles the speech recognition engine, on and off
    toggle() {
        if (this.is_on) {
            this.recognition.stop();
            if (this.is_listening)
                this.is_listening = false;
        }
        else this.recognition.start();
        this.is_on = !this.is_on;
    }

    enable() {
        if (this.is_on) return;
        this.recognition.start();
        this.is_on = true;
    }

    disable() {
        if (!this.is_on) return;
        if (this.is_listening)
            this.is_listening = false;
        this.recognition.stop();
        this.is_on = false;
    }

    // returns an array of objects { key, values }
    // where key is the index into the results array that was matched against
    // and values is an array of matched words
    //TODO(jpm): maybe rename this function to something like match?
    //           the behaviour might be unexpected for a function named contains
    // 
    contains(words) {
        if (this.results == null) return null;

        let use_results = [];
        for (let i = 0; i < this.results.length; i++) {
            let result = this.results[i].transcript;
            for (let word of words) {
                if (result.indexOf(word, 0) !== -1 && use_results.indexOf(i, 0) == -1)
                    use_results.push(i);
            }
        }

        let matches = {};
        for (let i = 0; i < use_results.length; i++) {
            let id = use_results[i];
            if (matches[id] == undefined) matches[id] = [];
            let result = this.results[id].transcript;
            for (let word of words) {
                if (result.indexOf(word, 0) !== -1) matches[id].push(word);
            }
        }

        let result = [];
        for (let key of Object.keys(matches)) {
            result.push({key: key, values: matches[key]});
        }

        if (result.length == 0) return null;

        result.sort( (a, b) => a.values.length > b.values.length ? -1 : 1)
        return result;
    }
}
