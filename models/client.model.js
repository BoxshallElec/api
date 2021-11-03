const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const DeliveryMethods = ["Print", "Email", "None"];

const ClientSchema = new Schema(
  {
    Id: { type: String, unique: true },
    _id: String,
    SyncToken: String,
    DisplayName: { type: String, unique: true },
    Title: String,
    GivenName: String,
    MiddleName: String,
    Suffix: String,
    FamilyName: String,
    PrimaryEmailAddr: { Address: String },
    ResaleNum: String,
    SecondaryTaxIdentifier: String,
    ARAccountRef: String,
    DefaultTaxCodeRef: { value: String, name: String },
    PreferredDeliveryMethod: {
      type: String,
      enum: DeliveryMethods,
      default: "Print"
    },
    GSTIN: String,
    SalesTermRef: { value: String, name: String },
    CustomerTypeRef: { value: String },
    Fax: { FreeFormNumber: String },
    BusinessNumber: String,
    BillWithParent: String,
    CurrencyRef: { value: String, name: String },
    Mobile: { FreeFormNumber: String },
    Job: Boolean,
    BalanceWithJobs: Number,
    PrimaryPhone: { FreeFormNumber: String },
    OpenBalanceDate: { date: String },
    Taxable: Boolean,
    AlternatePhone: { FreeFormNumber: String },
    MetaData: {
      CreateTime: { type: Date, default: Date() },
      LastUpdatedTime: { type: Date, default: Date() }
    },
    ParentRef: {
      value: {
        type: String,
        ref: "client"
      },
      name: String
    },
    Notes: String,
    WebAddr: { URI: String },
    Active: Boolean,
    Balance: Number,
    ShipAddr: {
      Country: String,
      CountrySubDivisionCode: String,
      City: String,
      PostalCode: String,
      Id: String,
      Line1: String,
      Line2: String
    },
    PaymentMethodRef: { value: String, name: String },
    IsProject: Boolean,
    CompanyName: String,
    PrimaryTaxIdentifier: String,
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
    FullyQualifiedName: String,
    Level: Number,
    TaxExemptionReasonId: Number,

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee"
    },
    salesRep: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee"
    },
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "employee"
      }
    ],
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "group"
    },
    beginDate: Date,
    endDate: Date
  },
  { _id: false }
);

module.exports = mongoose.model("client", ClientSchema, "clients");
