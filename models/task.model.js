const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaskSchema = new Schema(
  {
    Id: { type: String, unique: true },
    _id: String,
    ItemCategoryType: { type: String, default: "Service" },
    Name: { type: String, unique: true },
    SyncToken: String,
    InvStartDate: { date: String },
    Type: { type: String, default: "Service" }, //type
    QtyOnHand: Number,
    AssetAccountRef: { value: { type: String, ref: "client" }, name: String },
    Sku: String,
    SalesTaxIncluded: Boolean,
    TrackQtyOnHand: Boolean,
    SalesTaxCodeRef: { value: String, name: String },
    ClassRef: { value: { type: String, ref: "class" }, name: String }, //class
    PurchaseTaxIncluded: Boolean, //isBillable
    Description: String, //description
    AbatementRate: Number,
    ReverseChargeRate: Number,
    SubItem: Boolean,
    Taxable: Boolean, //isTaxable
    UQCDisplayText: String,
    ReorderPoint: Number,
    PurchaseDesc: String,
    MetaData: {
      CreateTime: { type: Date, default: Date() },
      LastUpdatedTime: { type: Date, default: Date() }
    },
    PrefVendorRef: { value: { type: String, ref: "vendor" }, name: String },
    Active: Boolean, //isActive
    UQCId: String,
    PurchaseTaxCodeRef: { value: String, name: String },
    ServiceType: String,
    PurchaseCost: Number, //costRate
    ParentRef: { value: { type: String, ref: "task" }, name: String }, //Sub task
    UnitPrice: Number, //billRate
    FullyQualifiedName: String,
    Level: Number,
    IncomeAccountRef: { value: { type: String, ref: "client" }, name: String },
    ExpenseAccountRef: {
      value: { type: String, ref: "client" },
      name: String
    },
    TaxClassificationRef: { value: String, name: String }
  },
  { _id: false }
);

module.exports = mongoose.model("task", TaskSchema, "tasks");
