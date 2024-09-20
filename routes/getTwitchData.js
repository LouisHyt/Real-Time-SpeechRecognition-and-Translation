const jwt = require("jsonwebtoken")
const { JWT_SECRET } = process.env
const axios = require('axios');


module.exports = async (req, res) => {

    const token = req.cookies.jwt
    if(!token){
        res.status(500).send("no token")
        return
    }

    try{
        const { username, userId } = jwt.verify(token, JWT_SECRET)
        axios.get(`https://decapi.me/twitch/avatar/${username}`)
        .then(({data}) => {
            res.status(200).json({
                avatar : data,
                userId,
                username
            });
        })
        .catch(err => {
            res.status(500).json({err})
            return
        })
    }
    catch(err){
        res.status(500).json({err})
        return
    }
        
};
