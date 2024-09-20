const copyLinks = document.querySelectorAll(".copyLink");
const startButton = document.querySelector(".start")
const stopButton = document.querySelector(".stop")
const startButtonIcon = document.querySelector(".uil-play")
const startButtonIconContainer = document.querySelector(".startIcon")
const startText = document.querySelector(".startText")
const obsUrlMulti = document.querySelector(".obsUrl.multi")
const obsUrlMain = document.querySelector(".obsUrl.main")
const openSettings = document.getElementById("openSettings")
const closeSettings = document.getElementById("closeSettings")
const settings = document.getElementById("settings")
const themeSelect = document.getElementById("themeSelect")
const logout = document.getElementById("logout")
const avatarImg = document.getElementById("avatar_img")
const body = document.querySelector("body")
//Inputs
const langInSelect = document.querySelector("#langInSelect")
const langOutSelect = document.querySelector("#langOutSelect")
const ignoredWords = document.querySelector("#ignoredWords")
const ignoredWordsList = document.querySelector("#ignoredWordsList")
const doubleTrad = document.querySelector("#doubleTrad")
const langOutSelectLabel = document.querySelector(".langOutSelectLabel")
const langOutSelect2 = document.querySelector("#langOutSelect2")
const fd_langOut2 = document.querySelector(".fd_langOut2");
const overlayLang2 = document.querySelector(".link.multi");
const subtilesLinkText = document.querySelector(".subtilesLink > p");
let recognitionLang, socket;
handleSettings();

//Recognition settings
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true ;

//LangIn
localStorage.getItem("inputLang") ? null : localStorage.setItem("inputLang", langInSelect.value);
langInSelect.value = localStorage.getItem("inputLang");
recognitionLang = langInSelect.options[langInSelect.selectedIndex].dataset.lang;
recognition.lang = recognitionLang;
langInSelect.addEventListener("change", e => {
    localStorage.setItem("inputLang", e.target.value)
    recognitionLang = e.target.options[langInSelect.selectedIndex].dataset.lang;
    recognition.lang = recognitionLang;
})

//LangOut
localStorage.getItem("outputLang") ? null : localStorage.setItem("outputLang", langOutSelect.value);
langOutSelect.value = localStorage.getItem("outputLang");
langOutSelect.addEventListener("change", e => {
    localStorage.setItem("outputLang", e.target.value)
})

//LangOut2
localStorage.getItem("outputLang2") ? null : localStorage.setItem("outputLang2", langOutSelect2.value);
langOutSelect2.value = localStorage.getItem("outputLang2");
langOutSelect2.addEventListener("change", e => {
    localStorage.setItem("outputLang2", e.target.value)
})

fetch(`${window.location.origin}/api/getTwitchData`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if(data.err){
            avatarImg.src = "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png";
            return
        }
        avatarImg.src = data.avatar;
        obsUrlMain.textContent = `${window.location.origin}/overlay?id=${data.userId}`;
        obsUrlMulti.textContent = `${window.location.origin}/overlay?id=${data.userId}&multi=true`;
        socket = io(`${window.location.origin}`, {
            reconnectionDelayMax: 10000,
            query: `roomId=${data.userId}`
        })
    })
    .catch(err => {
        console.log(err);
        avatarImg.src = "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png";
})

logout.addEventListener('click', () => {
    fetch(`${window.location.origin}/api/logout`)
    .then(response => response.json())
    .then(data => {
        if(data.redirect){
            window.location.replace(data.redirect);
        }
    })
    .catch(err => console.log(err))
})

//Transcribe and translate

recognition.onresult = async event => {

        //Check if result has banned words
        let transcription = event.results[event.results.length - 1][0].transcript;
        let ignoredWords = localStorage.getItem("ignoredWordsList").split(',');
        if(ignoredWords[0].length !== 0){
            for(const word of ignoredWords){
                if(transcription.toLowerCase().includes(word.toLowerCase())){
                    const censored = word.replace(/[a-zA-Z0-9]/g, "*")
                    transcription = transcription.replaceAll(word, censored).replaceAll(word.toLowerCase(), censored);
                }
            }
        }
        const inputLang = localStorage.getItem("inputLang");
        const outputLang = localStorage.getItem("outputLang");
        const ouputLang2 = localStorage.getItem("outputLang2");

        let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLang}&tl=${outputLang}&dt=t&q=` + encodeURI(transcription);
        let response = await fetch(url)
        let result = await response.json()
        const firstLanguage = result[0][0][0]
        let secondLanguage
        
        if(localStorage.getItem("doubleTrad") === "true"){
            url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLang}&tl=${ouputLang2}&dt=t&q=` + encodeURI(transcription);
            response = await fetch(url)
            result = await response.json(),
            secondLanguage = result[0][0][0]
        }

        socket.emit("message", {
            data: {
                text: firstLanguage,
                text2: secondLanguage,
                isTrusted: event.results[event.results.length - 1].isFinal,
            },
        })
}

