let a = $("#enter")
a.on('click', () => {
    document.querySelector(".click-sound").play();
    document.querySelector(".anthem").play();
    $(".preloader").css({ "transform": "translateX(-100%)" })
    $(".home").css({ "opacity": 1, "transform": "translateY(0)", })

})