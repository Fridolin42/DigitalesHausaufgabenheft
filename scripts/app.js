//express
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
//lib
const crypto = require("crypto");
const fs = require("fs");
//files
const login = require("../userdata/login.json");

//middleware
app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(32).toString("hex");
    res.locals.passwordSet = login.password != null;
    next();
})
app.use(helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
        scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`]
    }
}));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static("public"));

//Sites
app.get("/", ((req, res) => {
    if (req.cookies.password == null || req.cookies.password !== login.password)
        res.render("login");
    else
        res.render("calender");
}))

app.post("/", (req, res) => {
    if (req.body.type === "1") {
        //login
        if (req.body.password === login.password) {
            res.cookie("password", login.password);
            res.redirect("/");
        } else
            res.redirect("/?wrongpassword=true");
    } else if (login.password == null) {
        //signup
        const password = req.body.password;
        if (password.length >= 10) {
            login.password = req.body.password;
            res.cookie("password", login.password);
            res.redirect("/")
            fs.writeFile("./userdata/login.json", JSON.stringify(login), (err) => {
                if (err) throw err;
            })
        }
    }
})

//404
app.all("*", (req, res) => {
    res.status(404);
    res.render("404", {
        "page": req.path
    })
})

app.listen(1337, () => console.log("Server listen on http://localhost:1337"))