const express = require("express");
const upload_controller = require("../controllers/upload.controller");
const verify_token = require("./verify.token");

const router = express.Router();

router.post("/generate-signed-urls", verify_token, upload_controller.getSignedUrls);
router.delete("/delete-images", verify_token, upload_controller.deleteFilesFromAWS);

module.exports = router;
