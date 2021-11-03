const express = require("express");
const task_controller = require("../controllers/task.controller");
const verify_token = require("./verify.token");

const router = express.Router();

router.post("/list", verify_token, task_controller.listTasks);
router.post("/add", verify_token, task_controller.addTask);
router.patch("/update", verify_token, task_controller.updateTasks);
router.delete("/delete/:taskId", verify_token, task_controller.deleteTask);

module.exports = router;
