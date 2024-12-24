const pool = require('../../../config/database');
const { sendSms } = require('../../../services/sms-service.js');
const { sendEmail } = require('../../../services/email-service');
const moment = require('moment');

module.exports = {
    getProviderByEmail: async (email, callback) => {
        const provider_email = process.env.CHECKEXISTINGEMAIL_PROVIDER.replace('<email>', email);
        pool.query(provider_email, (err, result) => {
            if (err) {
                console.error("Error checking email:", err);
                return callback(err);
            }
            return callback(null, result);
        });
    },
    getProviderByPhone: async (phone, callback) => {
        const provider_phone = process.env.CHECKEXISTINGPHONE_PROVIDER.replace('<phone>', phone);
        pool.query(provider_phone, (err, result) => {
            if (err) {
                console.error("Error checking phone:", err);
                return callback(err);
            }
            return callback(null, result);
        });
    },

    // saveProvider: async (providerData, serviceData, callback) => {
    //     try {
    //         console.log(JSON.parse(serviceData.availableTime));
    //         const { name, email, phone, otp } = providerData;

    //         // Send OTP via SMS and Email
    //         if (phone) {
    //             await sendSms(phone, `Your OTP for registration is ${otp}`);
    //         }
    //         if (email) {
    //             const emailPayload = {
    //                 from: process.env.MAIL_SENDER_EMAIL,
    //                 to: email,
    //                 subject: 'OTP for Registration',
    //                 template: 'emailotp.ejs',
    //                 data: { name, otp },
    //             };
    //             await sendEmail(emailPayload);
    //         }

    //         // Insert into `providers` table
    //         const providerQuery = process.env.PROVIDER_DETAILS;
    //         const providerValues = [
    //             providerData.name, providerData.email, providerData.age, providerData.DOB, providerData.phone,
    //             providerData.address, providerData.documentNumber, providerData.documentType, providerData.password,
    //             providerData.otp, providerData.otpExpires, providerData.createdOn, providerData.isVerified,
    //         ];
    //         console.log('providerValues: ', providerValues);

    //         pool.query(providerQuery, providerValues, (err, result) => {
    //             if (err) {
    //                 console.error("Error saving provider data:", err.message);
    //                 return callback(err);
    //             }
    //             console.log('result:=-= ', result);

    //             const providerId = result.insertId;
    //             console.log('providerId: ', providerId);

    //             // Insert into `provider_services` table
    //             const serviceQuery =  process.env.PROVIDER_SERVICE_DETAILS;
    //             const serviceValues = [
    //                 providerId, serviceData.masterId, serviceData.cat_id, serviceData.sub_cat_id,
    //                 serviceData.availableTime, serviceData.price,
    //                 JSON.stringify(serviceData.images) , serviceData.providerImage, serviceData.description,
    //             ];

    //             pool.query(serviceQuery, serviceValues, (err, result) => {
    //                 if (err) {
    //                     console.error("Error saving service data:", err.message);
    //                     return callback(err);
    //                 }
    //                 callback(null, "Data saved successfully.");
    //             });
    //         });
    //     } catch (error) {
    //         console.error("Error:", error.message);
    //         callback(error);
    //     }
    // },


    saveProvider: async (providerData, serviceData, callback) => {
        try {
            console.log(JSON.parse(serviceData.availableTime));
            const { name, email, phone, otp } = providerData;

            // Send OTP via SMS and Email
            if (phone) {
                await sendSms(phone, `Your OTP for registration is ${otp}`);
            }
            if (email) {
                const emailPayload = {
                    from: process.env.MAIL_SENDER_EMAIL,
                    to: email,
                    subject: 'OTP for Registration',
                    template: 'emailotp.ejs',
                    data: { name, otp },
                };
                await sendEmail(emailPayload);
            }

            // Insert into `providers` table
            const providerQuery = process.env.PROVIDER_DETAILS;
            const providerValues = [
                providerData.name, providerData.email, providerData.age, providerData.DOB, providerData.phone,
                providerData.address, providerData.documentNumber, providerData.documentType, providerData.password,
                providerData.otp, providerData.otpExpires, providerData.createdOn, providerData.isVerified,
            ];
            console.log('providerValues: ', providerValues);

            pool.query(providerQuery, providerValues, (err, result) => {
                if (err) {
                    console.error("Error saving provider data:", err.message);
                    return callback(err);
                }
                console.log('result:=-= ', result);

                const providerId = result.insertId;
                console.log('providerId: ', providerId);

                // Insert into `provider_services` table
                const serviceQuery = process.env.PROVIDER_SERVICE_DETAILS;
                const serviceValues = [
                    providerId,
                    serviceData.availableTime, serviceData.price,
                    JSON.stringify(serviceData.images), serviceData.providerImage, serviceData.description,
                ];

                pool.query(serviceQuery, serviceValues, (err, result) => {
                    if (err) {
                        console.error("Error saving service data:", err.message);
                        return callback(err);
                    }
                    // console.log("serviceData.sub_cat_id" , typeof(serviceData.sub_cat_id))
                    let subCatIds
                    subCatIds = JSON.parse(serviceData.sub_cat_id);
                    subCatIds = subCatIds.map(id => parseInt(id, 10));


                    const categoryQuery = 'INSERT INTO tbl_provider_category (providerId, masterId, cat_id, sub_cat_id) VALUES ?';
                    const categoryValues = subCatIds.map(subCatId => [
                        providerId,
                        serviceData.masterId,
                        serviceData.cat_id,
                        subCatId,
                    ]);

                    pool.query(categoryQuery, [categoryValues], (err, result) => {
                        if (err) {
                            console.error("Error saving provider categories:", err.message);
                            return callback(err);
                        }
                        callback(null, "Data saved successfully.");
                    });
                });
            });
        } catch (error) {
            console.error("Error:", error.message);
            callback(error);
        }
    },

    UpdateVerifyProvider: async (provider, callback) => {
        const getproviderId = process.env.GET_PROVIDERID.replace('<email>', provider.email);
        console.log('getproviderId: ', getproviderId);

        pool.query(getproviderId, (err, result) => {
            if (err) {
                console.error("Error getting provider id:", err);
                return callback(err);
            }
            const providerId = result[0].id;
            console.log('providerId: ', providerId);

            const updateProvider = process.env.UPDATE_PROVIDER.replace('<providerId>', providerId)
                .replace('<isVerified>', provider.isVerified);
            console.log('updateProvider: ', updateProvider);

            pool.query(updateProvider, (err, result) => {
                if (err) {
                    console.error("Error updating provider:", err);
                    return callback(err);
                }
                return callback(null, result);
            });
        });
    },
    UpdateOTP: async (provider, callback) => {
        if (provider.email) {
            sendEmail({
                from: process.env.MAIL_SENDER_EMAIL,
                to: provider.email,
                subject: 'OTP for registration',
                template: `emailotp.ejs`,
                data: {
                    name: provider.name,
                    otp: provider.otp,
                },
            });
            const getproviderId = process.env.GET_PROVIDERID.replace('<email>', provider.email);
            console.log('getproviderId: ', getproviderId);

            pool.query(getproviderId, (err, result) => {
                if (err) {
                    console.error("Error getting provider id:", err);
                    return callback(err);
                }
                const providerId = result[0].id;
                console.log('providerId: ', providerId);

                const otpExpires = moment().add(1, 'hours').format('YYYY-MM-DD HH:mm:ss');

                const updateProvider = process.env.UPDATE_OTP.replace('<providerId>', providerId)
                    .replace('<otp>', provider.otp)
                    .replace('<otpExpires>', otpExpires)
                console.log('updateProvider: ', updateProvider);

                pool.query(updateProvider, (err, result) => {
                    if (err) {
                        console.error("Error updating provider:", err);
                        return callback(err);
                    }
                    return callback(null, "OTP re-sent successfully");
                });
            });
        }
        else if (provider.phone) {
            const getproviderId = process.env.GET_PROVIDERID.replace('<phone>', provider.phone);
            console.log('getproviderId: ', getproviderId);

        }
    },
    UpdateOTPBy_Number: async (provider, callback) => {
        sendSms(provider.phone, `Your OTP for registration is ${provider.otp}`);
        const getproviderId = process.env.GET_PROVIDERID_PHONE.replace('<phone>', provider.phone);
        console.log('getproviderId: ', getproviderId);

        pool.query(getproviderId, (err, result) => {
            if (err) {
                console.error("Error getting provider id:", err);
                return callback(err);
            }
            const providerId = result[0].id;
            console.log('providerId: ', providerId);

            const otpExpires = moment().add(1, 'hours').format('YYYY-MM-DD HH:mm:ss');

            const updateProvider = process.env.UPDATE_OTP.replace('<providerId>', providerId)
                .replace('<otp>', provider.otp)
                .replace('<otpExpires>', otpExpires)
            console.log('updateProvider: ', updateProvider);

            pool.query(updateProvider, (err, result) => {
                if (err) {
                    console.error("Error updating provider:", err);
                    return callback(err);
                }
                return callback(null, "OTP re-sent successfully");
            });
        });
    },
    updateProviderPassword: (provider, newPassword) => {
        return new Promise((resolve, reject) => {
            console.log('provider: ', provider);
            const GETTid = process.env.GET_PROVIDER_ID.replace('<id>', provider);
            console.log('GETTid: ', GETTid);

            pool.query(GETTid, (err, result) => {
                if (err) {
                    console.error("Error retrieving user ID:", err);
                    return reject(err);
                }

                const user = result[0];
                console.log('user: ', user);
                const updatePasswordQuery = process.env.UPDATE_PASSWORD_PROVIDER
                    .replace('<id>', user.id)
                    .replace('<password>', newPassword); // Use newPassword here

                pool.query(updatePasswordQuery, (err, result) => {
                    if (err) {
                        console.error("Error updating user:", err);
                        return reject(err);
                    }
                    return resolve("Password updated successfully");
                });
            });
        });
    }
}