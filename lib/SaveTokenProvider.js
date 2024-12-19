const pool = require('../config/database.js');

const saveResetTokenProvider = async (providerId, resetToken, tokenExpiry,iat,currentDateTime) => {
    console.log('iat: ', iat);
    console.log('currentDateTime: ', currentDateTime);
    return new Promise((resolve, reject) => {
        const save_token = process.env.INSERT_TOKEN_FOR_RESET_PROVIDER
            .replace('<provider_id>', providerId)
            .replace('<reset_token>', resetToken)
            .replace('<token_expiry>', tokenExpiry)
            .replace('<currentDateTime>', currentDateTime)
            .replace('<iat>', iat);

        // console.log('save_token: ', save_token);
        pool.query(save_token, (err, results) => {
            if (err) {
                console.error("Error saving reset token:", err);
                return reject(err);
            }
            return resolve();
            
        });
    });
};

module.exports = { saveResetTokenProvider };
