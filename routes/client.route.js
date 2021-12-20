const express = require("express");
const client_controller = require("../controllers/client.controller");
const verify_token = require("./verify.token");

const router = express.Router();

router.post("/list", verify_token, client_controller.list);
router.post("/listSubClient", verify_token, client_controller.listSubClient);
router.post("/add", verify_token, client_controller.add);
router.patch("/update", verify_token, client_controller.update);
router.post("/listAll", verify_token, client_controller.listAll);
router.post("/listQBO",verify_token, client_controller.listQBO);
module.exports = router;
