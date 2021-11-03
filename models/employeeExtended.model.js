const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var EmployeeExtendedSchema = new Schema({
  employeeRef: {
    type: String,
    ref: "employee",
    required: true,
  },
  approverId: {
    type: String,
    ref: "employee",
    required: true,
  },
});
module.exports = mongoose.model(
  "employeeExtended",
  EmployeeExtendedSchema,
  "employeesExtended"
);
