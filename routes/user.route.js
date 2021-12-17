const express = require("express");
const user_controller = require("../controllers/user.controller");
const verify_token = require("./verify.token");

const router = express.Router();

router.post("/register", user_controller.register);
// router.post("/login", employee_controller.login);
router.post("/list", user_controller.list);
router.post("/categories", user_controller.categories);
router.post(
  "/changePassword",
  verify_token,
  user_controller.changePassword
);
router.post("/setApprover", user_controller.setApprover);
router.post("/getApprover", user_controller.getApprover);
module.exports = router;
