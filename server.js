const express = require('express');
const App = express();
const api = express.Router();
const http = require('http').Server(App)
const path = require("path")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser");
require('dotenv').config()

const { 
    PORT,
    ORIGIN,
    JWT_SECRET
} = process.env


const { requireAuth } = require('./middlewares/authMiddleware');
const confirmAccess = require("./routes/confirmAccess");
const logout = require("./routes/logout");
const getTwitchData = require("./routes/getTwitchData");

App.use(express.json());
App.use(express.urlencoded({extended: true}))
App.use(cookieParser());


App.use("/api", api);

//Routes
App.get("/", (req, res) => {
    const token = req.cookies.jwt
    if(token){
        jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
            if(err){
                console.log(err.message)
                res.redirect("/error?err=identiteErreur")
            } else {
                res.redirect("/dashboard")
            }
        })
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
})

App.get("/dashboard", requireAuth,(req, res) => {
    res.sendFile(path.join(__dirname, 'public', "dashboard", 'dashboard.html'));
})


App.get("/overlay", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', "subtitles", 'subtitles.html'));
})

App.get("/error", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'error', 'index.html'));
})

//Utils
api.get("/getTwitchData", getTwitchData)

//Auth
api.get("/confirmAccess", confirmAccess)
api.get("/logout", logout);

//websocket
const io = require('socket.io')(http, {
    cors : {
        origin: ORIGIN,
        methods: ["GET"],
        credentials: true
    }
})

io.on("connection", socket => {

    console.log(`User ${socket.id} connected !`);
    const roomId = socket.request._query.roomId;
    socket.join(roomId)

    socket.on("message", ({data}) => {
        //if(!data.isTrusted) return
        socket.to(roomId).emit("update", data)
    })

})

io.use(async (socket, next) => {
    let token = socket.handshake.headers.cookie;
    if(!token){
        next()
        return
    }
    token = token.replace("jwt=", "");
    jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
        if(err){
            next()
        } else {
            socket.approved = true;
            next()
        }
    })
})

App.use(express.static(path.join(__dirname, "public")));

http.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`)
})