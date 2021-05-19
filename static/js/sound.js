// window.onload = () => {
//     document.querySelector(".anthem").play()
// }

let sound = document.querySelector(".sound");
let status = document.querySelector("#status");
sound.addEventListener("click", () => {

    let audios = document.getElementsByTagName("audio")
        // audios[0].play();
    console.log(audios)
    if (status.innerText == "ON") {
        Array.from(audios).forEach((audio) => {
            audio.muted = true;
        })
        status.innerText = "OFF";
    } else {
        Array.from(audios).forEach((audio) => {
            audio.muted = false;
        })
        status.innerText = "ON";
    }
})

document.addEventListener("click", () => {
    document.getElementById("click").play();
})
