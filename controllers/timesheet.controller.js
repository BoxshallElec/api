const TimeSheet = require("../models/timesheet.model");
const TimeSheetExtended = require("../models/timesheetExtended.model");
const Employee = require("../models/employee.model");
const EmployeeExtended = require("../models/employeeExtended.model");
const mongoose = require("mongoose");
const Intuit = require("./intuit.controller");
const config = require("config");
const { createVerify } = require("crypto");
const async = require("async");

exports.add = function (req, res) {
  const employeeId = req.body.userId;
  const StartTime = req.body.StartTime;
  const Hours = req.body.Hours;
  const clientId = req.body.clientId;
  const taskId = req.body.taskId;
  const classId = req.body.classId;
  const isBillable = req.body.isBillable;
  const Description = req.body.Description || "";
  const notes = req.body.notes;
  const images = req.body.images;
  const from = req.body.from || 0;
  const size = req.body.size || 10;
  var tesId;
  var employeeRef;
  var timesheetData;
  console.log("Stdate");
  console.log(StartTime);
  async.series(
    [
      function (cb) {
        if (employeeId) {
          EmployeeExtended.findOne(
            {
              employeeRef: employeeId,
            },
            function (err, data) {
              if (err) cb(err);
              else {
                if (data) {
                  employeeRef = data;
                }
                cb();
              }
            }
          );
        } else cb();
      },
      function (cb) {
        var data = {
          NameOf: "Employee",
          Hours: Hours,
          EmployeeRef: { value: employeeId },
          CustomerRef: { value: clientId },
          ClassRef: { value: classId },
          ItemRef: { value: taskId },
          Description: Description,
          BillableStatus: isBillable ? "Billable" : "NotBillable",
          status:"WithApprover",
          // status:
          //   employeeRef && employeeRef["approverId"]
          //     ? "WithApprover"
          //     : "WithEmployee",
          images: images,
          notes: notes,
          StartTime: StartTime ? StartTime : undefined,
          clientId: clientId,
        };
        
        const timeSheetExtended = new TimeSheetExtended(data);
        console.log(timeSheetExtended);
        timeSheetExtended.save({}, function (err, data) {
          if (err) cb(err);
          else {
            tesId = data["_id"];
            status = data["status"];
            cb();
          }
        });
      },
      function (cb) {
        TimeSheetExtended.aggregate(
          [
            {
              $match: {
                _id: tesId,
              },
            },
            {
              $lookup: {
                from: "tasks",
                localField: "ItemRef.value",
                foreignField: "_id",
                as: "task",
              },
            },
            {
              $lookup: {
                from: "clients",
                localField: "CustomerRef.value",
                foreignField: "_id",
                as: "client",
              },
            },
            {
              $lookup: {
                from: "classes",
                localField: "ClassRef.value",
                foreignField: "_id",
                as: "class",
              },
            },
            { $limit: size },
            { $skip: from },
          ],
          function (err, data) {
            if (err) cb(err.message);
            else {
              timesheetData = data[0];
              cb();
            }
          }
        );
      },
    ],
    function (err, data) {
      if (err) {
        return res.status(500).json({ success: false, message: err });
      } else {
        return res.status(200).json({
          success: true,
          message: "Timesheets Saved Successfully",
          data: timesheetData,
        });
      }
    }
  );
};
exports.draft = function (req, res) {
  const employeeId = req.body.userId;
  const StartTime = req.body.StartTime;
  const Hours = req.body.Hours;
  const clientId = req.body.clientId;
  const taskId = req.body.taskId;
  const classId = req.body.classId;
  const isBillable = req.body.isBillable;
  const Description = req.body.Description || "";
  const notes = req.body.notes;
  const images = req.body.images;
  const from = req.body.from || 0;
  const size = req.body.size || 10;
  var tesId;
  var employeeRef;
  var timesheetData;
  async.series(
    [
      function (cb) {
        if (employeeId) {
          EmployeeExtended.findOne(
            {
              employeeRef: employeeId,
            },
            function (err, data) {
              if (err) cb(err);
              else {
                if (data) {
                  employeeRef = data;
                }
                cb();
              }
            }
          );
        } else cb();
      },
      function (cb) {
        var data = {
          NameOf: "Employee",
          Hours: Hours,
          EmployeeRef: { value: employeeId },
          CustomerRef: { value: clientId },
          ClassRef: { value: classId },
          ItemRef: { value: taskId },
          Description: Description,
          BillableStatus: isBillable ? "Billable" : "NotBillable",
          status: "WithEmployee",
          images: images,
          notes: notes,
          StartTime: StartTime ? StartTime : undefined,
          clientId: clientId,
        };
        const timeSheetExtended = new TimeSheetExtended(data);
        timeSheetExtended.save({}, function (err, data) {
          if (err) cb(err);
          else {
            tesId = data["_id"];
            status = data["status"];
            cb();
          }
        });
      },
      function (cb) {
        TimeSheetExtended.aggregate(
          [
            {
              $match: {
                _id: tesId,
              },
            },
            {
              $lookup: {
                from: "tasks",
                localField: "ItemRef.value",
                foreignField: "_id",
                as: "task",
              },
            },
            {
              $lookup: {
                from: "clients",
                localField: "CustomerRef.value",
                foreignField: "_id",
                as: "client",
              },
            },
            {
              $lookup: {
                from: "classes",
                localField: "ClassRef.value",
                foreignField: "_id",
                as: "class",
              },
            },
            { $limit: size },
            { $skip: from },
          ],
          function (err, data) {
            if (err) cb(err.message);
            else {
              timesheetData = data[0];
              cb();
            }
          }
        );
      },
    ],
    function (err, data) {
      if (err) {
        return res.status(500).json({ success: false, message: err });
      } else {
        return res.status(200).json({
          success: true,
          message: "Timesheets Saved Successfully",
          data: timesheetData,
        });
      }
    }
  );
};
exports.edit = function (req, res) {
  const employeeId = req.body.userId;
  const StartTime = req.body.StartTime;
  const Hours = req.body.Hours;
  const clientId = req.body.clientId;
  const taskId = req.body.taskId;
  const classId = req.body.classId;
  const isBillable = req.body.isBillable;
  const Description = req.body.Description || "";
  const notes = req.body.notes;
  const images = req.body.images;
  const from = req.body.from || 0;
  const size = req.body.size || 10;
  const Id = req.body.objid;
  
  var tesId;
  var status;
  var timesheetData;
  // TimeSheetExtended.findByIdAndDelete({ _id: ObjectId($req.params.id) })
  // TimeSheetExtended.deleteOne({Hours: 12.345 })
  console.log("id");
  console.log(Id);
  var myquery = { _id: Id};
  var newvalues = { $set: {
    images:images,
    Hours:Hours,
    EmployeeRef: {value:employeeId},
    CustomerRef: {value:clientId},
    ItemRef:{value:taskId},
    Description: Description,
    BillableStatus:isBillable ? "Billable" : "NotBillable",
    status:"WithEmployee",
    notes:notes,
    StartTime:StartTime ? StartTime : undefined,
   }};
  TimeSheetExtended.updateOne(myquery, newvalues, function(err, obj) {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: error.message });
    } else {
      return res.status(200).json({
        success: true,
        message: "Timesheet Updated",
      });
    }
    
  });
};
exports.status = function (req, res) {
  const Id = req.body.id;
  
  var tesId;
  var status;
  var timesheetData;
  // TimeSheetExtended.findByIdAndDelete({ _id: ObjectId($req.params.id) })
  // TimeSheetExtended.deleteOne({Hours: 12.345 })
  var myquery = { _id: req.body.id };
  var newvalues = { $set: {status: "WithApprover" }};
  TimeSheetExtended.updateOne(myquery, newvalues, function(err, obj) {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: error.message });
    } else {
      return res.status(200).json({
        success: true,
        message: "Timesheet Updated",
      });
    }
    
  });
};

