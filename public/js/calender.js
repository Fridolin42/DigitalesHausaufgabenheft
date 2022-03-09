let dayNumber;
let relativWeek

//URL Parameter
const urlParams = new URLSearchParams(document.location.search);
relativWeek = urlParams.get("relativeWeek") | 0;

//Add Entry Function
function add(day) {
    document.getElementById("addEntry").style.display = "flex"
    document.getElementById("subject").value = ""
    document.getElementById("exercise").value = ""
    dayNumber = day;
}

//Add Entry Buttons
document.getElementById("addMonday").onclick = () => add(1);
document.getElementById("addTuesday").onclick = () => add(2);
document.getElementById("addWednesday").onclick = () => add(3);
document.getElementById("addThursday").onclick = () => add(4);
document.getElementById("addFriday").onclick = () => add(5);

//Add Entry Form
document.getElementById("cancelAddEntry").onclick = () => document.getElementById("addEntry").style.display = "none"
document.getElementById("confirmAddEntry").onclick = () => {
    const subject = document.getElementById("subject").value;
    const exercise = document.getElementById("exercise").value;
    if (subject !== "" || exercise !== "") {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        //Insert Form Data
        const urlencoded = new URLSearchParams();
        urlencoded.append("week", new Date().getWeek());
        urlencoded.append("subject", subject);
        urlencoded.append("exercise", exercise);
        urlencoded.append("day", dayNumber);

        //General information about the post request
        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'follow'
        };

        //Post Request for adding the Entry
        fetch("/addEntry", requestOptions)
            .then(response => response.text())
            .then(result => {
                console.log(result);
                document.getElementById("addEntry").style.display = "none";
                document.location.href = "./"
            })
            .catch(error => console.log('error :' + error));
    }
}

//Week Switcher
document.getElementById("previousWeek").onclick = () => {
    window.location.href = `./?relativeWeek=${relativWeek - 1}`
}

document.getElementById("currentWeek").onclick = () => {
    window.location.href = `./?relativeWeek=0`
}

document.getElementById("nextWeek").onclick = () => {
    window.location.href = `./?relativeWeek=${relativWeek + 1}`
}

//Calender Week
Date.prototype.getWeek = function () {
    // Found at https://stackoverflow.com/a/34323944

    let date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    let week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

for (let button of document.getElementsByClassName("deleteButton")) {
    button.onclick = () => {
        let exercise = button.getAttribute("exercise");
        let subject = button.getAttribute("subject");
        let week = button.getAttribute("week");
        let day = button.getAttribute("day");

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        //Insert Form Data
        const urlencoded = new URLSearchParams();
        urlencoded.append("week", week);
        urlencoded.append("subject", subject);
        urlencoded.append("exercise", exercise);
        urlencoded.append("day", day);

        //General information about the post request
        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'follow'
        };

        //Post Request for deleting the Entry
        fetch("/deleteEntry", requestOptions)
            .then(response => response.text())
            .then(result => {
                console.log(result);
                document.location.href = "./"
            })
            .catch(error => console.log('error :' + error));
    }
}