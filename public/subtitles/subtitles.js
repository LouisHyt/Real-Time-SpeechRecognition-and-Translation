
const textContainer = document.querySelector("#transcription");
const textbox = document.querySelector(".textbox");
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let timeout;
let cache = [];
let index = 0;
const socket = io(`${window.location.origin}`, {
    reconnectionDelayMax: 10000,
    query: `roomId=${urlParams.get("id")}`
})

socket.on("update", ({text, isTrusted, text2}) => {

    urlParams.get('multi') === 'true' ? cache[index] = text2 : cache[index] = text;

    if(cache.join(' ').length > 80){

        if(cache.length > 1){
                console.log("RESET")
                cache = [cache[cache.length - 1]]
                index = 0;
                textbox.style.removeProperty('justify-content');
        }

        if(cache.join(' ').length > 80){
            textbox.style.justifyContent = 'flex-end';
        }

    }

    if(isTrusted){
        if(cache[index - 1]){
            console.log(index)
            console.log(cache)
            console.log(cache[index])
            console.log(cache[index - 1])
            if(cache[index].trim().toLowerCase() === cache[index - 1].trim().toLowerCase()){
                cache[index - 1] = cache[index]
                cache.pop();
                index -= 1;
            }
        }
        index += 1;
    }

    textContainer.textContent = cache.join(" ");
    textbox.classList.remove("hide");
    clearTimeout(timeout)
    timeout = setTimeout(() => {
        textbox.classList.add("hide")
        textbox.style.removeProperty('justify-content');
        cache = [];
        index = 0;
    }, 6000)
})
