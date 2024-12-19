const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const mailConfig = require('../config/mail-config.js');

const getMailTransporterCredentials = () => {
    return {
        ...mailConfig.mailers[mailConfig.defaultMailer],
        auth: mailConfig.auth[mailConfig.authType]
    }
};

const transporter = nodemailer.createTransport(getMailTransporterCredentials());

exports.sendEmail = async function ({ from, to, subject, template, data }) {
    try {

        if (!from || !to || !subject || !template || !data) {
            // throw new Error("Missing required parameters");
            console.log("Missing required parameters");
            return;
        }

        const html = await ejs.renderFile(path.join(path.dirname(__dirname), 'templates', template), data);

        await transporter.verify();
         await transporter.sendMail({ from, to, subject, html });

        console.log('Email sent successfully');

    } catch (error) {

        console.log("Unable to Send Email", error.message)
        throw error;
    }
};