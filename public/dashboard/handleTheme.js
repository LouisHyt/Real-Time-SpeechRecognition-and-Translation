const body = document.querySelector("body")

const handleTheme = (theme) => {
    body.removeAttribute('class')
    body.classList.add(theme.toLowerCase())
}

export default handleTheme