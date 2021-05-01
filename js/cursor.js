let image = $("#cursor");
document.addEventListener("mousemove", (e) => {
    let height = document.documentElement.scrollHeight;
    if (e.pageY > height - 24) {
        if (e.pageX > window.innerWidth - 24) {
            image.css({ "top": `${height-36}px`, "left": `${window.innerWidth-36}px` })
        } else {
            image.css({ "top": `${height-36}px`, "left": `${e.clientX - 24}px` })
        }
    } else {
        if (e.pageX > window.innerWidth - 24) {
            image.css({ "top": `${e.clientY-12}px`, "left": `${window.innerWidth-36}px` })
        } else {
            image.css({ "top": `${e.clientY-12}px`, "left": `${e.clientX - 24}px` })
        }
    }

})