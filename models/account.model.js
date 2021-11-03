const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Classification = ["Asset", "Equity", "Expense", "Liability", "Revenue"];
const TxnLocationType = [
  "WithinFrance",
  "FranceOverseas",
  "OutsideFranceWithEU",
  "OutsideEU"
];

const AccountSchema = new Schema(
  {
    Id: { type: String, unique: true },
    _id: String,
    Name: String,
    SyncToken: String,
    AcctNum: String,
    CurrencyRef: { value: String, name: String },
    ParentRef: { value: { type: String, ref: "account" }, name: String },
    Description: String,
    Active: Boolean,
    MetaData: {
      CreateTime: { type: Date, default: Date() },
      LastUpdatedTime: { type: Date, default: Date() }
    },
    SubAccount: Boolean,
    Classification: { type: String, enum: Classification },
    FullyQualifiedName: String,
    TxnLocationType: { type: String, enum: TxnLocationType },
    AccountType: {},
    CurrentBalanceWithSubAccounts: Number,
    AccountAlias: String,
    TaxCodeRef: { value: String, name: String },
    AccountSubType: String,
    CurrentBalance: Number
  },
  { _id: false }
);

module.exports = mongoose.model("account", AccountSchema, "accounts");
