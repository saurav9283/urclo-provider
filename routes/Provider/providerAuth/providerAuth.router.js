const express = require('express');
const { providerRegister, providerEmailVerify, providerPhoneVerify, providerOtpResend, providerLogin, providerForgorPassword, providerResetPassword } = require('./providerAuth.controller');
const upload = require('../../../lib/uploadFunction');
const router = express.Router();

router.post('/register', upload.fields([
      { name: "providerImage", maxCount: 1 },
      { name: "images1", maxCount: 1 },
      { name: "images2", maxCount: 1 },
      { name: "images3", maxCount: 1 },
]), providerRegister)
      .post('/email/verify', providerEmailVerify)
      .post('/phone/verify', providerPhoneVerify)
      .post('/resend/otp', providerOtpResend)
      .post('/login', providerLogin)
      .post('/forgot-password', providerForgorPassword)
      .post('/reset-password', providerResetPassword);

module.exports = router;