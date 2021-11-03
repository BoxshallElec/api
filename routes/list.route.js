const express = require("express");
const list_controller = require("../controllers/list.controller");
const verify_token = require("./verify.token");

const router = express.Router();

//expense-items
router.post("/expense-item-list", verify_token, list_controller.listExpenseItem);
router.post("/expense-item-add", verify_token, list_controller.addExpenseItem);
router.patch("/expense-item", verify_token, list_controller.updateExpenseItem);
router.delete("/expense-item/:expenseItemId", verify_token, list_controller.deleteExpenseItem);

module.exports = router;
