const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SALT_WORK_FACTOR = 10;
const bcrypt = require("bcrypt");
const TYPE = ["Admin", "Employee", "User"];
const Gender = ["Male", "Female"];

var EmployeeSchema = new Schema(
  {
    // linkEmployees.id = res.body.linkedEmployeeId;
    // linkEmployees.mongoid = res.body.linkUserId;
    // linkEmployees.rate = res.body.hourlyRate;
    // linkEmployees.tax = res.body.taxRequired;
    // linkEmployees.taxType= res.body.taxType;
    // linkEmployees.superRequired = res.body.superRequired;
    // linkEmployees.superPercentage=res.body.superPercentage,
    // linkEmployees.superBase= res.body.superBase; 
    // linkEmployees.superPayable
    
    name:String,
    mongoid : String,
    rate: String,
    tax: String,
    taxType: String,
    superRequired: String,
    superPercentage: String,
    superBase: String,
    superPayable: String,
    type: { type: String, enum: TYPE, default: "Employee" },
    
  },
 
);




// EmployeeSchema.methods.update = function (employee) {
//   this.BillableTime = employee.BillableTime;
//   this.HiredDate = employee.HiredDate;
//   this.Suffix = employee.Title;
//   this.GivenName = employee.GivenName;
//   this.FamilyName = employee.FamilyName;
//   this.DisplayName = employee.DisplayName;
//   this.sparse = employee.sparse;
//   this.PrimaryPhone = employee.PrimaryPhone.FreeFormNumber;
//   this.Active = employee.Active;

//   return this.save();
// };

module.exports = mongoose.model("employeeQBO", EmployeeSchema, "employeesQBO");
