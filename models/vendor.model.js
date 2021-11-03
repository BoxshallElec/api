const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VendorSchema = new Schema(
  {
    Id: { type: String, unique: true },
    _id: String,
    SyncToken: String,
    Title: String,
    GivenName: String,
    MiddleName: String,
    Suffix: String,
    FamilyName: String,
    PrimaryEmailAddr: { Address: String },
    DisplayName: { type: String, unique: true },
    OtherContactInfo: {
      Type: String,
      Telephone: String
    },
    APAccountRef: { value: String, name: String },
    TermRef: { value: String, name: String },
    GSTIN: String,
    Fax: { FreeFormNumber: String },
    BusinessNumber: String,
    CurrencyRef: { value: String, name: String },
    HasTPAR: Boolean,
    TaxReportingBasis: String,
    Mobile: { FreeFormNumber: String },
    PrimaryPhone: { FreeFormNumber: String },
    Active: Boolean,
    AlternatePhone: { FreeFormNumber: String },
    MetaData: {
      CreateTime: { type: Date, default: Date() },
      LastUpdatedTime: { type: Date, default: Date() }
    },
    Vendor1099: Boolean,
    BillRate: Number,
    WebAddr: { URI: String },
    CompanyName: String,
    VendorPaymentBankDetail: {
      BankAccountName: String,
      BankBranchIdentifier: String,
      BankAccountNumber: String,
      StatementText: String
    },
    TaxIdentifier: String,
    AcctNum: String,
    GSTRegistrationType: String,
    PrintOnCheckName: String,
    BillAddr: {
      Country: String,
      CountrySubDivisionCode: String,
      City: String,
      PostalCode: String,
      Id: String,
      Line1: String,
      Line2: String
    },
    Balance: Number
  },
  { _id: false }
);

module.exports = mongoose.model("vendor", VendorSchema, "vendors");