exports.sendTimesheetsToQB = function (req, res) {
  var timeExtendedSheets = req.body.timeSheetExtended;
  var qbo;
  if (timeExtendedSheets && timeExtendedSheets.length) {
    if (Intuit.getOAuth2TokenJson()) {
      qbo = Intuit.getQBOConnection();
      async.each(
        timeExtendedSheets,
        function (tes, cb) {
          if (
            tes &&
            (tes.status === "Approved" || tes.status === "WithEmployee")
          ) {
            const timeQBO = {
              NameOf: tes["NameOf"],
              Hours: tes["Hours"],
              EmployeeRef: tes["EmployeeRef"],
              CustomerRef: tes["CustomerRef"],
              ClassRef: tes["ClassRef"],
              ItemRef: tes["ItemRef"],
              Description: tes["Description"],
              BillableStatus: tes["BillableStatus"],
            };

            if (tes["StartTime"]) {
              timeQBO.StartTime = tes["StartTime"];
            }
            qbo.createTimeActivity(timeQBO, function (error, timeActivity) {
              if (error) {
                cb(error.Fault.Error[0].Message);
              }
              const timeSheet = new TimeSheet(timeActivity);
              timeSheet._id = timeActivity.Id;
              timeSheet.images = images;
              timeSheet.notes = notes;

              timeSheet
                .save()
                .then((result) => {
                  tes["timeSheetRef"] = timeActivity.Id;
                  TimeSheetExtended.findByIdAndUpdate(
                    tes["_id"],
                    tes,
                    function (teserror, data) {
                      cb();
                    }
                  );
                })
                .catch((error) => {
                  cb();
                });
            });
          } else cb();
        },
        function (err, data) {
          if (err) {
            return res
              .status(500)
              .json({ success: false, message: error.message });
          } else {
            return res.status(200).json({
              success: true,
              message: "Synced Timesheets with Quickbook successfully",
            });
          }
        }
      );
    } else {
      return res.status(200).json({
        success: false,
        message: "Quickbook connection failed!",
      });
    }
  }
};

