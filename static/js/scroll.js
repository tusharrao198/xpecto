let a = $("#enter")
a.on('click', () => {
    document.querySelector(".click-sound").play();
    document.querySelector(".anthem").play();
    $(".preloader").css({ "transform": "translateX(-100%)", "opacity": 0, "z-index": -10000 })
    $(".home").css({ "opacity": 1, "transform": "translateY(-100%)" })
    document.body.style.overflowY = "auto";
})
