const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ApprovalStatus = ["WithEmployee", "WithApprover", "Approved", "Archived"];
const BillableStatus = ["Billable", "NotBillable", "HasBeenBilled"];
const TimesheetExtendedSchema = new Schema({
  timeSheetRef: {
    type: String,
    ref: "timesheet",
  },
  status: {
    type: String,
    enum: ApprovalStatus,
    required: true,
  },
  NameOf: { value: { type: String, ref: "employee" }, name: String },
  Hours: Number,
  EmployeeRef: { value: { type: String, ref: "employee" }, name: String },
  CustomerRef: { value: { type: String, ref: "client" }, name: String },
  ClassRef: { value: { type: String, ref: "class" }, name: String },
  ItemRef: { value: { type: String, ref: "task" }, name: String },
  Description: String,
  BillableStatus: { type: String, enum: BillableStatus },
  images: [String],
  notes: String,
  StartTime: { dateTime: Date },
});

module.exports = mongoose.model(
  "timesheetExtended",
  TimesheetExtendedSchema,
  "timesheetsExtended"
);
