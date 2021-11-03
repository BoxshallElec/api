const { ClassesList, ExpenseItemsList, VendorsList } = require("../models/list-task.model");

exports.addExpenseItem = function (req, res) {
    const ExpenseItem = new ExpenseItemsList({
        isActive: req.body.isActive,
        account: req.body.account,
        subAccountOf: req.body.subAccountOf,
        accountType: req.body.accountType,
        accountNo: req.body.accountNo,
        spendLimit: req.body.spendLimit,
        class: req.body.class,
        isPerDay: req.body.isPerDay,
        isAllowExpense: req.body.isAllowExpense,
        isMustEnterQnRate: req.body.isMustEnterQnRate,
        defaultRate: req.body.defaultRate,
        isLockRate: req.body.isLockRate,
        vat: req.body.vat,
        attendeesOption: req.body.attendeesOption,
        trackNonBillable: req.body.trackNonBillable,
        trackBillable: req.body.trackBillable
    });

    ExpenseItem
        .save()
        .then(result => {
            return res.status(200).json({
                success: true,
                data: result,
                message: "expense item list added successfully"
            });
        })
        .catch(error => {
            return res.status(500).json({ success: false, message: error.message });
        });
};

exports.listExpenseItem = function (req, res) {
    const from = req.body.from || 0;
    const size = req.body.size || 10;
    let q = {};
    if (req.body.status) {
        switch (req.body.status) {
            case "active":
                q.isAllowExpense = true;
                break;
            case "not-active":
                q.isAllowExpense = false
                break
        }
    }
    ExpenseItemsList.find(q)
        .skip(from)
        .limit(size)
        .sort({ _id: -1 })
        .then(expenseItems => {
            return res.status(200).json({
                success: true,
                message: "expense items list fetched successfully",
                data: expenseItems
            });
        })
        .catch(error => {
            return res.status(500).json({ success: false, message: error.message });
        });
};

exports.updateExpenseItem = function (req, res) {
    ExpenseItemsList.findByIdAndUpdate({ _id: req.body._id }, req.body)
        .then(result => {
            res.json({
                data: result,
                success: true,
                message: "Expense item list updated successfully."
            });
        })
        .catch(error => {
            res.json({
                success: false,
                message: error.message
            });
        });
};

exports.deleteExpenseItem = function (req, res) {
    ExpenseItemsList.findByIdAndDelete({ _id: req.params.expenseItemId })
        .then(result => {
            res.json({
                success: true,
                message: "Expense Item list deleted successfully."
            });
        })
        .catch(error => {
            res.json({
                success: false,
                message: error.message
            });
        });
};

exports.addVendorItem = function (req, res) {
    const VendorItem = new VendorsList({
        isActive: req.body.isActive,
        name: req.body.name,
        group: req.body.group,
        salutation: req.body.salutation,
        faxNo: req.body.faxNo,
        firstName: req.body.firstName,
        contactName: req.body.contactName,
        lastName: req.body.lastName,
        cellPhone: req.body.cellPhone,
        email: req.body.email,
        extension: req.body.extension,
        companyName: req.body.companyName,
        website: req.body.website,
        hourlyRate: req.body.hourlyRate,
    });

    VendorItem
        .save()
        .then(result => {
            return res.status(200).json({
                success: true,
                data: result,
                message: "vendor item list added successfully"
            });
        })
        .catch(error => {
            return res.status(500).json({ success: false, message: error.message });
        });
};

exports.listVendorItems = function (req, res) {
    const from = req.body.from || 0;
    const size = req.body.size || 10;
    let q = {};
    if (req.body.status) {
        switch (req.body.status) {
            case "active":
                q.isActive = true;
                break;
            case "not-active":
                q.isActive = false
                break
        }
    }
    VendorsList.find(q)
        .skip(from)
        .limit(size)
        .sort({ _id: -1 })
        .then(vendors => {
            return res.status(200).json({
                success: true,
                message: "vendors list fetched successfully",
                data: vendors
            });
        })
        .catch(error => {
            return res.status(500).json({ success: false, message: error.message });
        });
};

exports.updateVendorItem = function (req, res) {
    VendorsList.findByIdAndUpdate({ _id: req.body._id }, req.body)
        .then(result => {
            res.json({
                data: result,
                success: true,
                message: "vendor item list updated successfully."
            });
        })
        .catch(error => {
            res.json({
                success: false,
                message: error.message
            });
        });
};

exports.deleteVendorItem = function (req, res) {
    VendorsList.findByIdAndDelete({ _id: req.params.vendorId })
        .then(result => {
            res.json({
                success: true,
                message: "vendor deleted successfully."
            });
        })
        .catch(error => {
            res.json({
                success: false,
                message: error.message
            });
        });
};