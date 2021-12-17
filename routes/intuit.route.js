const express = require("express");
const intuit_controller = require("../controllers/intuit.controller");
const router = express.Router();

router.get("/", intuit_controller.index);
router.get("/authUri", intuit_controller.authUri);
router.get("/callback", intuit_controller.callback);
router.get("/retrieveToken", intuit_controller.retrieveToken);
router.get("/refreshAccessToken", intuit_controller.refreshAccessToken);
router.get("/getCompanyInfo", intuit_controller.getCompanyInfo);
router.post("/webhooks", intuit_controller.webhooks);
router.get("/disconnect", intuit_controller.disconnect);
router.get("/getQBOConnection", intuit_controller.getQBOConnection);

module.exports = router;
