// code for timeline 

const dot1 = document.querySelector(".dot-1");
const dot2 = document.querySelector(".dot-2");
const dot3 = document.querySelector(".dot-3");
const dot4 = document.querySelector(".dot-4");
dot2.addEventListener("click", () => {
    document.querySelector(".block-2").style.display = "block";
    document.querySelector(".block-1").style.display = "none";
    document.querySelector(".block-3").style.display = "none";
    document.querySelector(".block-4").style.display = "none";
    dot2.classList.add("active");
    dot1.classList.remove("active");
    dot3.classList.remove("active");
    dot4.classList.remove("active");
});
dot3.addEventListener("click", () => {
    document.querySelector(".block-3").style.display = "block";
    document.querySelector(".block-1").style.display = "none";
    document.querySelector(".block-2").style.display = "none";
    document.querySelector(".block-4").style.display = "none";
    dot3.classList.add("active");
    dot2.classList.remove("active");
    dot1.classList.remove("active");
    dot4.classList.remove("active");
});
dot1.addEventListener("click", () => {
    document.querySelector(".block-1").style.display = "block";
    document.querySelector(".block-2").style.display = "none";
    document.querySelector(".block-3").style.display = "none";
    document.querySelector(".block-4").style.display = "none";
    dot1.classList.add("active");
    dot2.classList.remove("active");
    dot3.classList.remove("active");
    dot4.classList.remove("active");
});
dot4.addEventListener("click", () => {
    document.querySelector(".block-4").style.display = "block";
    document.querySelector(".block-2").style.display = "none";
    document.querySelector(".block-3").style.display = "none";
    document.querySelector(".block-1").style.display = "none";
    dot4.classList.add("active");
    dot1.classList.remove("active");
    dot2.classList.remove("active");
    dot3.classList.remove("active");
});
