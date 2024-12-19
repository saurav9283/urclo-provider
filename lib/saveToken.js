const pool = require('../config/database.js');

const saveResetToken = async (userId, resetToken, tokenExpiry,iat,currentDateTime) => {
    console.log('currentDateTime: ', currentDateTime);
    console.log('tokenExpiry: ', tokenExpiry);
    return new Promise((resolve, reject) => {
        const save_token = process.env.INSERT_TOKEN_FOR_RESET
            .replace('<user_id>', userId)
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

module.exports = { saveResetToken };
