const crypto = require('crypto');

const secretKey = crypto.randomBytes(32);

if (!secretKey) {
    throw new Error("SECRET is not defined in environment variables");
}

const encryptToken = (token) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};

const decryptToken = (encryptedToken) => {
    // Split the encrypted token into IV and encrypted part
    const [ivHex, encrypted] = encryptedToken.split(':');

    if (!ivHex || !encrypted) {
        throw new Error('Invalid token format');
    }

    const ivBuffer = Buffer.from(ivHex, 'hex');
    console.log('ivBuffer: ', ivBuffer);

    // Check if IV length is correct (16 bytes for AES-256-CBC)
    if (ivBuffer.length !== 16) {
        throw new Error('Invalid IV length, should be 16 bytes');
    }

    // Create decipher with the correct key and IV
    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, ivBuffer);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};



module.exports = {
    encryptToken,
    decryptToken,
};
