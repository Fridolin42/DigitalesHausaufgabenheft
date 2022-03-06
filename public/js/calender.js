let dayNumber;

function add(day) {
    document.getElementById("addEntry").style.display = "flex"
    document.getElementById("subject").value = ""
    document.getElementById("exercise").value = ""
    dayNumber = day;
}

document.getElementById("addMonday").onclick = () => add(1);

document.getElementById("cancelAddEntry").onclick = () => document.getElementById("addEntry").style.display = "none"
document.getElementById("confirmAddEntry").onclick = () => {
    const subject = document.getElementById("subject").value;
    const exercise = document.getElementById("exercise").value;
    if (subject !== "" || exercise !== "") {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        const urlencoded = new URLSearchParams();
        urlencoded.append("week", new Date().getWeek());
        urlencoded.append("subject", subject);
        urlencoded.append("exercise", exercise);
        urlencoded.append("day", dayNumber);

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'follow'
        };

        fetch("/addEntry", requestOptions)
            .then(response => response.text())
            .then(result => {
                alert(result);
                document.getElementById("addEntry").style.display = "none";
                document.location.href = "./"
            })
            .catch(error => console.log('error', error));
    }
}

Date.prototype.getWeek = function () {
    let date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    let week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}
