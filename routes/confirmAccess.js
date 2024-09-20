const jwt = require("jsonwebtoken")
const axios = require('axios')

const { 
    TWITCH_CLIENT_ID, 
    TWITCH_CLIENT_SECRET,
    ALLOWED_USERS, 
    JWT_SECRET 
} = process.env;

module.exports = async (req, res) => {
    const { code } = req.query
    const TWITCH_REDIRECT_URL = `http://${req.get("host")}/api/confirmAccess`
    const url = `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${TWITCH_REDIRECT_URL}`;

    let request = await axios.post(url)
        .then(response => {
            return response
        })
        .catch(error => {
            res.redirect("/error?err=code")
            console.log(error)
            return
        })

    const { access_token } = request.data

    const user = await axios.get("https://api.twitch.tv/helix/users", {
        headers : {
            "Authorization": "Bearer " + access_token,
            "Client-Id" : TWITCH_CLIENT_ID
        }
    })
    .then(response => {
        return response
    })

    const username = user.data.data[0]["login"].toLowerCase();
    const userId = user.data.data[0]["id"];
    const allowedUsers = ALLOWED_USERS.split(",")

    if(!allowedUsers.includes(username)){
        res.redirect("/error?err=denied")
        return
    }
    const maxDuration = 6 * 24 * 60 * 60; //6 jours en secondes
    let token = jwt.sign({username, userId}, JWT_SECRET, {
        expiresIn: maxDuration
    })
    res.cookie('jwt', token, {httpOnly: true, maxAge : maxDuration * 1000 }) // en millisecondes
    res.redirect("/dashboard");

}