//express
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
//lib
const crypto = require("crypto");

//middleware
app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(32).toString("hex");
    next();
})
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.set("view engine", "ejs");


//404
app.all("*", (req, res) => {
    res.status(404);
    res.render("404", {
        "page": req.path
    })
})

app.listen(1337, () => console.log("Server listen on http://localhost:1337"))