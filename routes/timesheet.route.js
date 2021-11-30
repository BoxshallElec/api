const express = require("express");
const timesheet_controller = require("../controllers/timesheet.controller");
const verify_token = require("./verify.token");

const router = express.Router();
router.post("/list", verify_token, timesheet_controller.list);
router.post("/listByDate", verify_token, timesheet_controller.listByDate);
router.post("/listWithCount", verify_token, timesheet_controller.listWithCount);
router.post("/add", verify_token, timesheet_controller.add);
router.post("/draft", verify_token, timesheet_controller.draft);
router.post("/edit", verify_token, timesheet_controller.edit);
router.post("/updatestatus",verify_token,timesheet_controller.status);
router.post("/listByCompany",verify_token,timesheet_controller.listByCompany);
router.post(
  "/sendTimesheetsToQB",
  verify_token,
  timesheet_controller.sendTimesheetsToQB
);
router.get("/count", verify_token, timesheet_controller.count);
router.get(
  "/changeTimesheetsStatus",
  verify_token,
  timesheet_controller.changeTimesheetsStatus
);
router.post(
  "/getTimesheetsForAdmin",
  verify_token,
  timesheet_controller.getTimesheets
);

module.exports = router;
