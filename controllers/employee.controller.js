const Employee = require("../models/employee.model");
const linkEmp = require("../models/linkemployee.model");
const nodemailer = require("nodemailer");
const Client = require("../models/client.model");
const Task = require("../models/task.model");
const Class = require("../models/class.model");
const config = require("config");
const secret = config.get("secret");
const verification = config.get("verification");
const jwt = require("jsonwebtoken");
const generator = require("generate-password");
const Intuit = require("./intuit.controller");
const QuickBooks = require("node-quickbooks");
const intuit_config = config.get("intuit-config");
const EmployeeExtended = require("../models/employeeExtended.model");
const async = require("async");
const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com", // hostname
  secureConnection: false, // TLS requires secureConnection to be false
  port: 587, // port for secure SMTP
  tls: {
     ciphers:'SSLv3'
  },
  auth: {
      user: 'shwetha@boxshallelec.com',
      pass: 'Boxshall@123'
  }
});

// setup e-mail data, even with unicode symbols

exports.register = function (req, res) {
  console.log("Try registering");
  Employee.findOne({ email: req.body.email })
    .then((employee) => {
      if (employee) {
        console.log("Email");
        return res.status(500).json({
          success: false,
          message:
            "The email address you have entered is already associated with another account.",
          
        });
      }
      else{
        console.log("Email works");
      }

      var password = generator.generate({
        length: 10,
        numbers: true,
        symbols: true,
      });

      var displayName = req.body.FirstName + " " + req.body.FamilyName;
      console.log(displayName);
      if (employee && employee.DisplayName === displayName) {
        return res.status(500).json({
          success: false,
          message: "First and Last name already exist",
        });
      }
      else{
        console.log("display name works");
      }

      if (req.body.Title) {
        displayName = req.body.Title + ". " + displayName;
      }

      // if (employee && employee.DisplayName === displayName) {
      //   return res.status(200).json({
      //     success: false,
      //     message: "First and Last name already exist",
      //   });
      // }
      console.log("RE");
      console.log(req.url);
      console.log("Before QBO");
      const qbo = Intuit.getQBOConnection();
      // console.log("Callback check");
      // const qbo = Intuit.authUri();
      console.log("qbo");
      // console.log(Intuit.webhooks);
      console.log(qbo);
      if (qbo) {
        const givenName = req.body.FirstName + " " + req.body.FamilyName;

        const qboEmployee = {
          PrimaryAddr: {
            Country: "Australia",
            CountrySubDivisionCode: req.body.CountrySubDivisionCode,
            City: req.body.City,
            PostalCode: req.body.PostalCode,
            Line1: req.body.Line1,
          },
          PrimaryEmailAddr: { Address: req.body.email },
          DisplayName: displayName,
          Title: req.body.Title || "",
          BillableTime: true,
          GivenName: givenName,
          PrimaryPhone: { FreeFormNumber: req.body.PrimaryPhone },
          Active: true,
          Mobile: { FreeFormNumber: req.body.PrimaryPhone },
          PrintOnCheckName: displayName,
          FamilyName: req.body.FamilyName,
        };

        if (req.body.birthDate) {
          qboEmployee.BirthDate = req.body.birthDate;
        }

        if (req.body.Gender) {
          qboEmployee.Gender = req.body.Gender;
        }

        if (req.body.BillRate) {
          qboEmployee.BillRate = req.body.BillRate;
        }

        if (req.body.EmployeeNumber) {
          qboEmployee.EmployeeNumber = req.body.EmployeeNumber;
        }

        if (req.body.HiredDate) {
          qboEmployee.HiredDate = req.body.HiredDate;
        }

        if (req.body.ReleasedDate) {
          qboEmployee.ReleasedDate = req.body.ReleasedDate;
        }

        qbo.createEmployee(qboEmployee, function (error, result) {
          console.log("Trying to create");
          if (error) {
            console.log(error);
            return res.status(500).json({
              success: false,
              message: error,
            });
          }

          const newEmployee = new Employee(result);
          newEmployee.email = newEmployee.PrimaryEmailAddr.Address;
          newEmployee.password = password;
          newEmployee._id = result.Id;
          var mailOptions = {
            from: "shwetha@boxshallelec.com",
              to: newEmployee.email,
              subject: "Boxshall Electrical account details",
              html:
                "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'> <html xmlns='http://www.w3.org/1999/xhtml'> <head> <meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /> <title>Boxshall Electrical Account Details</title> <meta name='viewport' content='width=device-width, initial-scale=1.0' /> <style> button { display: inline-block; border: none; padding: 1rem 2rem; margin: 0; text-decoration: none; background: #e67e22; color: #ffffff; font-family: sans-serif; font-size: 1rem; cursor: pointer; border-radius: 6px; text-align: center; transition: background 250ms ease-in-out, transform 150ms ease; -webkit-appearance: none; -moz-appearance: none; } button:hover, button:focus { background: #d35400; } button:focus { outline: 1px solid #fff; outline-offset: -4px; } button:active { transform: scale(0.99); } </style> </head> <body style='background: #ecf0f1'> <table align='center' border='0' cellpadding='20' cellspacing='20' width='600' style='border-collapse: collapse;background: #fff;border-radius: 6px'> <tr> <td style='color: #153643; font-family: Arial, sans-serif; font-size: 16px; padding-top: 24px;padding-bottom: 24px'> <b>Boxshall Electrical</b> </td> </tr> <tr> <td style='color: #153643; font-family: Arial, sans-serif; font-size: 30px; line-height: 20px;padding-bottom: 24px'> <b>Your login details</b> </td> </tr>" +
                "<tr> <td style='color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;padding-bottom: 24px'> Email : <b>" +
                newEmployee.email +
                "</b></td></tr>" +
                "<tr> <td style='color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;padding-bottom: 24px'> Password : <b>" +
                newEmployee.password +
                "</b></td></tr>" +
                "<tr><td style='color: #9e9e9e; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;padding-bottom: 24px'> Hi {{username}}, Use above email and password to start using Boxshall Electrical. </td> </tr> <tr> <td align='center' style='color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;padding-bottom: 24px'> <button><a href='{{link}}' style='color:white;text-decoration: none'>Login</a></button> </td> </tr> <td bgcolor='#e67e22' style='padding: 30px 30px 30px 30px;border-bottom-left-radius: 6px;border-bottom-right-radius: 6px'> <table border='0' cellpadding='0' cellspacing='0' width='100%'> <tr> <td width='75%' style='color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;'> Copyright © 2019, Boxshall Electrical. All Rights Reserved </td> <td align='right'> <table border='0' cellpadding='0' cellspacing='0'> <tr> <td> <a href='http://www.twitter.com/'> <img src='https://www.iconsdb.com/icons/preview/white/twitter-xxl.png' alt='Twitter' width='38' height='38' style='display: block;' border='0' /> </a> </td> <td style='font-size: 0; line-height: 0;' width='20'>&nbsp;</td> <td> <a href='http://www.facebook.com/'> <img src='https://www.iconsdb.com/icons/preview/white/facebook-3-xxl.png' alt='Facebook' width='38' height='38' style='display: block;' border='0' /> </a> </td> </tr> </table> </td> </tr> </table> </td> </table> </body> </html>"
                  .replace("{{username}}", newEmployee.DisplayName)
                  .replace("{{link}}", "google.com"),
          };
          newEmployee
            .save()
            .then((output) => {
              console.log("SV");
              return transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    return console.log(error);
                }
            
                console.log('Message sent: ' + info.response);
            });
            })
            .catch((error) => {
              reject(error);
            });
        });
        // let id = "700";
        // qbo.getEmployee(id, function(error, result){
        //   console.log(result);
        //   return res.json({
        //     success: true,
        //     message: "verified ID successfully.",
        //     data: result,
        //   });
        // });
      } else {
        return res.status(200).json({
          success: false,
          message: "No quickbook connection found",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({ success: false, message: error.message });
    });
};

