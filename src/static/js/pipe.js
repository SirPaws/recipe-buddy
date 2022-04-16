
// this is our gateway between python and js
class Pipe {
    constructor() {
    }

    write(data) {
        const string       = JSON.stringify(data);
        const encoded_data = new TextEncoder().encode(string);

        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
            console.log(this.responseText);
        }
        xhr.onerror = (ev) => {
            console.error(ev);
        }
        xhr.open("POST", '/analyse', true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(string);
    }
}


