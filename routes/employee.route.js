const express = require("express");
const employee_controller = require("../controllers/employee.controller");
const verify_token = require("./verify.token");

const router = express.Router();

router.post("/register", employee_controller.register);
router.post("/login", employee_controller.login);
router.post("/list", employee_controller.list);
router.post("/categories", employee_controller.categories);
router.post(
  "/changePassword",
  verify_token,
  employee_controller.changePassword
);
router.post("/setApprover", employee_controller.setApprover);

module.exports = router;