exports.listByDate = function (req, res) {
  const from = req.body.from || 0;
  const size = req.body.size || 10;
  const userId = mongoose.Types.ObjectId(req.body.userId);

  TimeSheetSheetExtended.aggregate([
    {
      $match: {
        employee: userId,
      },
    },
    {
      $lookup: {
        from: "tasks",
        localField: "task",
        foreignField: "_id",
        as: "task",
      },
    },
    { $unwind: "$task" },
    {
      $lookup: {
        from: "clients",
        localField: "client",
        foreignField: "_id",
        as: "client",
      },
    },
    { $unwind: "$client" },
    {
      $lookup: {
        from: "classes",
        localField: "class",
        foreignField: "_id",
        as: "_class",
      },
    },
    { $unwind: "$_class" },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", StartTime: "$StartTime" } },
        timesheets: { $push: "$$ROOT" },
      },
    },
    { $limit: size },
    { $skip: from },
  ])
    .then((timesheets) => {
      return res.status(200).json({
        success: true,
        message: "Timesheets list fetched successfully",
        data: timesheets,
      });
    })
    .catch((error) => {
      return res.status(500).json({ success: false, message: error.message });
    });
};
exports.listByCompany = function (req, res) {
//   const from = req.body.from || 0;
  const size = req.body.size || 10;
  const customerref = req.body.customerref;
  const status = req.body.statusVal;
  // TimeSheetExtended.aggregate([
  //   {
  //     $match: {
  //       "CustomerRef.value": customerref,
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "tasks",
  //       localField: "ItemRef.value",
  //       foreignField: "_id",
  //       as: "task",
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "clients",
  //       localField: "EmployeeRef.value",
  //       foreignField: "_id",
  //       as: "client",
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "classes",
  //       localField: "ClassRef.value",
  //       foreignField: "_id",
  //       as: "class",
  //     },
  //   },
  //   { $limit: size },
  // ])
    TimeSheetExtended.find({ "CustomerRef.value": customerref, "status":status})
    .limit(size)
    .then((timesheets) => {
      TimeSheetExtended.countDocuments({ "CustomerRef.value": customerref , "status":status})
        .then((count) => {
          return res.status(200).json({
            success: true,
            message: "Timesheets list fetched successfully",
            data: timesheets,
            totalCount: count,
          });
        })
        .catch((error) => {
          return res
            .status(400)
            .json({ success: false, message: error.message });
        });
    })
    .catch((error) => {
      return res.status(500).json({ success: false, message: error.message });
    });
};
exports.listWithCount = function (req, res) {
  const from = req.body.from || 0;
  const size = req.body.size || 100;
  const userId = req.body.userId;
  TimeSheetExtended.aggregate([
    {
      $match: {
        "EmployeeRef.value": userId,
      },
    },
    {
      $lookup: {
        from: "tasks",
        localField: "ItemRef.value",
        foreignField: "_id",
        as: "task",
      },
    },
    {
      $lookup: {
        from: "clients",
        localField: "CustomerRef.value",
        foreignField: "_id",
        as: "client",
      },
    },
    {
      $lookup: {
        from: "classes",
        localField: "ClassRef.value",
        foreignField: "_id",
        as: "class",
      },
    },
    { $limit: size },
    { $skip: from },
  ])
    //TimeSheetExtended.find({ "EmployeeRef.value": userId })
    //.skip(from)
    //.limit(size)
    .then((timesheets) => {
      TimeSheetExtended.countDocuments({ "EmployeeRef.value": userId })
        .then((count) => {
          return res.status(200).json({
            success: true,
            message: "Timesheets list fetched successfully",
            data: timesheets,
            totalCount: count,
          });
        })
        .catch((error) => {
          return res
            .status(400)
            .json({ success: false, message: error.message });
        });
    })
    .catch((error) => {
      return res.status(500).json({ success: false, message: error.message });
    });
};

