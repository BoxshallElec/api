const Task = require("../models/task.model");
const Intuit = require("./intuit.controller");

exports.addTask = function (req, res) {
  Task.findOne({ Name: req.body.task })
    .then(result => {
      if (result) {
        return res
          .status(500)
          .json({ success: false, message: "Task already exists" });
      }

      const qbo = Intuit.getQBOConnection();

      var taskQBO = getTaskObj(req.body)

      if (qbo) {
        qbo.createItem(taskQBO, function (error, result) {
          if (error) {
            return res.status(500).json({
              success: false,
              message: error.Fault.Error[0].Message
            });
          }

          const newTask = new Task(result);

          newTask
            .save()
            .then(output => {
              return res.status(200).json({
                success: true,
                data: output,
                message: "task list added successfully"
              });
            })
            .catch(error => {
              return res
                .status(500)
                .json({ success: false, message: error.message });
            });
        });
      } else {
        return res.status(200).json({
          success: false,
          message: "No quickbook connection found"
        });
      }
    })
    .catch(error => {
      return res.status(500).json({ success: false, message: error.message });
    });
};

function getTaskObj(data) {
  let taskQBO = {
    Active: data.Active,
    Name: data.Name,
    Type: data.Type || "Service",
    Description: data.Description,
    PurchaseTaxIncluded: data.PurchaseTaxIncluded,
    Taxable: data.Taxable,
    PurchaseCost: data.PurchaseCost,
    UnitPrice: data.UnitPrice
  };

  if (data.ParentRef) {
    taskQBO.ParentRef = { value: data.ParentRef };
    taskQBO.SubItem = true;
  }

  if (data.ExpenseAccountRef) {
    taskQBO.ExpenseAccountRef = { value: data.ExpenseAccountRef };
  }

  if (data.ClassRef) {
    taskQBO.ClassRef = { value: data.ClassRef };
  }
  return taskQBO
}

exports.listTasks = function (req, res) {
  const from = req.body.from || 0;
  const size = req.body.size || 10;
  let query = {}
  switch (req.body.status) {
    case "not-active":
      query.Active = false;
      break;
    case "active":
      query.Active = true;
      break;
  }
  Task.find(query)
    .skip(from)
    .limit(size)
    .sort({ Id: -1 })
    .then(tasks => {
      return res.status(200).json({
        success: true,
        message: "tasks list fetched successfully",
        data: tasks
      });
    })
    .catch(error => {
      return res.status(500).json({ success: false, message: error.message });
    });
};

exports.updateTasks = function (req, res) {
  const qbo = Intuit.getQBOConnection();

  if (qbo) {
    delete req.body._id;
    var taskQBO = getTaskObj(req.body)
    qbo.updateItem(taskQBO, function (error, result) {
      if (error) {
        return res.status(500).json({
          success: false,
          message: error.Fault.Error[0].Message
        });
      }

      Task.findByIdAndUpdate({ Id: req.body.Id }, req.body)
        .then(result => {
          res.json({
            data: result,
            success: true,
            message: "Task updated successfully."
          });
        })
        .catch(error => {
          res.json({
            success: false,
            message: error.message
          });
        });
    });
  } else {
    return res.status(200).json({
      success: false,
      message: "No quickbook connection found"
    });
  }
};

exports.deleteTask = function (req, res) {
  Task.findByIdAndDelete({ Id: req.params.Id })
    .then(result => {
      res.json({
        success: true,
        message: "Task list deleted successfully."
      });
    })
    .catch(error => {
      res.json({
        success: false,
        message: error.message
      });
    });
};
