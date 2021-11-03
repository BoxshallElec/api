const Class = require("../models/class.model");
const Intuit = require("./intuit.controller");

exports.add = function (req, res) {
  Class.findOne({ Name: req.body.Name })
    .then(result => {
      if (result) {
        return res
          .status(500)
          .json({ success: false, message: "Class already exists" });
      }

      const qbo = Intuit.getQBOConnection();

      const classQBO = {
        Active: req.body.Active,
        Name: req.body.Name
      };

      if (req.body.ParentRef) {
        classQBO.ParentRef = { value: req.body.ParentRef };
        classQBO.SubClass = true;
      }

      if (qbo) {
        qbo.createClass(classQBO, function (error, result) {
          if (error) {
            return res.status(500).json({
              success: false,
              message: error.Fault.Error[0].Message
            });
          }

          const newClass = new Class(result);
          newClass._id = result.Id;

          newClass
            .save()
            .then(output => {
              return res.status(200).json({
                success: true,
                data: output,
                message: "Class added successfully"
              });
            })
            .catch(error => {
              return res
                .status(500)
                .json({ success: false, message: error.message });
            });
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "No quickbook connection found"
        });
      }
    })
    .catch(error => {
      return res.status(500).json({ success: false, message: error.message });
    });
};

exports.list = function (req, res) {
  let query = {}
  switch (req.body.status) {
    case "not-active":
      query.Active = false;
      break;
    case "active":
      query.Active = true;
      break;
  }
  Class.find(query)
    .then(result => {
      return res.status(200).json({
        success: true,
        message: "Classes list fetched successfully",
        data: result
      });
    })
    .catch(error => {
      return res.status(500).json({ success: false, message: error.message });
    });
};

exports.update = function (req, res) {
  const qbo = Intuit.getQBOConnection();

  delete req.body._id;

  if (qbo) {
    qbo.updateClass(req.body, function (error, result) {
      if (error) {
        return res.status(500).json({
          success: false,
          message: error.Fault.Error[0].Message
        });
      }

      Class.findByIdAndUpdate(result.Id, req.body)
        .then(_class => {
          return res.status(200).json({
            success: true,
            data: _class,
            message: "Class added successfully"
          });
        })
        .catch(error => {
          return res
            .status(500)
            .json({ success: false, message: error.message });
        });
    });
  } else {
    return res.status(500).json({
      success: false,
      message: "No quickbook connection found"
    });
  }
};

exports.delete = function (req, res) {
  const qbo = Intuit.getQBOConnection();

  if (qbo) {
    qbo.updateClass({ Active: false, Id: req.params.classId }, function (
      error,
      result
    ) {
      if (error) {
        return res.status(500).json({
          success: false,
          message: error.Fault.Error[0].Message
        });
      }

      Class.findByIdAndUpdate(result.Id, { Active: false })
        .then(_class => {
          return res.status(200).json({
            success: true,
            data: _class,
            message: "Class added successfully"
          });
        })
        .catch(error => {
          return res
            .status(500)
            .json({ success: false, message: error.message });
        });
    });
  } else {
    return res.status(500).json({
      success: false,
      message: "No quick book connection found"
    });
  }
};
