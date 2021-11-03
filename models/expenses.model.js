const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const DetailType = ["ItemBasedExpenseLineDetail"];
const BillableStatusEnum = ["Billable", "NotBillable", "HasBeenBilled"];
const PaymentTypeEnum = ["Cash", "Check", "CreditCard"];
const PrintStatusEnum = ["NotSet", "NeedToPrint", "PrintComplete"];
const GlobalTaxCalculationEnum = [
  "TaxExcluded",
  "TaxInclusive",
  "NotApplicable"
];
const LineDetailTypeEnum = ["TaxLineDetail", "AccountBasedExpenseLineDetail"];

const ExpenseSchema = new Schema(
  {
    Id: { type: String, unique: true },
    _id: String,
    Line: [
      {
        ItemBasedExpenseLine: {
          Id: String,
          ItemBasedExpenseLineDetail: {
            TaxInclusiveAmt: Number,
            ItemRef: {
              value: { type: String, ref: "task" },
              name: String
            },
            CustomerRef: {
              value: { type: String, ref: "client" },
              name: String
            },
            PriceLevelRef: {
              value: String,
              name: String
            },
            ClassRef: {
              value: { type: String, ref: "class" },
              name: String
            },
            TaxCodeRef: {
              value: String,
              name: String
            },
            MarkupInfo: {
              PriceLevelRef: {
                value: String,
                name: String
              },
              Percent: Number,
              MarkUpIncomeAccountRef: {
                value: String,
                name: String
              }
            },
            BillableStatus: {
              type: String,
              enum: BillableStatusEnum
            },
            Qty: Number,
            UnitPrice: Number
          },
          Amount: Number,
          DetailType: {
            type: String,
            enum: DetailType,
            default: "ItemBasedExpenseLineDetail"
          },
          Description: String,
          LineNum: Number
        },
        AccountBasedExpenseLine: {
          Id: String,
          DetailType: {
            type: String,
            enum: LineDetailTypeEnum,
            default: "AccountBasedExpenseLineDetail"
          },
          Amount: Number,
          AccountBasedExpenseLineDetail: {
            AccountRef: {
              value: { type: String, ref: "client" },
              name: String
            },
            TaxAmount: String,
            TaxInclusiveAmt: String,
            ClassRef: {
              value: { type: String, ref: "class" },
              name: String
            },
            TaxCodeRef: {
              value: String,
              name: String
            },
            MarkupInfo: {
              PriceLevelRef: {
                value: String,
                name: String
              },
              Percent: String,
              MarkUpIncomeAccountRef: {
                value: String,
                name: String
              }
            },
            BillableStatus: {
              type: String,
              enum: BillableStatusEnum
            },
            CustomerRef: {
              value: { type: String, ref: "client" },
              name: String
            }
          },
          Description: String,
          LineNum: Number
        }
      }
    ],
    PaymentType: { type: String, enum: PrintStatusEnum },
    AccountRef: {
      value: { type: String, ref: "client" },
      name: String
    },
    SyncToken: String,
    CurrencyRef: {
      value: String,
      name: String
    },
    TxnDate: String,
    PrintStatus: { type: String, enum: PaymentTypeEnum },
    RemitToAddr: {
      Id: String,
      PostalCode: String,
      City: String,
      Country: String,
      Line1: String,
      Line2: String,
      Line3: String,
      Line4: String,
      Line5: String,
      Lat: String,
      Long: String,
      CountrySubDivisionCode: String
    },
    TxnSource: String,
    GlobalTaxCalculation: { type: String, enum: GlobalTaxCalculationEnum },
    MetaData: {
      CreateTime: { type: Date, default: Date() },
      LastUpdatedTime: { type: Date, default: Date() }
    },
    DocNumber: String,
    PrivateNote: String,
    Credit: Boolean,
    TxnTaxDetail: {
      TxnTaxCodeRef: {
        value: String,
        name: String
      },
      TotalTax: Number,
      TaxLine: [
        {
          DetailType: { type: String, enum: LineDetailTypeEnum },
          TaxLineDetail: {
            TaxRateRef: {
              value: String,
              name: String
            },
            NetAmountTaxable: Number,
            PercentBased: Boolean,
            TaxInclusiveAmount: Number,
            OverrideDeltaAmount: Number,
            TaxPercent: Number
          },
          Amount: Number
        }
      ]
    },
    PaymentMethodRef: {
      value: String,
      name: String
    },
    PurchaseEx: String,
    ExchangeRate: Number,
    DepartmentRef: {
      value: String,
      name: String
    },
    EntityRef: {
      value: String,
      name: String
    },
    IncludeInAnnualTPAR: Boolean,
    TotalAmt: Number
  },
  { _id: false }
);

module.exports = mongoose.model("expense", ExpenseSchema, "expenses");
