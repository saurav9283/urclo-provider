const fast2sms = require('fast-two-sms')
exports.sendSms = async (phoneNumber, message) => {
    
    await fast2sms.sendMessage({
        authorization:process.env.SMS_API_KEY,
        message,
        numbers:[phoneNumber]
    });

    console.log("SMS send !");

}