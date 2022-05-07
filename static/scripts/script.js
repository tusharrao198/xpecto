// CODE FOR RESPONSIVE NAVBAR
const toggler = document.querySelector(".toggle");
const navbar = document.querySelector("nav");
const closeTap = document.querySelectorAll(".close")
if (window.innerWidth <= 1300) navbar.style.display = "none";

navbar.addEventListener("resize", () => {
    if (window.innerWidth <= 1300) navbar.style.display = "none";
    else navbar.style.display = "flex";
});
toggler.addEventListener("click", () => {
    if (toggler.getAttribute("src") === "images/menu_open.svg") {
        toggler.setAttribute("src", "images/menu_close.svg");
        navbar.style.display = "flex";
    } else {
        toggler.setAttribute("src", "images/menu_open.svg");
        navbar.style.display = "none";
    }
});
if (window.innerWidth <= 1300){
for (let i = 0; i < closeTap.length; i++)
    closeTap[i].addEventListener("click", () => {
        toggler.setAttribute("src", "images/menu_open.svg");
        navbar.style.display = "none";
    });}
// **************************************************************

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
    if (window.scrollY > 50) {
        header.classList.remove("active");
    }
    if (window.scrollY <= 50) {
        header.classList.add("active");
    }
});
// ****************************************************************

// CODE FOR AUTO EXPANDING EVENTS CARD ON CLICK

let descBtn = document.querySelectorAll(".desc-btn");

descBtn.forEach((descBtn) => {
    descBtn.addEventListener("click", (event) => {
        const active = document.querySelector(".desc-btn.active");
        if (active && active !== descBtn) {
            active.classList.toggle("active");
            active.nextElementSibling.style.maxHeight = 0;
            descBtn.style.transform = "rotate(0deg)"
        }
        descBtn.classList.toggle("active");
        const answer = descBtn.nextElementSibling;
        if (descBtn.classList.contains("active")) {
            answer.style.maxHeight = answer.scrollHeight + "px";
            descBtn.style.transform = "rotate(180deg)";
        } else {
            answer.style.maxHeight = 0;
            descBtn.style.transform = "rotate(0deg)"
        }
    });
});
