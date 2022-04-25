const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './static/images/eventimg')
    },
    filename:(req, file, cb) => {
        let ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
        req.body.event_image=req.body.name+ext;
        cb(null,req.body.name+ext);
    }
})

const upload = multer({ storage: storage })

module.exports = upload;