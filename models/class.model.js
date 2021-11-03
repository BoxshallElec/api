const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ClassSchema = new Schema(
  {
    Id: { type: String, unique: true },
    _id: String,
    Name: { type: String, unique: true },
    SyncToken: String,
    ParentRef: {
      value: { type: String, ref: "class" },
      name: String
    },
    SubClass: Boolean,
    Active: Boolean,
    MetaData: {
      CreateTime: { type: Date, default: Date() },
      LastUpdatedTime: { type: Date, default: Date() }
    },
    FullyQualifiedName: String
  },
  { _id: false }
);

module.exports = mongoose.model("class", ClassSchema, "classes");