exports.login = function (req, res) {
  Employee.findOne({ email: req.body.email })
    .then((employee) => {
      if (!employee) {
        return res.status(401).json({
          success: true,
          message:
            "The email address " +
            req.body.email +
            " is not associated with any account. Double-check your email address and try again.",
        });
      }

      employee.comparePassword(req.body.password, function (error, isMatch) {
        if (error) {
          return res
            .status(500)
            .json({ success: false, message: error.message });
        }

        // if (!isMatch) {
        //   return res
        //     .status(401)
        //     .json({ success: false, message: "Invalid email or password" });
        // }

        const payload = {
          userId: employee.Id,
        };

        var token = jwt.sign(payload, secret);

        res.json({
          success: true,
          message: "Access token generation successfull.",
          token: token,
          employee: employee,
        });
      });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    });
};

exports.list = function (req, res) {
  const from = req.body.from || 0;
  const size = req.body.size || 100;
  var employeeData;
  var result = [];
  async.series(
    [
      function (cb) {
        Employee.find({})
          .skip(from)
          .limit(size)
          .sort({ Id: -1 })
          .then((employees) => {
            if (employees && employees.length) {
              employeeData = employees;
              cb();
            }
          })
          .catch((error) => {
            cb(error.message);
          });
      },
      function (cb) {
        if (employeeData) {
          async.each(
            employeeData,
            function (emp, clbk) {
              if (emp) {
                EmployeeExtended.findOne(
                  {
                    employeeRef: emp._id,
                  },
                  function (err, data) {
                    result.push({
                      FirstName: emp.FirstName,
                      FamilyName: emp.FamilyName,
                      Title: emp.Title,
                      PrimaryPhone: emp.PrimaryPhone,
                      PrimaryAddr: emp.PrimaryAddr,
                      email: emp.email,
                      type:emp.type,
                      active:emp.Active,
                      HiredDate: emp.HiredDate,
                      ReleasedDate: emp.ReleasedDate,
                      _id: emp._id,
                      employeeExtended: data
                        ? {
                            approverId: data.approverId,
                            employeeRef: data.employeeRef,
                          }
                        : "",
                      DisplayName: emp.DisplayName,
                    });
                    clbk();
                  }
                );
              }
            },
            function (err) {
              cb();
            }
          );
        }
      },
    ],
    function (err, data) {
      if (err) {
        return res.status(500).json({ success: false, message: err });
      } else {
        return res.status(200).json({
          success: true,
          message: "Employee list fetched successfully",
          data: result,
        });
      }
    }
  );
};

