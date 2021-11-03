const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaskListSchema = new Schema({
    isActive: { type: Boolean, default: true },
    task: String,
    subItem: String,
    type: String,
    account: String,
    description: String,
    isBillable: { type: Boolean, default: true },
    class: String,
    isTaxable: { type: Boolean, default: false },
    costRate: String,
    billRate: String
});

const ClassesListSchema = new Schema({
    isActive: { type: Boolean, default: true },
    class: String,
    subClass: String,
    addressLine1: String,
    addressLine2: String,
    state: String,
    zipCode: Number,
});

const ExpenseItemsListSchema = new Schema({
    isActive: { type: Boolean, default: false },
    account: String,
    subAccountOf: String,
    accountType: String,
    accountNo: String,
    spendLimit: String,
    class: String,
    isPerDay: { type: Boolean, default: false },
    isAllowExpense: { type: Boolean, default: false },
    isMustEnterQnRate: { type: Boolean, default: false },
    isLockRate: { type: Boolean, default: false },

    defaultRate: Number,
    vat: Number,
    attendeesOption: String,
    trackNonBillable: String,
    trackBillable: String
});


const VendorsListSchema = new Schema({
    isActive: { type: Boolean, default: false },
    name: String,
    group: String,
    salutation: String,
    faxNo: String,
    firstName: String,
    contactName: String,
    lastName: String,
    cellPhone: String,
    email: String,
    extension: String,
    companyName: String,
    website: String,
    hourlyRate: Number
});

module.exports = {
    TaskList: mongoose.model("task-list", TaskListSchema, "task-list"),
    ClassesList: mongoose.model("classes-list", ClassesListSchema, "classes-list"),
    ExpenseItemsList: mongoose.model("expense-items-list", ExpenseItemsListSchema, "expense-items-list"),
    VendorsList: mongoose.model("vendors-list", VendorsListSchema, "vendors-list"),
}
