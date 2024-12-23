const pool = require("../../../config/database");

module.exports = {
    AddSubPRoviderService(provideId, subProoviderName, subProviderAge, subMasterId, subProviderCatId, subProviderSubCatId, sub_providerNumber, callback) {
        // '<provideId>', '<sub_Name>', '<sub_Age>','<master_id>','<cat_id>','<sub_cat_id>');
        // const create_sub_provider = process.env.CREATE_SUB_PROVIDER
        // .replace('<provideId>' ,provideId)
        // .replace('<sub_Name>',subProoviderName)
        // .replace('<sub_Age>',subProviderAge)
        // .replace('<master_id>',subMasterId)
        // .replace('<cat_id>',subProviderCatId)
        // .replace('<sub_cat_id>',subProviderSubCatId)
        // .replace('<sub_providerNumber>',sub_providerNumber);

        // pool.query(create_sub_provider, (err, result) => {
        //     if (err) {
        //         console.error("Error saving sub provider data:", err.message);
        //         return callback(err);
        //     }
        //     callback(null, `Sub Provider ${subProoviderName} added successfully.`);
        // });
        const CHECK_SUB_PROVIDER_EXIST = process.env.CHECK_SUB_PROVIDER_EXIST
            .replace('<master_id>', subMasterId)
            .replace('<cat_id>', subProviderCatId)
            .replace('<sub_cat_id>', subProviderSubCatId)
            .replace('<sub_providerNumber>', sub_providerNumber);
        console.log('CHECK_SUB_PROVIDER_EXIST: ', CHECK_SUB_PROVIDER_EXIST);

        pool.query(CHECK_SUB_PROVIDER_EXIST, (err, result) => {
            if (err) {
                console.error("Error fetching sub provider data:", err.message);
                return callback(err);
            }
            if (result.length > 0) {
                return callback(null, `Sub Provider ${subProoviderName} already exist.`);
            }
            const create_sub_provider = process.env.CREATE_SUB_PROVIDER
                .replace('<provideId>', provideId)
                .replace('<sub_Name>', subProoviderName)
                .replace('<sub_Age>', subProviderAge)
                .replace('<master_id>', subMasterId)
                .replace('<cat_id>', subProviderCatId)
                .replace('<sub_cat_id>', subProviderSubCatId)
                .replace('<sub_providerNumber>', sub_providerNumber);
            console.log('create_sub_provider: ', create_sub_provider);
            pool.query(create_sub_provider, (err, result) => {
                if (err) {
                    console.error("Error saving sub provider data:", err.message);
                    return callback(err);
                }
                callback(null, `Sub Provider ${subProoviderName} added successfully.`);
            });
        }
        );


    },
    GetSubProviderService(sub_cat_id, provideId, callback) {
        const get_sub_provider = process.env.GET_SUB_PROVIDER
            .replace('<sub_cat_id>', sub_cat_id)
            .replace('<provideId>', provideId);
        console.log('get_sub_provider: ', get_sub_provider);
        pool.query(get_sub_provider, (err, result) => {
            if (err) {
                console.error("Error fetching sub provider data:", err.message);
                return callback(err);
            }
            callback(null, result);
        });
    }
}