exports.categories = function (req, res) {
  const clientPromise = new Promise((resolve, reject) => {
    Client.find({ Active: true })
      .then((clients) => {
        resolve(clients);
      })
      .catch((error) => {
        reject(error);
      });
  });

  const taskPromise = new Promise((resolve, reject) => {
    Task.find({ Active: true })
      .then((tasks) => {
        resolve(tasks);
      })
      .catch((error) => {
        reject(error);
      });
  });

  const classPromise = new Promise((resolve, reject) => {
    Class.find({ Active: true })
      .then((classes) => {
        resolve(classes);
      })
      .catch((error) => {
        reject(error);
      });
  });

  Promise.all([clientPromise, taskPromise, classPromise])
    .then(([clients, tasks, classes]) => {
      res.status(200).json({
        success: true,
        clients: clients,
        tasks: tasks,
        classes: classes,
        message: "Categories fetched successfully",
      });
    })
    .catch((error) => {
      res.status(500).json({ success: false, message: error.message });
    });
};

exports.updateFirstTime = function (req, res) {
  const employeeId = req.body.userId;

  Employee.findById(employeeId)
    .then((employee) => {
      if (!employee) {
        res.status(500).json({ success: false, message: "Employee not found" });
      }

      employee.comparePassword(req.body.password, function (error, isMatch) {
        if (error) {
          return res
            .status(500)
            .json({ success: false, message: error.message });
        }

        if (!isMatch) {
          return res
            .status(401)
            .json({ success: false, message: "Invalid email or password" });
        }

        employee
          .updateFirstTime()
          .then((result) => {
            const payload = {
              userId: employee.Id,
            };

            var token = jwt.sign(payload, secret);

            res.json({
              success: true,
              message: "Access token generation successfull.",
              token: token,
            });
          })
          .catch((error) => {
            return res
              .status(500)
              .json({ success: false, message: "Invalid email or password" });
          });
      });
    })
    .catch((error) => {
      res.status(500).json({ success: false, message: error.message });
    });
};