startButton.addEventListener("click", (e) => {
    e.preventDefault();
    langInSelect.setAttribute("disabled", true);
    langOutSelect.setAttribute("disabled", true);
    langOutSelect2.setAttribute("disabled", true);
    doubleTrad.setAttribute("disabled", true);
    ignoredWords.setAttribute("disabled", true);
    ignoredWordsList.setAttribute("disabled", true);

    recognition.start();
    startText.textContent = 'En cours';
    startButtonIcon.classList.replace("uil-play", "uil-sync");
    startButtonIconContainer.classList.add("spinning");
    startButton.disabled = true;
    startButton.style.backgroundColor = '#828381';
    startButton.style.cursor = 'default';
})

stopButton.addEventListener("click", (e) => {
    e.preventDefault();
    langInSelect.removeAttribute("disabled");
    langOutSelect.removeAttribute("disabled");
    langOutSelect2.removeAttribute("disabled");
    doubleTrad.removeAttribute("disabled");
    ignoredWords.removeAttribute("disabled");
    ignoredWordsList.removeAttribute("disabled");

    recognition.stop();
    startText.textContent = 'Démarrer';
    startButtonIcon.classList.replace("uil-sync", "uil-play");
    startButtonIconContainer.classList.remove("spinning");
    startButton.disabled = false;
    startButton.style.backgroundColor = 'rgb(66, 196, 66)';
    startButton.style.cursor = 'pointer';
})


//doubleTrad
localStorage.getItem("doubleTrad") ? null : localStorage.setItem("doubleTrad", doubleTrad.checked);
if(localStorage.getItem("doubleTrad") === 'true'){
    fd_langOut2.classList.add("show");
    doubleTrad.checked = true;
    subtilesLinkText.textContent = "Liens des overlay OBS";
    overlayLang2.classList.add("visible");
    langOutSelectLabel.textContent = "Langue de sortie #1";
} else {
    langOutSelectLabel.textContent = "Langue de sortie";
    fd_langOut2.classList.remove("show");
    subtilesLinkText.textContent = "Lien de l'overlay OBS";
    overlayLang2.classList.remove("visible");
    doubleTrad.checked = false;
}

doubleTrad.addEventListener("change", e => {
    localStorage.setItem("doubleTrad", e.target.checked)
    if(e.target.checked === true){
        langOutSelectLabel.textContent = "Langue de sortie #1";
        subtilesLinkText.textContent = "Liens des overlay OBS";
        overlayLang2.classList.add("visible");
        fd_langOut2.classList.add("show");
    } else {
        langOutSelectLabel.textContent = "Langue de sortie";
        subtilesLinkText.textContent = "Lien de l'overlay OBS";
        overlayLang2.classList.remove("visible");
        fd_langOut2.classList.remove("show");
    }
})


//ignoredWords
localStorage.getItem("ignoredWords") ? null : localStorage.setItem("ignoredWords", ignoredWords.checked);
ignoredWords.checked = localStorage.getItem("ignoredWords") === 'true' ? true : false;
ignoredWords.addEventListener("change", e => {
    localStorage.setItem("ignoredWords", e.target.checked)
})

//ignoredWordsList
localStorage.getItem("ignoredWordsList") ? null : localStorage.setItem("ignoredWordsList", ignoredWordsList.value);
ignoredWordsList.value = localStorage.getItem("ignoredWordsList");
ignoredWordsList.addEventListener("input", debounce((e) => {
    localStorage.setItem("ignoredWordsList", e.target.value)
}, 600))


function debounce(callback, delay){
    var timer;
    return function(){
        var args = arguments;
        var context = this;
        clearTimeout(timer);
        timer = setTimeout(function(){
            callback.apply(context, args);
        }, delay)
    }
}

copyLinks.forEach(copyLink => {
    copyLink.addEventListener("click", e => {
        const textContent = e.target.nextElementSibling.textContent;
        navigator.clipboard.writeText(textContent);
        e.target.nextElementSibling.nextElementSibling.classList.add("show")
        setTimeout(() => {
            e.target.nextElementSibling.nextElementSibling.classList.remove("show")
        }, 3500)
    })
})

function handleTheme(theme){
    body.removeAttribute('class')
    body.classList.add(theme.toLowerCase())
}

async function handleSettings() {

    //Récupération des valeurs locales
    const theme = localStorage.getItem("themeName")

    theme ? themeSelect.value = theme : localStorage.setItem("themeName", themeSelect.value)

    handleTheme(localStorage.getItem("themeName"))

    //Écoutes des événements

    openSettings.addEventListener("click", () => {
        settings.classList.add("open")
        body.style.overflow = "hidden"
    })

    closeSettings.addEventListener("click", () => {
        settings.classList.remove("open")
        body.style.overflow = ""
    })

    themeSelect.addEventListener("change", e => {
        localStorage.setItem("themeName", e.target.value)
        handleTheme(e.target.value)
    })

}
