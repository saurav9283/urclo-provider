const pool = require("../../../config/database");
const moment = require('moment');
const { appointmentSchedule, serviceStarted, serviceEnded } = require('../../../lib/web.notification.type');


module.exports = {
    // providerNotifyService : async (user_id,providerId,schedule_time ) => {

    providerNotifyService: async (user_id, providerId, schedule_time) => {
        // console.log('providerId,user_id: ', providerId,user_id);
        const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const providerSMS = appointmentSchedule.schedule.replace('[Date and Time]', schedule_time);

        try {
            const payload = {
                providerId,
                user_id,
                content: providerSMS,
                code: appointmentSchedule.code,
                type: appointmentSchedule.type,
                createdon: currentDateTime,
            };

            const query = process.env.INSERT_PROVIDER_SMS
                .replace('<provider_id>', payload.providerId)
                .replace('<user_id>', payload.user_id)
                .replace('<content>', payload.content)
                .replace('<code>', payload.code)
                .replace('<type>', payload.type)
                .replace('<createdon>', payload.createdon);

            await new Promise((resolve, reject) => {
                pool.query(query, (error, results) => {
                    if (error) {
                        console.error('Error:', error);
                        return reject(error);
                    }
                    return resolve(results);
                });
            });

            console.log('SMS notification logged successfully for provider:', providerId);
            const io = require('../../../app').get('io');
            io.emit('provider-booked', {
                user_id,
                providerId,
                schedule_time,
                message: providerSMS,
            });

            console.log('React time provider book:', providerId);

            return { success: true, message: 'React time Notification sent successfully' };
        } catch (error) {
            console.error("Provider Notification service error:", error);
            return { message: "Internal Server Error" };
        }
    },

    providerNotifyStartService: async (provider_id, user_id) => {
        // console.log('provider_id, user_id: ', provider_id, user_id);
        const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const providerSMS = serviceStarted.sms.replace('[USER NAME]', user_id);

        try {
            const payload = {
                providerId: provider_id,
                user_id,
                content: providerSMS,
                code: serviceStarted.code,
                type: serviceStarted.type,
                createdon: currentDateTime,
            };
            // console.log('payload: ', payload);
            const query = process.env.INSERT_PROVIDER_SMS_TO_START
                .replace('<provider_id>', payload.providerId)
                .replace('<user_id>', payload.user_id)
                .replace('<content>', payload.content)
                .replace('<code>', payload.code)
                .replace('<type>', payload.type)
                .replace('<createdon>', payload.createdon);
            // console.log('query: ', query);
            return new Promise((resolve, reject) => {
                pool.query(query, (error, results) => {
                    if (error) {
                        console.error('Error:', error);
                        return reject(error);
                    }
                    return resolve(results);
                });
            });
        } catch (error) {
            console.error("Provider Notification service error:", error);
            return { message: "Internal Server Error" };
        }
    },
    providerNotifyEndService: async (provider_id, user_id) => {
        // console.log('provider_id, user_id: ', provider_id, user_id);
        const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const providerSMS = serviceEnded.sms.replace('[USER NAME]', user_id);

        try {
            const payload = {
                providerId: provider_id,
                user_id,
                content: providerSMS,
                code: serviceEnded.code,
                type: serviceEnded.type,
                createdon: currentDateTime,
            };

            // console.log('payload: ', payload);
            const query = process.env.INSERT_PROVIDER_SMS_TO_END
                .replace('<provider_id>', payload.providerId)
                .replace('<user_id>', payload.user_id)
                .replace('<content>', payload.content)
                .replace('<code>', payload.code)
                .replace('<type>', payload.type)
                .replace('<createdon>', payload.createdon);
            // console.log('query: ', query);
            return new Promise((resolve, reject) => {
                pool.query(query, (error, results) => {
                    if (error) {
                        console.error('Error:', error);
                        return reject(error);
                    }
                    return resolve(results);
                });
            });
        } catch (error) {
            console.error("Provider Notification service error:", error);
            return { message: "Internal Server Error" };
        }
    }
}