exports.list = function (req, res) {
  const from = req.body.from || 0;
  const size = req.body.size || 10;
  const userId = req.body.userId;

  TimeSheet.find({ EmployeeRef: { value: userId } })
    .sort([["createdAt", "-1"]])
    .skip(from)
    .limit(size)
    .then((timesheets) => {
      TimeSheet.countDocuments({ employee: userId })
        .then((count) => {
          return res.status(200).json({
            success: true,
            message: "Timesheets list fetched successfully",
            data: timesheets,
            totalCount: count,
          });
        })
        .catch((error) => {
          return res
            .status(400)
            .json({ success: false, message: error.message });
        });
    })
    .catch((error) => {
      return res.status(500).json({ success: false, message: error.message });
    });
};

exports.count = function (req, res) {
  TimeSheetExtended.find()
    .then((result) => {
      if (result && result.length) {
        var withEmployee = result.filter((res) => res.status == "WithEmployee");
        var withApprover = result.filter((res) => res.status == "WithApprover");
        var approved = result.filter((res) => res.status == "Approved");
        var archived = result.filter((res) => res.status == "Archived");
        var data = {
          WithEmployee: {
            count: withEmployee.length,
            totalHours: withEmployee.reduce(
              (total, res) => total + res["Hours"],
              0
            ),
          },
          WithApprover: {
            count: withApprover.length,
            totalHours: withApprover.reduce(
              (total, res) => total + res["Hours"],
              0
            ),
          },
          Approved: {
            count: approved.length,
            totalHours: approved.reduce(
              (total, res) => total + res["Hours"],
              0
            ),
          },
          Archived: {
            count: archived.length,
            totalHours: archived.reduce(
              (total, res) => total + res["Hours"],
              0
            ),
          },
        };
        return res.status(200).json({ success: true, data: data });
      } else
        res
          .status(200)
          .json({ success: true, message: "No timesheets found!" });
    })
    .catch((err) => {
      res.status(500).json({ success: true, message: err.message });
    });
};

exports.getTimesheets = function (req, res) {
  const status = req.body.status;
  var from = req.body.from || 0;
  var size = req.body.size || 10;
  TimeSheetExtended.aggregate([
    {
      $match: {
        status: status,
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "EmployeeRef.value",
        foreignField: "_id",
        as: "employee",
      },
    },
    {
      $lookup: {
        from: "tasks",
        localField: "ItemRef.value",
        foreignField: "_id",
        as: "task",
      },
    },
    {
      $lookup: {
        from: "clients",
        localField: "CustomerRef.value",
        foreignField: "_id",
        as: "client",
      },
    },
    {
      $lookup: {
        from: "classes",
        localField: "ClassRef.value",
        foreignField: "_id",
        as: "class",
      },
    },
    { $limit: size },
    { $skip: from },
  ])
    .then((result) => {
      if (result && result.length)
        res.status(200).json({ success: true, data: result });
      else {
        res
          .status(200)
          .json({ success: true, message: "No timesheets found!" });
      }
    })
    .catch((err) => {
      res.status(500).json({ success: true, message: err.message });
    });
};

exports.changeTimesheetsStatus = function (req, res) {
  var timeSheets = req.body.timeSheets;
  var status = req.body.status;
  var userId = req.body.userId;
  async.each(
    timeSheets,
    function (tes, cb) {
      TimeSheetExtended.findById(tes, function (err, data) {
        if (err) cb(err);
        else {
          if (data) {
            EmployeeExtended.findOne(
              {
                employeeRef: data.EmployeeRef,
              },
              function (error, employeeData) {
                if (err) cb(err);
                else {
                  if (employeeData) {
                    if (employeeData.approverId == userId) {
                      data["status"] = status;
                      TimeSheetExtended.findByIdAndUpdate(tes, data, function (
                        teserror,
                        tedata
                      ) {
                        if (teserror) cb(teserror.message);
                        else cb();
                      });
                    } else cb();
                  } else cb();
                }
              }
            );
          } else {
            cb();
          }
        }
      });
    },
    function (err, data) {
      if (err) res.status(500).json({ success: false, message: err });
      else
        res.status(200).json({
          success: true,
          data: timeSheets,
          message: "Changed the approval status",
        });
    }
  );
};
