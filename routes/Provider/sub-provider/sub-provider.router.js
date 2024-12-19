const express = require('express');
const { AddSubProviderController, GetSubProviderConteroller } = require('./sub-provider.controller');
const router = express.Router();

router.post("/subsequently/add-sub-provider" , AddSubProviderController);
router.get('/subsequently/get-sub-provider', GetSubProviderConteroller);

module.exports = router;