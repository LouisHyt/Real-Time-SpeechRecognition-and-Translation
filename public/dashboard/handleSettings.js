const openSettings = document.getElementById("openSettings")
const closeSettings = document.getElementById("closeSettings")
const settings = document.getElementById("settings")
const themeSelect = document.getElementById("themeSelect")
const body = document.querySelector("body")

const handleSettings = async () => {

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

export default handleSettings