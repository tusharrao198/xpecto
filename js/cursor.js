let image = $("#cursor");
document.addEventListener("mousemove", (e) => {
    if (e.pageY > window.innerHeight - 24) {
        if (e.pageX > window.innerWidth - 24) {
            image.css({ "top": `${window.innerHeight-36}px`, "left": `${window.innerWidth-36}px` })
        } else {
            image.css({ "top": `${window.innerHeight-36}px`, "left": `${e.pageX - 24}px` })
        }
    } else {
        if (e.pageX > window.innerWidth - 24) {
            image.css({ "top": `${e.pageY-12}px`, "left": `${window.innerWidth-36}px` })
        } else {
            image.css({ "top": `${e.pageY-12}px`, "left": `${e.pageX - 24}px` })
        }
    }

})