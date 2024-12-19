const moment = require('moment');

const extendAvailableTime = (availableTime, newAvailableTime) => {
    console.log('availableTime: type ', typeof(availableTime));
    try {
        const available = JSON.parse(availableTime || "[]");
        console.log('available: ', available);
        const newAvailable = JSON.parse(newAvailableTime || "[]");
        console.log('newAvailable: ', newAvailable);

        const combinedTime = [...available, ...newAvailable];
        console.log('combinedTime: ', combinedTime);

        const combinedTimeJSON = JSON.stringify(combinedTime);
        console.log('combinedTimeJSON: ', combinedTimeJSON);
 

        return combinedTimeJSON ;
    } catch (error) {
        console.error("Error merging available times:", error.message);
        return [];
    }
};

module.exports = extendAvailableTime;