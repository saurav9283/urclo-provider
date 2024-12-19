const express = require('express');
const { ProviderOdditController, ProviderStartingController, ProviderEndController, ProviderOdditAllJobsController, ProviderOdditEditController, ProviderOdditDetailsController, ProviderOdditFiggureController, ProviderOdditApprovalController, ProviderOdditPaymentStatusController, ProviderOdditServiceDetailsController, ProviderOdditByIDController } = require('./provider.oddit.controller');
const upload = require('../../../lib/uploadFunction');

const router = express.Router();

router.get('/oddit/location', ProviderOdditController)
router.post('/oddit/start', ProviderStartingController)
router.post('/oddit/end', ProviderEndController)
router.get('/oddit/all-job' , ProviderOdditAllJobsController)
router.get('/oddit/provider-details' , ProviderOdditDetailsController)
router.post('/oddit/provider-service-details' , ProviderOdditServiceDetailsController)
router.put('/oddit/update-job', upload.fields([
    { name: "providerImage", maxCount: 1 },
    { name: "images1", maxCount: 1 },
    { name: "images2", maxCount: 1 },
    { name: "images3", maxCount: 1 }
  ]), ProviderOdditEditController);
router.get('/oddit/provider-figure', ProviderOdditFiggureController)

router.post('/oddit/job-approval' , ProviderOdditApprovalController)
router.put('/oddit/update-payment-status', ProviderOdditPaymentStatusController);

router.get('/oddit/get-provider-oddit-details', ProviderOdditByIDController);



module.exports = router;
