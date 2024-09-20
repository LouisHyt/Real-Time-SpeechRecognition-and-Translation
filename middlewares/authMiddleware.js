const jwt = require("jsonwebtoken")
const { JWT_SECRET } = process.env

const requireAuth = (req, res, next) => {
    
    const token = req.cookies.jwt

    if(token){

        jwt.verify(token, JWT_SECRET, (err, decodedToken) => {

            if(err){
                console.log(err.message)
                res.redirect("/error?err=identiteErreur")
            } else {
                next()
            }
        })

    } else {

        res.redirect("/");

    }

}

module.exports = { requireAuth }