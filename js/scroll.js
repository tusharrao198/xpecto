let a = $("#enter")
a.on('click', () => {
    $(".preloader").css({ "transform": "translateX(-100%)" })
    $(".home").css({ "opacity": 1, "transform": "translateY(0)", })
})