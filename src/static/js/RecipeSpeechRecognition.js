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

        this.rec_results = null;

        //HACK(jmp): javascript fuckery
        //           'this' would be overwritten in the function
        //           so we need a 'self' variable in scope of the closure
        //
        let self = this;
        this.recognition.onresult = (event) => {
            self.results = event.results[0];
        };
    }

    get sentences() {
        let result = [];
        for (let i = 0; i < this.results.length; i++) {
            result.push(this.results[i].transcript);
        }
        if (result.length == 0) return null;
        return result;
    }

    // toggles the speech recognition engine, on and off
    toggle() {
        if (this.is_on) this.recognition.stop();
        else this.recognition.start();
        this.is_on = !this.is_on;
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
