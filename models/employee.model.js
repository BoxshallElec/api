const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SALT_WORK_FACTOR = 10;
const bcrypt = require("bcrypt");
const TYPE = ["Admin", "Employee", "User"];
const Gender = ["Male", "Female"];

var EmployeeSchema = new Schema(
  {
    Id: { type: String, unique: true },
    _id: String,
    SyncToken: { type: String },
    PrimaryAddr: {
      Country: String,
      CountrySubDivisionCode: String,
      City: String,
      PostalCode: String,
      Id: String,
      Line1: String,
      Line2: String,
    },
    PrimaryEmailAddr: { Address: String },
    DisplayName: { type: String, unique: true },
    Title: String,
    BillableTime: { type: Boolean },
    GivenName: String,
    BirthDate: Date,
    MiddleName: String,
    SSN: String,
    PrimaryPhone: { FreeFormNumber: String },
    Active: { type: Boolean, default: true },
    ReleasedDate: Date,
    MetaData: {
      CreateTime: { type: Date, default: Date() },
      LastUpdatedTime: { type: Date, default: Date() },
    },
    Mobile: { FreeFormNumber: String },
    Gender: { type: String, enum: Gender, default: "Male" },
    HiredDate: Date,
    BillRate: Number,
    Organization: Boolean,
    Suffix: String,
    FamilyName: String,
    PrintOnCheckName: String,
    EmployeeNumber: String,
    V4IDPseudonym: String,
    domain: { type: String, default: "QBO" },
    sparse: { type: Boolean, default: false },

    //Internal Use
    email: { type: String, unique: true },
    password: String,
    isFirstTime: { type: Boolean, default: true },
    type: { type: String, enum: TYPE, default: "User" },
  },
  { _id: false }
);

EmployeeSchema.pre("save", function (next) {
  var user = this;
  if (!user.isModified("password")) return next();

  try {
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } catch (error) {
    throw error;
  }
});

EmployeeSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

EmployeeSchema.methods.changePassword = function (password) {
  this.isFirstTime = false;
  this.password = password;
  return this.save();
};

EmployeeSchema.methods.updateFirstTime = function () {
  this.isFirstTime = false;
  return this.save();
};

EmployeeSchema.methods.update = function (employee) {
  this.BillableTime = employee.BillableTime;
  this.HiredDate = employee.HiredDate;
  this.Suffix = employee.Title;
  this.GivenName = employee.GivenName;
  this.FamilyName = employee.FamilyName;
  this.DisplayName = employee.DisplayName;
  this.sparse = employee.sparse;
  this.PrimaryPhone = employee.PrimaryPhone.FreeFormNumber;
  this.Active = employee.Active;

  return this.save();
};

module.exports = mongoose.model("employee", EmployeeSchema, "employees");
