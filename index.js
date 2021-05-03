const express = require("express")
const port = 5000 || process.env

let app = express()

app.use(express.static(__dirname + "/static"))
app.set("views", "./templates")
app.set("view engine", "ejs")
app.get("/", (req, res) => {
    res.render("index");
})

app.listen(port, (err) => {
    if (err) {
        throw err;
    }
    console.log("Connection Established!!")
})