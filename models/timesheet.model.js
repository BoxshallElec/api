const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BillableStatus = ["Billable", "NotBillable", "HasBeenBilled"];

const TimeSheetSchema = new Schema(
  {
    Id: { type: String, unique: true },
    _id: String,
    NameOf: { value: { type: String, ref: "employee" }, name: String },
    SyncToken: String,
    EmployeeRef: { value: { type: String, ref: "employee" }, name: String },
    VendorRef: { value: { type: String, ref: "vendor" }, name: String },
    Hours: Number,
    StartTime: { dateTime: Date },
    HourlyRate: Number,
    "BreakHours BreakMinutes": Number,
    EndTime: { dateTime: Date },
    CustomerRef: { value: { type: String, ref: "customer" }, name: String },
    TxnDate: { date: Date },
    Description: String,
    ItemRef: { value: { type: String, ref: "task" }, name: String },
    ClassRef: { value: { type: String, ref: "class" }, name: String },
    DepartmentRef: { value: String, name: String },
    PayrollItemRef: { value: String, name: String },
    BillableStatus: { type: String, enum: BillableStatus },
    Taxable: Boolean,
    MetaData: {
      CreateTime: { type: Date, default: Date() },
      LastUpdatedTime: { type: Date, default: Date() }
    },
    images: [String],
    notes: String
  },
  { _id: false }
);

module.exports = mongoose.model("timesheet", TimeSheetSchema, "timesheets");