exports.changePassword = function (req, res) {
  const employeeId = req.body.userId;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.password;

  Employee.findById(employeeId)
    .then((employee) => {
      if (!employee) {
        res.status(500).json({ success: false, message: "Employee not found" });
      }

      employee.comparePassword(oldPassword, function (error, isMatch) {
        if (error) {
          return res
            .status(500)
            .json({ success: false, message: error.message });
        }

        // if (!isMatch) {
        //   return res
        //     .status(401)
        //     .json({ success: false, message: "Invalid email or password" });
        // }

        employee
          .changePassword(newPassword)
          .then((result) => {
            const payload = {
              userId: employee.Id,
            };

            var token = jwt.sign(payload, secret);

            res.json({
              success: true,
              message: "Access token generation successfull.",
              token: token,
            });
          })
          .catch((error) => {
            return res
              .status(500)
              .json({ success: false, message: "Invalid email or password" });
          });
      });
    })
    .catch((error) => {
      res.status(500).json({ success: false, message: error.message });
    });
};

sendVerificationMail = function (employee, password, req, res) {
  console.log("HELLOSV");
  var username = employee.DisplayName;

  var link = "http://" + req.headers.host;
  console.log(link);
  var transporter = nodemailer.createTransport({
    host: "webcloud64.au.syrahost.com",
    port: 465,
    secure: true,
    auth: {
      user: verification.email,
      pass: verification.password,
    },
  });
  console.log("Send Verrifcation");
  var mailOptions = {
    from: "noreply@boxshallelec.com",
    to: employee.email,
    subject: "Boxshall Electrical account details",
    html:
      "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'> <html xmlns='http://www.w3.org/1999/xhtml'> <head> <meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /> <title>Boxshall Electrical Account Details</title> <meta name='viewport' content='width=device-width, initial-scale=1.0' /> <style> button { display: inline-block; border: none; padding: 1rem 2rem; margin: 0; text-decoration: none; background: #e67e22; color: #ffffff; font-family: sans-serif; font-size: 1rem; cursor: pointer; border-radius: 6px; text-align: center; transition: background 250ms ease-in-out, transform 150ms ease; -webkit-appearance: none; -moz-appearance: none; } button:hover, button:focus { background: #d35400; } button:focus { outline: 1px solid #fff; outline-offset: -4px; } button:active { transform: scale(0.99); } </style> </head> <body style='background: #ecf0f1'> <table align='center' border='0' cellpadding='20' cellspacing='20' width='600' style='border-collapse: collapse;background: #fff;border-radius: 6px'> <tr> <td style='color: #153643; font-family: Arial, sans-serif; font-size: 16px; padding-top: 24px;padding-bottom: 24px'> <b>Boxshall Electrical</b> </td> </tr> <tr> <td style='color: #153643; font-family: Arial, sans-serif; font-size: 30px; line-height: 20px;padding-bottom: 24px'> <b>Your login details</b> </td> </tr>" +
      "<tr> <td style='color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;padding-bottom: 24px'> Email : <b>" +
      employee.email +
      "</b></td></tr>" +
      "<tr> <td style='color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;padding-bottom: 24px'> Password : <b>" +
      password +
      "</b></td></tr>" +
      "<tr><td style='color: #9e9e9e; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;padding-bottom: 24px'> Hi {{username}}, Use above email and password to start using Boxshall Electrical. </td> </tr> <tr> <td align='center' style='color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;padding-bottom: 24px'> <button><a href='{{link}}' style='color:white;text-decoration: none'>Login</a></button> </td> </tr> <td bgcolor='#e67e22' style='padding: 30px 30px 30px 30px;border-bottom-left-radius: 6px;border-bottom-right-radius: 6px'> <table border='0' cellpadding='0' cellspacing='0' width='100%'> <tr> <td width='75%' style='color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;'> Copyright © 2019, Boxshall Electrical. All Rights Reserved </td> <td align='right'> <table border='0' cellpadding='0' cellspacing='0'> <tr> <td> <a href='http://www.twitter.com/'> <img src='https://www.iconsdb.com/icons/preview/white/twitter-xxl.png' alt='Twitter' width='38' height='38' style='display: block;' border='0' /> </a> </td> <td style='font-size: 0; line-height: 0;' width='20'>&nbsp;</td> <td> <a href='http://www.facebook.com/'> <img src='https://www.iconsdb.com/icons/preview/white/facebook-3-xxl.png' alt='Facebook' width='38' height='38' style='display: block;' border='0' /> </a> </td> </tr> </table> </td> </tr> </table> </td> </table> </body> </html>"
        .replace("{{username}}", username)
        .replace("{{link}}", link),
  };

  transporter
    .sendMail(mailOptions)
    .then((result) => {
      res.status(200).json({
        success: true,
        message:
          "A verification email has been sent to " + employee.email + ".",
      });
    })
    .catch((error) => {
      return res.status(500).json({ success: false, message: error.message });
    });
};

