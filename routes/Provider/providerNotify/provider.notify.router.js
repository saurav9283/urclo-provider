const express = require('express');
const { providerNotifyController } = require('./provider.notify.controller');

const router = express.Router();

router.post('/push/notify' , providerNotifyController)

module.exports = router;
