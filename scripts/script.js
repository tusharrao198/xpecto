// CODE FOR PARRALAX EFFECT IN HOME SECTION
const translateX = document.querySelectorAll(".translateX");
const translateY = document.querySelectorAll(".translateY");
window.addEventListener("scroll", () => {
    let scroll = window.pageYOffset;
    translateX.forEach((element) => {
        let speed = element.dataset.speed;
        element.style.transform = `translateX(${scroll * speed}px)`;
    });
    translateY.forEach((element) => {
        let speed = element.dataset.speed;
        element.style.transform = `translateY(${scroll * speed}px)`;
    });
});
// ****************************************************************

// CODE FOR CHANGING NAVBAR STYLE ON SCROLL DOWN
const header = document.querySelector(".header-glass");

window.addEventListener("scroll", () => {
    console.log("hello");
    if (window.scrollY > 50) {
        header.classList.remove("active");
    }
    if (window.scrollY <= 50) {
        header.classList.add("active");
    }
});
// ****************************************************************

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