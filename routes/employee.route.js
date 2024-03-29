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
router.post("/sendEmail", employee_controller.sendEmail);
router.post("/createQBOTime",employee_controller.createQBOTime);
router.post("/createQBOInvoice",employee_controller.createQBOInvoice);
router.post("/createQBOPayment",employee_controller.createQBOPayment);
router.post("/getlinkedEmployee",employee_controller.getlinkedEmployee);
router.post("/setApprover", employee_controller.setApprover);
router.post("/getApprover", employee_controller.getApprover);
router.post("/getAllEmployeesQBO",employee_controller.getAllEmployeesQBO);
router.post("/linkEmployee",employee_controller.linkEmployee);
router.post("/listlnk",employee_controller.listlnk);
router.post("/getTaxQBO",employee_controller.getTaxQBO);
router.post("/getSuperQBO",employee_controller.getSuperQBO);
router.post("/listDetails",employee_controller.listDetails);
module.exports = router;