exports.setApprover = function (req, res) {
  const employeeId = req.body.employeeId;
  const approverId = req.body.approverId;
  var employeeExtended;
  async.series(
    [
      function (cb) {
        EmployeeExtended.findOne(
          {
            employeeRef: employeeId,
          },
          function (err, data) {
            if (err) cb(err);
            else {
              if (data) {
                employeeExtended = data;
                cb();
              } else {
                cb();
              }
            }
          }
        );
      },
      function (cb) {
        if (employeeExtended) {
          employeeExtended["approverId"] = approverId;
          EmployeeExtended.findOneAndUpdate(
            {
              employeeRef: employeeId,
            },
            employeeExtended,
            function (err, data) {
              if (err) cb(err);
              else {
                cb();
              }
            }
          );
        } else {
          var employeeExtended = new EmployeeExtended({
            employeeRef: employeeId,
            approverId: approverId,
          });
          employeeExtended
            .save()
            .then((data) => {
              cb();
            })
            .catch((err) => cb(err));
        }
      },
    ],
    function (err, data) {
      if (err) {
        res.status(500).json({
          success: true,
          message: "Failed to change the approver! ",
        });
      } else {
        res.status(200).json({
          success: true,
          message: "Changed the approver! ",
        });
      }
    }
  );
};

exports.getApprover = function (req, res) {

  const employeeId = req.body.selectedUser;
  const size = req.body.size || 100;
  EmployeeExtended.find({ "employeeRef": employeeId})
    .limit(size)
    .then((employee) => {
      console.log("EmployeeUser");
      console.log(employee);
      EmployeeExtended.countDocuments({ "employeeRef": employeeId})
        .then((count) => {
          console.log("Inside extend");
          return res.status(200).json({

            success: true,
            message: "Employee Approver list fetched successfully",
            data: employee,
            totalCount: count,
          });
        })
        .catch((error) => {
          return "res"
            .status(400)
            .json({ success: false, message: error.message });
        });
    })
    .catch((error) => {
      return res.status(500).json({ success: false, message: error.message });
    });

};
exports.getAllEmployeesQBO = function(req, res){
  const qbo = Intuit.getQBOConnection();
  qbo.findEmployees( function (error, result) {
    console.log("Trying to retrieve");
    if (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error,
      });
    }
    else{
      console.log(result);
      return res.status(200).json({

        success: true,
        message: "Employee list fetched successfully",
        data: result,
      });
    }
  });
};
exports.getTaxQBO = function(req, res){
  console.log("GetTax");
  const qbo = Intuit.getQBOConnection();
  qbo.findAccounts( function (error, result) {
    console.log("Trying to retrieve");
    if (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error,
      });
    }
    else{
      console.log(result);
      return res.status(200).json({

        success: true,
        message: "Employee list fetched successfully",
        data: result,
      });
    }
  });
};
exports.linkEmployee = function(req,res){
  console.log(req.body.linkedEmployeeId);
  console.log(req.body.hourlyRate);
  const linkEmployees = new linkEmp(req.body);
          linkEmployees.name = req.body.linkEmployeeId;
          linkEmployees.mongoid = req.body.linkUserId;
          linkEmployees.rate = req.body.hourlyRate;
          linkEmployees.tax = req.body.taxRequired;
          linkEmployees.taxType= req.body.taxType;
          linkEmployees.superRequired = req.body.superRequired;
          linkEmployees.superPercentage=req.body.superPercentage,
          linkEmployees.superBase= req.body.superBase; 
          linkEmployees.superPayable = req.body.superPayable;
          linkEmployees
            .save()
            .then((output) => {
              // return null;
              return res.status(200).json({

                success: true,
                message: "Employee list fetched successfully",
                data: output,
            });
            })
            .catch((error) => {
              console.log(error);
            });
};

exports.listDetails = function (req, res) {

const from = req.body.from || 0;
    const size = req.body.size || 10;
    let q = {};
    
    linkEmp.find(q)
        .skip(from)
        .limit(size)
        .sort({ _id: -1 })
        .then(emp => {
            return res.status(200).json({
                success: true,
                message: "employee items list fetched successfully",
                data: emp
            });
        })
        .catch(error => {
            return res.status(500).json({ success: false, message: error.message });
        });
      }
