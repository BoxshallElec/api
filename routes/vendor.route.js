const express = require("express");
const vendor_controller = require("../controllers/vendor.controller");
const verify_token = require("./verify.token");

const router = express.Router();

router.post("/list", verify_token, vendor_controller.list);
router.post("/add", verify_token, vendor_controller.add);
router.patch("/update", verify_token, vendor_controller.update);
router.delete("/:vendorId", verify_token, vendor_controller.delete);

module.exports = router;
