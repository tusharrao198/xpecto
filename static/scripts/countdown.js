// CODE FOR COUNTER
let daysItem = document.querySelector("#days");
let hoursItem = document.querySelector("#hours");
let minutesItem = document.querySelector("#minutes");
let secondsItem = document.querySelector("#seconds");
let countDown = () => {
    let futureDate = new Date("14 May 2022");
    let currentDate = new Date();
    let myDate = futureDate - currentDate;

    let days = Math.floor(myDate / 1000 / 60 / 60 / 24);
    let hours = Math.floor(myDate / 1000 / 60 / 60) % 24;
    let minutes = Math.floor(myDate / 1000 / 60) % 60;
    let seconds = Math.floor(myDate / 1000) % 60;
    daysItem.innerHTML = days;
    hoursItem.innerHTML = hours;
    minutesItem.innerHTML = minutes;
    secondsItem.innerHTML = seconds;
};
countDown();
setInterval(countDown, 1000);
//*****************************************************************
