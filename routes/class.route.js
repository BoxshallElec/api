const express = require("express");
const class_controller = require("../controllers/class.controller");
const verify_token = require("./verify.token");

const router = express.Router();

router.post("/list", verify_token, class_controller.list);
router.post("/add", verify_token, class_controller.add);
router.patch("/update", verify_token, class_controller.update);
router.delete("/:classId", verify_token, class_controller.delete);
router.post("/listQBO", verify_token, class_controller.listQBO);
module.exports = router;
