require('dotenv').config();
module.exports = {
    "authType":process.env.MAIL_AUTH || "noAuth",
    "defaultMailer": "smtp",
    "mailers": { 
        "smtp": {
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: true, 
        },
    },
    "auth":{
        "noAuth": {},
        "login": {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
        },
    }
}