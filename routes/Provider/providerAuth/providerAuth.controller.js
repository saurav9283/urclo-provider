const { saveResetToken } = require("../../../lib/saveToken");
const { getProviderByEmail, getProviderByPhone, saveProvider, UpdateVerifyProvider, UpdateOTP, UpdateOTPBy_Number, updateProviderPassword } = require("./providerAuth.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const path = require("path");
const crypto = require("crypto");
const { saveResetTokenProvider } = require("../../../lib/SaveTokenProvider");
const { sendEmail } = require("../../../services/email-service");
module.exports = {    
    providerRegister: async (req, res) => {
        try {
            const { name, email, age, DOB, password, masterId, cat_id, sub_cat_id, phone, address, availableTime, documentNumber, documentType, price, description } = req.body;
            console.log('req.body: ', req.body);

            if (!name || !email || !age || !DOB || !password || !masterId || !cat_id || !sub_cat_id || !phone || !address || !availableTime || !documentNumber || !documentType || !price || !description) {
                return res.status(400).json({ message: "All fields are required" });
            }

            if (age < 18 || age > 60) {
                return res.status(400).json({ message: "You are not Authorised to work with us." });
            }

            // Check if email or phone already registered
            const emailExists = await new Promise((resolve, reject) => {
                getProviderByEmail(email, (err, result) => {
                    if (err) reject(err);
                    resolve(result && result.length > 0);
                });
            });

            if (emailExists) {
                return res.status(409).json({ message: "Email is already in use" });
            }

            const phoneExists = await new Promise((resolve, reject) => {
                getProviderByPhone(phone, (err, result) => {
                    if (err) reject(err);
                    resolve(result && result.length > 0);
                });
            });

            if (phoneExists) {
                return res.status(409).json({ message: "Phone number is already in use!" });
            }

            let hashedPassword = await bcrypt.hash(password, 10);
            const otp = Math.floor(100000 + Math.random() * 900000);
            console.log('otp: ', otp);

            const providerImage = req.files?.providerImage?.[0]?.path;
            console.log('providerImage: ', providerImage);
            const image1 = req.files?.images1?.[0]?.path;
            const image2 = req.files?.images2?.[0]?.path;
            const image3 = req.files?.images3?.[0]?.path; 
            const images = [image1, image2, image3].filter((image) => image);

            const providerImageUrl = `${req.protocol}://${req.get('host')}/images/${path.basename(providerImage)}`;
            const imageUrls = images.map((image) => `${req.protocol}://${req.get('host')}/images/${path.basename(image)}`);
            console.log('imageUrls: ', imageUrls);

            if (!providerImage || !images || images.length === 0) {
                return res.status(400).json({ message: "Provider image and service images are required." });
            } 

            // Data for `providers` table
            const providerData = {
                name,
                email,
                age,
                DOB,
                phone,
                address,
                documentNumber,
                documentType, 
                password: hashedPassword,
                otp,
                otpExpires: moment().add(1, 'hours').format('YYYY-MM-DD HH:mm:ss'),
                createdOn: moment().format('YYYY-MM-DD HH:mm:ss'), 
                isVerified: 0 
            };

            const serviceData = {
                masterId,
                cat_id, 
                sub_cat_id,
                // availableTime: JSON.parse(availableTime),
                availableTime: JSON.stringify(availableTime), 
                price, 
                images: imageUrls,
                providerImage: providerImageUrl,
                description
            };
            console.log('serviceData: ', serviceData);

            // Save data
            saveProvider(providerData, serviceData, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: "Internal Server Error" });
                }
                return res.status(201).json({ message: "Registration successful. OTP sent to your email or phone." });
            });

        } catch (error) {
            console.error(error.message);
            res.status(400).json({ error: error.message });
        }
    },

    providerEmailVerify: async (req, res) => {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const provider = await new Promise((resolve, reject) => {
            getProviderByEmail(email, (err, result) => {
                if (err) reject(err);
                resolve(result && result[0]);
            });
        });
        if (!provider) {
            return res.status(404).json({ message: "Email not registered" });
        }
        if (provider.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        provider.isVerified = 1;
        UpdateVerifyProvider(provider, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Internal Server Error" });
            }
            return res.status(200).json({ message: "Email verified successfully" });
        });
    },
    providerPhoneVerify: async (req, res) => {
        const { phone, otp } = req.body;
        if (!phone || !otp) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const provider = await new Promise((resolve, reject) => {
            getProviderByPhone(phone, (err, result) => {
                if (err) reject(err);
                resolve(result && result[0]);
            });
        });
        if (!provider) {
            return res.status(404).json({ message: "Phone number not registered" });
        }
        if (provider.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        if (provider.isVerified) {
            return res.status(400).json({ message: "Phone number is already verified" });
        }
        if (provider.otpExpires < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }
        provider.isVerified = 1;
        UpdateVerifyProvider(provider, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Internal Server Error" });
            }
            return res.status(200).json({ message: "Phone number verified successfully" });
        });
    },
    providerOtpResend: async (req, res) => {
        const { email, phone } = req.body;

        if (email) {
            const provider = await new Promise((resolve, reject) => {
                getProviderByEmail(email, (err, result) => {
                    if (err) reject(err);
                    resolve(result && result[0]);
                });
            });
            if (!provider) {
                return res.status(404).json({ message: "Email not registered" });
            }
            if (provider.isVerified == 0) {
                return res.status(400).json({ message: "verify email first" });
            }
            const otp = Math.floor(100000 + Math.random() * 900000);
            provider.otp = otp;
            UpdateOTP(provider, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: "Internal Server Error" });
                }
                return res.status(200).json({ message: "OTP re-sent successfully" });
            });
        }
        if (phone) {
            const provider = await new Promise((resolve, reject) => {
                getProviderByPhone(phone, (err, result) => {
                    if (err) reject(err);
                    resolve(result && result[0]);
                });
            });
            if (!provider) {
                return res.status(404).json({ message: "Phone number not registered" });
            }
            if (provider.isVerified) {
                return res.status(400).json({ message: "Phone number is already verified" });
            }
            const otp = Math.floor(100000 + Math.random() * 900000);
            provider.otp = otp;
            UpdateOTPBy_Number(provider, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: "Internal Server Error" });
                }
                return res.status(200).json({ message: "OTP re-sent successfully" });
            });
        }
    },
    providerLogin: async (req, res) => {
        const { phone, email, password } = req.body;
        if (!phone && !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (email) {
            const provider = await new Promise((resolve, reject) => {
                getProviderByEmail(email, (err, result) => {
                    if (err) reject(err);
                    resolve(result && result[0]);
                });
            }); 
            if (!provider) {
                return res.status(404).json({ message: "Email not registered" });
            }
            if (!provider.isVerified) {
                return res.status(400).json({ message: "Email not verified" });
            }
            if (!(await bcrypt.compare(password, provider.password))) {
                return res.status(400).json({ message: "Invalid password" });
            }
            return res.status(200).json({ message: "Login successful",provider_id:provider.id,name:provider.name, email:provider.email });
        }
        if (phone) {
            const provider = await new Promise((resolve, reject) => {
                getProviderByPhone(phone, (err, result) => {
                    if (err) reject(err);
                    resolve(result && result[0]);
                });
            });
            if (!provider) {
                return res.status(404).json({ message: "Phone number not registered" });
            }
            if (!provider.isVerified) {
                return res.status(400).json({ message: "Phone number not verified" });
            }
            if (!(await bcrypt.compare(password, provider.password))) {
                return res.status(400).json({ message: "Invalid password" });
            }
            return res.status(200).json({ message: "Login successful", provider_id:provider.id,name:provider.name,phone:provider.phone });
        }
    },
    providerForgorPassword: async (req, res) => {
        const { email, phone } = req.body;
        if (email) {
            const provider = await new Promise((resolve, reject) => {
                getProviderByEmail(email, (err, result) => {
                    if (err) reject(err);
                    resolve(result && result[0]);
                });
            });
            if (!provider) {
                return res.status(404).json({ message: "Email not found" });
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            console.log('resetToken: ', resetToken);
            const tokenExpiry = moment().add(1, 'hours').format('YYYY-MM-DD HH:mm:ss');
            const iat = moment().unix();
            const tokenPayload = {
                resetToken: resetToken,
                email: email,
                expiry: tokenExpiry,
                iat: iat,
                provider: provider.id,
            };
            const jwtToken = jwt.sign(tokenPayload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
            const resetLink = `http://localhost:3000/provider/reset-password?token=${encodeURIComponent(jwtToken)}`;

            const payload = {
                from: process.env.MAIL_SENDER_EMAIL,
                to: provider.email,
                subject: '[URCLO] Password Reset E-mail',
                template: `forgotpassword.ejs`,
                data: {
                    name: provider.name,
                    resetLink,
                },
            };

            const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');

            // console.log(payload, "payload=-=-");
            await saveResetTokenProvider(provider.id, jwtToken, tokenExpiry, iat, currentDateTime);
            await sendEmail(payload);
            return res.status(200).json({ msg: "Password reset link sent successfully" });
        }
    },
    providerResetPassword: async (req, res) => {
        const { token } = req.query;
        const { password } = req.body;

        if (!token) {
            return res.status(400).json({ msg: "Something wrong" });
        }
        if (!password) {
            return res.status(400).json({ msg: "Password is required" });
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            console.log('Decoded Token:', decoded);
            const { email, provider } = decoded;
            console.log('provider: ', provider);
            const hashedPassword = await bcrypt.hash(password, 10);
            await updateProviderPassword(provider, hashedPassword);
            return res.status(200).json({ msg: "Password reset successful" });
        } catch (error) {
            console.log('error:=-=- ', error);
            if(error.message === 'jwt expired') {
                return res.status(400).json({ msg: "Token expired again try to forget password" });
            }
            else{
                return res.status(500).json({ msg: error.message });
            }
        }
    },
}