const Expenses = require("../models/expenses.model");
const Intuit = require("./intuit.controller");

exports.addExpense = function(req, res) {
  const expense = new Expenses({
    employee: req.body.userId,
    reportDate: req.body.reportDate,
    reason: req.body.reason,
    expensesList: req.body.expensesList
  });
  console.log(req.body);

  expense
    .save()
    .then(result => {
      return res.status(200).json({
        success: true,
        data: result,
        message: "Expenses added successfully"
      });
    })
    .catch(error => {
      return res.status(500).json({ success: false, message: error.message });
    });
};

exports.add = function(req, res) {
  if (Intuit.getOAuth2TokenJson()) {
    var qbo = Intuit.getQBOConnection();

    const expense = {
      PaymentType: req.body.PaymentType, //One of Cash, Check, or CreditCard
      AccountRef: {
        value: req.body.userId
      },
      Line: req.body.Line // Arry of this object { "DetailType": "AccountBasedExpenseLineDetail", "Amount": 10.0, "AccountBasedExpenseLineDetail": { "AccountRef": { "name": "Meals and Entertainment", "value": "13" } } }
    };

    qbo.createPurchase(expense, function(error, purchase) {
      if (error) {
        return res.status(500).json({
          success: false,
          message: error.Fault.Error[0].Message
        });
      }

      const newExpense = new Expenses(purchase);
      newExpense._id = purchase.Id;

      newExpense
        .save()
        .then(result => {
          return res.status(200).json({
            success: true,
            data: result,
            message: "Expense added successfully"
          });
        })
        .catch(error => {
          return res
            .status(500)
            .json({ success: false, message: error.message });
        });
    });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "No quickbook connection found" });
  }
};

exports.list = function(req, res) {
  const from = req.body.from || 0;
  const size = req.body.size || 10;
  // expensesList: { $elemMatch: { status: "on-hold" } }
  Expenses.find({})
    .skip(from)
    .limit(size)
    .sort({ _id: -1 })
    .then(expenses => {
      return res.status(200).json({
        success: true,
        message: "expenses list fetched successfully",
        data: expenses
      });
    })
    .catch(error => {
      return res.status(500).json({ success: false, message: error.message });
    });
};

exports.expensesForAdmin = function(req, res) {
  const from = req.body.from || 0;
  const size = req.body.size || 10;
  let query = {};
  let data = req.body;
  if (data.status) {
    query.status = data.status;
  }
  // expensesList: { $elemMatch: { status: "on-hold" } }
  Expenses.find({ expensesList: { $elemMatch: query } })
    .skip(from)
    .limit(size)
    .then(expenses => {
      return res.status(200).json({
        success: true,
        message: "expenses list fetched successfully",
        data: expenses
      });
    })
    .catch(error => {
      return res.status(500).json({ success: false, message: error.message });
    });
};

exports.expensesCountForAdmin = function(req, res) {
  Expenses.aggregate([
    { $unwind: "$expensesList" },
    {
      $group: {
        _id: "$expensesList.status",
        totalAmount: { $sum: "$expensesList.amount" },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        status: "$_id",
        totalAmount: "$totalAmount",
        count: "$count"
      }
    }
  ])
    .then(expenses => {
      return res.status(200).json({
        success: true,
        message: "expenses list fetched successfully",
        data: expenses
      });
    })
    .catch(error => {
      return res.status(500).json({ success: false, message: error.message });
    });
};

exports.update = function(req, res) {
  Expenses.findByIdAndUpdate({ _id: req.body.data._id }, req.body.data)
    .then(result => {
      res.json({
        data: result,
        success: true,
        message: "Expenses updated successfully."
      });
    })
    .catch(error => {
      res.json({
        success: false,
        message: error.message
      });
    });
};

exports.delete = function(req, res) {
  Expenses.findByIdAndDelete({ _id: req.params.id })
    .then(result => {
      res.json({
        success: true,
        message: "Expenses deleted successfully."
      });
    })
    .catch(error => {
      res.json({
        success: false,
        message: error.message
      });
    });
};
