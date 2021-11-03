const express = require("express");
const expenses_controller = require("../controllers/expenses.controller");
const verify_token = require("./verify.token");

const router = express.Router();

router.post("/list", verify_token, expenses_controller.list);
router.post("/admin-list", verify_token, expenses_controller.expensesForAdmin);
router.get("/admin-expenses-count", verify_token, expenses_controller.expensesCountForAdmin);
router.put("/add", verify_token, expenses_controller.add);
router.patch("/update", verify_token, expenses_controller.update);
router.delete("/delete/:id", verify_token, expenses_controller.delete);

module.exports = router;
