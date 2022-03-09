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
const calender = require("../userdata/calender.json");

//calender week
Date.prototype.getWeek = function () {
    //Found at https://stackoverflow.com/a/34323944

    const date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    const week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}
app.use((req, res, next) => {
    res.locals.calenderweek = new Date().getWeek();
    next();
})

//middleware

//For Forms
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
//Generate CSP Nonce
app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(32).toString("hex");
    res.locals.passwordSet = login.password != null;
    next();
})
//Helmt for security
app.use(helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
        scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],

    }
}));
app.use(cookieParser());
app.set("view engine", "ejs");
//static Pages
app.use(express.static("public"));

//Sites
app.get("/", ((req, res) => {
    if (req.cookies.password == null || req.cookies.password !== login.password)
        //Login Page
        res.render("login");
    else {
        //Calender Page
        let relativWeek = parseInt((req.query.relativeWeek | 0).toString());
        let weekNumber = parseInt(new Date().getWeek().toString());
        let absoluteWeek = weekNumber + relativWeek;
        let week = calender[absoluteWeek];
        if (week == null) {
            week = {
                "1": [],
                "2": [],
                "3": [],
                "4": [],
                "5": []
            }
        }
        res.render("calender", {
            week: week,
            relativeDays: relativWeek * 7,
            calenderWeek: absoluteWeek
        });
    }
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

//add Entry
app.post("/addEntry", (req, res) => {
    const password = req.cookies.password;
    if (password != null && password === login.password) {
        const calenderWeek = req.body.week;
        const day = req.body.day;
        const subject = req.body.subject;
        const exercise = req.body.exercise;
        //check for errors
        if (calenderWeek == null || day == null) res.send({"status": "no week or day"});
        else if (subject == null && exercise == null) res.send({"status": "no subject and no exercise"})
        else {
            let week = calender[calenderWeek];
            if (week == null) week = {
                1: [],
                2: [],
                3: [],
                4: [],
                5: [],
            };
            //Push Entry into the week
            week[day].push({subject: subject, exercise: exercise});
            calender[calenderWeek] = week;
            //write
            fs.writeFile("./userdata/calender.json", JSON.stringify(calender), (err) => {
                if (err) throw err;
            })
            res.send({"status": "okay"})
        }
    } else res.send({"status": "unauthorized"})
})

//remove entry
app.post("/deleteEntry", (req, res) => {
    const password = req.cookies.password;
    if (password != null && password === login.password) {
        const calenderWeek = req.body.week;
        const day = req.body.day;
        const subject = req.body.subject;
        const exercise = req.body.exercise;
        if (calenderWeek == null) res.send({"status": "no calenderWeek"})
        else if (day == null) res.send({"status": "no day"})
        else if (subject == null) res.send({"status": "no subject"})
        else if (exercise == null) res.send({"status": "exercise"})
        else {
            let deleted = false;
            const week = calender[calenderWeek];
            const calenderDay = week[day]
            for (const key in calenderDay) {
                const element = calender[calenderWeek][day][key]
                if (element.subject === subject && element.exercise === exercise) {
                    console.log("Key: " + key)
                    calenderDay.splice(key, 1);
                    week[day] = calenderDay;
                    calender[calenderWeek] = week;
                    res.send({"status": "sussfully deleted"})
                    deleted = true
                    //write
                    fs.writeFile("./userdata/calender.json", JSON.stringify(calender), (err) => {
                        if (err) throw err;
                    })
                }
            }
            if (!deleted) res.send({"status": "not found"})
        }
    } else res.send({"status": "unauthorized"})
})

//awsome button
app.get("/awsomeButton", (req, res) => {
    res.render("button", {content: "Das ist ein Button"});
})

//404
app.all("*", (req, res) => {
    res.status(404);
    res.render("404", {
        "page": req.path
    })
})

app.listen(1337, () => console.log("Server listen on http://localhost:1337"))