//inkEmployee = function(req, res){
//   const qbo = Intuit.getQBOConnection();
//   qbo.createEmployee(qboEmployee, function (error, result) {
//     console.log("Trying to create");
//     if (error) {
//       console.log(error);
//       return res.status(500).json({
//         success: false,
//         message: error,
//       });
//     }

//     const newEmployee = new Employee(result);
//     newEmployee.email = newEmployee.PrimaryEmailAddr.Address;
//     newEmployee.password = password;
//     newEmployee._id = result.Id;
//     var mailOptions = {
//       from: "shwetha@boxshallelec.com",
//         to: newEmployee.email,
//         subject: "Boxshall Electrical account details",
//         html:
//           "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'> <html xmlns='http://www.w3.org/1999/xhtml'> <head> <meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /> <title>Boxshall Electrical Account Details</title> <meta name='viewport' content='width=device-width, initial-scale=1.0' /> <style> button { display: inline-block; border: none; padding: 1rem 2rem; margin: 0; text-decoration: none; background: #e67e22; color: #ffffff; font-family: sans-serif; font-size: 1rem; cursor: pointer; border-radius: 6px; text-align: center; transition: background 250ms ease-in-out, transform 150ms ease; -webkit-appearance: none; -moz-appearance: none; } button:hover, button:focus { background: #d35400; } button:focus { outline: 1px solid #fff; outline-offset: -4px; } button:active { transform: scale(0.99); } </style> </head> <body style='background: #ecf0f1'> <table align='center' border='0' cellpadding='20' cellspacing='20' width='600' style='border-collapse: collapse;background: #fff;border-radius: 6px'> <tr> <td style='color: #153643; font-family: Arial, sans-serif; font-size: 16px; padding-top: 24px;padding-bottom: 24px'> <b>Boxshall Electrical</b> </td> </tr> <tr> <td style='color: #153643; font-family: Arial, sans-serif; font-size: 30px; line-height: 20px;padding-bottom: 24px'> <b>Your login details</b> </td> </tr>" +
//           "<tr> <td style='color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;padding-bottom: 24px'> Email : <b>" +
//           newEmployee.email +
//           "</b></td></tr>" +
//           "<tr> <td style='color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;padding-bottom: 24px'> Password : <b>" +
//           newEmployee.password +
//           "</b></td></tr>" +
//           "<tr><td style='color: #9e9e9e; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;padding-bottom: 24px'> Hi {{username}}, Use above email and password to start using Boxshall Electrical. </td> </tr> <tr> <td align='center' style='color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;padding-bottom: 24px'> <button><a href='{{link}}' style='color:white;text-decoration: none'>Login</a></button> </td> </tr> <td bgcolor='#e67e22' style='padding: 30px 30px 30px 30px;border-bottom-left-radius: 6px;border-bottom-right-radius: 6px'> <table border='0' cellpadding='0' cellspacing='0' width='100%'> <tr> <td width='75%' style='color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;'> Copyright © 2019, Boxshall Electrical. All Rights Reserved </td> <td align='right'> <table border='0' cellpadding='0' cellspacing='0'> <tr> <td> <a href='http://www.twitter.com/'> <img src='https://www.iconsdb.com/icons/preview/white/twitter-xxl.png' alt='Twitter' width='38' height='38' style='display: block;' border='0' /> </a> </td> <td style='font-size: 0; line-height: 0;' width='20'>&nbsp;</td> <td> <a href='http://www.facebook.com/'> <img src='https://www.iconsdb.com/icons/preview/white/facebook-3-xxl.png' alt='Facebook' width='38' height='38' style='display: block;' border='0' /> </a> </td> </tr> </table> </td> </tr> </table> </td> </table> </body> </html>"
//             .replace("{{username}}", newEmployee.DisplayName)
//             .replace("{{link}}", "google.com"),
//     };
//     newEmployee
//       .save()
//       .then((output) => {
//         console.log("SV");
//         return transporter.sendMail(mailOptions, function(error, info){
//           if(error){
//               return console.log(error);
//           }
      
//           console.log('Message sent: ' + info.response);
//       });
//       })
//       .catch((error) => {
//         reject(error);
//       });
// };