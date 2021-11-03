var async = require("async");
const Employee = require("../models/employee.model");
const Task = require("../models/task.model");
const Class = require("../models/class.model");
const Client = require("../models/client.model");
const Vendor = require("../models/vendor.model");
const Timesheet = require("../models/timesheet.model");
const Expenses = require("../models/expenses.model");
const Intuit = require("../controllers/intuit.controller");
const config = require("config");
const generator = require("generate-password");
const nodemailer = require("nodemailer");
const verification = config.get("verification");

var q = async.queue(function(task, callback) {
  processTask(task);
  callback();
}, 1);

function addToQueue(payload) {
  q.push(payload);
}

function processTask(task) {
  console.log("processing task in queue");

  // get realm id from payload
  var data = JSON.parse(task);
  if (data && data.eventNotifications) {
    data.eventNotifications.map(notifications => {
      notifications.dataChangeEvent.entities.map(event => {
        switch (event.name) {
          case "Employee":
            switch (event.operation) {
              case "Update":
                updateEmployee(event.id);
                break;
              case "Create":
                createEmployee(event.id);
                break;
            }
            break;
          case "Item":
            switch (event.operation) {
              case "Update":
                updateTask(event.id);
                break;
              case "Create":
                createTask(event.id);
                break;
              case "Delete":
                deleteTask(event.id);
                break;
            }
            break;
          case "Class":
            switch (event.operation) {
              case "Delete":
              case "Update":
                updateClass(event.id);
                break;
              case "Create":
                createClass(event.id);
                break;
            }
            break;
          case "Customer":
            switch (event.operation) {
              case "Delete":
              case "Update":
                updateCustomer(event.id);
                break;
              case "Create":
                createCustomer(event.id);
                break;
            }
            break;
          case "TimeActivity":
            switch (event.operation) {
              case "Delete":
                deleteTimesheet(event.id);
              case "Update":
                updateTimesheet(event.id);
                break;
              case "Create":
                createTimesheet(event.id);
                break;
            }
            break;
          case "Vendor":
            switch (event.operation) {
              case "Delete":
              case "Update":
                updateVendor(event.id);
                break;
              case "Create":
                createVendor(event.id);
                break;
            }
            break;
          case "Purchase":
            switch (event.operation) {
              case "Update":
                updateExpense(event.id);
                break;
              case "Create":
                createExpense(event.id);
                break;
            }
            break;
        }
      });
    });
  }
}

function updateExpense(id) {
  if (Intuit.getOAuth2TokenJson()) {
    const qbo = Intuit.getQBOConnection();

    qbo.getPurchase(id, function(error, qboPurchase) {
      if (qboPurchase) {
        Expenses.findOneAndUpdate(
          { Id: id },
          { $set: qboPurchase },
          { new: true }
        )
          .then(expense => {
            console.log(expense);
          })
          .catch(error => {
            console.log(error.message);
          });
      }
    });
  }
}

function createExpense(id) {
  if (Intuit.getOAuth2TokenJson()) {
    const qbo = Intuit.getQBOConnection();

    qbo.getPurchase(id, function(error, qboPurchase) {
      if (qboPurchase) {
        Expenses.findById(qboPurchase.Id)
          .then(purchase => {
            if (!purchase) {
              const newExpense = new Expenses(qboPurchase);
              newExpense._id = qboPurchase.Id;

              newExpense
                .save()
                .then(result => {
                  console.log(result);
                })
                .catch(error => {
                  console.log(error.message);
                });
            }
          })
          .catch(error => {
            console.log(error.message);
          });
      }
    });
  }
}

function updateVendor(id) {
  if (Intuit.getOAuth2TokenJson()) {
    const qbo = Intuit.getQBOConnection();

    qbo.getVendor(id, function(error, qboVendor) {
      if (qboVendor) {
        Vendor.findOneAndUpdate({ Id: id }, { $set: qboVendor }, { new: true })
          .then(vendor => {
            console.log(vendor);
          })
          .catch(error => {
            console.log(error.message);
          });
      }
    });
  }
}

function createVendor(id) {
  if (Intuit.getOAuth2TokenJson()) {
    const qbo = Intuit.getQBOConnection();

    qbo.getVendor(id, function(error, qboVendor) {
      if (qboVendor) {
        Vendor.findById(qboVendor.Id)
          .then(vendor => {
            if (!vendor) {
              const newVendor = new Vendor(qboVendor);
              newVendor._id = qboVendor.Id;

              newVendor
                .save()
                .then(result => {
                  console.log(result);
                })
                .catch(error => {
                  console.log(error.message);
                });
            }
          })
          .catch(error => {
            console.log(error.message);
          });
      }
    });
  }
}

function createTimesheet(id) {
  if (Intuit.getOAuth2TokenJson()) {
    const qbo = Intuit.getQBOConnection();

    qbo.getTimeActivity(id, function(error, qboTimeActivity) {
      if (qboTimeActivity) {
        Timesheet.findById(qboTimeActivity.Id)
          .then(timeActivity => {
            if (!timeActivity) {
              const newTimesheet = new Timesheet(qboTimeActivity);
              newTimesheet._id = qboTimeActivity.Id;

              newTimesheet
                .save()
                .then(result => {
                  console.log(result);
                })
                .catch(error => {
                  console.log(error.message);
                });
            }
          })
          .catch(error => {
            console.log(error.message);
          });
      }
    });
  }
}

function updateTimesheet(id) {
  if (Intuit.getOAuth2TokenJson()) {
    const qbo = Intuit.getQBOConnection();

    qbo.getTimeActivity(id, function(error, qboTimeActivity) {
      if (qboTimeActivity) {
        Timesheet.findOneAndUpdate(
          { Id: id },
          { $set: qboTimeActivity },
          { new: true }
        )
          .then(timesheet => {
            console.log(timesheet);
          })
          .catch(error => {
            console.log(error.message);
          });
      }
    });
  }
}

function deleteTimesheet(id) {
  if (Intuit.getOAuth2TokenJson()) {
    const qbo = Intuit.getQBOConnection();

    Timesheet.findByIdAndDelete(id)
      .then(result => {
        console.log(result);
      })
      .catch(error => {
        console.log(error);
      });
  }
}

function createCustomer(id) {
  if (Intuit.getOAuth2TokenJson()) {
    const qbo = Intuit.getQBOConnection();

    qbo.getCustomer(id, function(error, qboCustomer) {
      if (qboCustomer) {
        Client.findById(qboCustomer.Id)
          .then(customer => {
            if (!customer) {
              const newCustomer = new Client(qboCustomer);
              newCustomer._id = newCustomer.Id;

              newCustomer
                .save()
                .then(result => {
                  console.log(result);
                })
                .catch(error => {
                  console.log(error.message);
                });
            }
          })
          .catch(error => {
            console.log(error.message);
          });
      }
    });
  }
}

function updateCustomer(id) {
  if (Intuit.getOAuth2TokenJson()) {
    const qbo = Intuit.getQBOConnection();

    qbo.getCustomer(id, function(error, qboCustomer) {
      if (qboCustomer) {
        Client.findOneAndUpdate(
          { Id: id },
          { $set: qboCustomer },
          { new: true }
        )
          .then(customer => {
            console.log(customer);
          })
          .catch(error => {
            console.log(error.message);
          });
      }
    });
  }
}

function updateClass(id) {
  if (Intuit.getOAuth2TokenJson()) {
    const qbo = Intuit.getQBOConnection();

    qbo.getClass(id, function(error, qboClass) {
      if (qboClass) {
        Class.findOneAndUpdate({ Id: id }, { $set: qboClass }, { new: true })
          .then(_class => {
            console.log(_class);
          })
          .catch(error => {
            console.log(error.message);
          });
      }
    });
  }
}

function createClass(id) {
  if (Intuit.getOAuth2TokenJson()) {
    const qbo = Intuit.getQBOConnection();

    qbo.getClass(id, function(error, qboClass) {
      if (qboClass) {
        Class.findById(qboClass.Id)
          .then(_class => {
            if (!_class) {
              const newClass = new Class(qboClass);
              newClass._id = qboClass.Id;

              newClass
                .save()
                .then(result => {
                  console.log(result);
                })
                .catch(error => {
                  console.log(error.message);
                });
            }
          })
          .catch(error => {
            console.log(error.message);
          });
      }
    });
  }
}

function createTask(id) {
  if (Intuit.getOAuth2TokenJson()) {
    const qbo = Intuit.getQBOConnection();

    qbo.getItem(id, function(error, qboTask) {
      if (qboTask) {
        Task.findById(qboTask.Id)
          .then(task => {
            if (!task) {
              const newTask = new Task(qboTask);
              newTask._id = qboTask.Id;

              newTask
                .save()
                .then(result => {
                  console.log(result);
                })
                .catch(error => {
                  console.log(error.message);
                });
            }
          })
          .catch(error => {
            console.log(error.message);
          });
      }
    });
  }
}

function deleteTask(id) {
  if (Intuit.getOAuth2TokenJson()) {
    const qbo = Intuit.getQBOConnection();

    qbo.getItem(id, function(error, qboTask) {
      if (qboTask) {
        Task.findOneAndUpdate(
          { Id: id },
          { $set: { Active: false } },
          { new: true }
        )
          .then(task => {
            console.log(task);
          })
          .catch(error => {
            console.log(error.message);
          });
      }
    });
  }
}

function updateTask(id) {
  if (Intuit.getOAuth2TokenJson()) {
    const qbo = Intuit.getQBOConnection();

    qbo.getItem(id, function(error, qboTask) {
      if (qboTask) {
        Task.findOneAndUpdate({ Id: id }, { $set: qboTask }, { new: true })
          .then(task => {
            console.log(task);
          })
          .catch(error => {
            console.log(error.message);
          });
      }
    });
  }
}

function createTask(id) {
  if (Intuit.getOAuth2TokenJson()) {
    const qbo = Intuit.getQBOConnection();

    qbo.getItem(id, function(error, qboTask) {

      if(qboTask){
        Task.findById(qboTask.Id)
        .then(task => {
          if (!task) {
            const newTask = new Task(qboTask);
            newTask._id = qboTask.Id;

            newTask
              .save()
              .then(result => {
                console.log(result);
              })
              .catch(error => {
                console.log(error.message);
              });
          }
        })
        .catch(error => {
          console.log(error.message);
        });
      }
    });
  }
}

function updateEmployee(id) {
  if (Intuit.getOAuth2TokenJson()) {
    const qbo = Intuit.getQBOConnection();

    qbo.getEmployee(id, function(error, qboEmployee) {
      if (qboEmployee) {
        Employee.findOneAndUpdate(
          { Id: id },
          { $set: qboEmployee },
          { new: true }
        )
          .then(employee => {
            console.log(employee);
          })
          .catch(error => {
            console.log(error.message);
          });
      }
    });
  }
}

function createEmployee(id) {
  if (Intuit.getOAuth2TokenJson()) {
    const qbo = Intuit.getQBOConnection();

    qbo.getEmployee(id, function(error, qboEmployee) {
      if (
        qboEmployee &&
        qboEmployee.PrimaryEmailAddr &&
        qboEmployee.PrimaryEmailAddr.Address
      ) {
        Employee.findById(qboEmployee.Id)
          .then(employee => {
            if (!employee) {
              var password = generator.generate({
                length: 10,
                numbers: true,
                symbols: true
              });

              const newEmployee = new Employee(qboEmployee);
              newEmployee.email = qboEmployee.PrimaryEmailAddr.Address;
              newEmployee.password = password;
              newEmployee._id = qboEmployee.Id;

              newEmployee
                .save()
                .then(result => {
                  return sendVerificationMail(result, password);
                })
                .catch(error => {
                  console.log(error.message);
                });
            }
          })
          .catch(error => {
            console.log(error.message);
          });
      }
    });
  }
}

sendVerificationMail = function(employee, password) {
  var username = employee.DisplayName;

  var link = "http://verd.com.au";

  var transporter = nodemailer.createTransport({
    host: "webcloud64.au.syrahost.com",
    port: 465,
    secure: true,
    auth: {
      user: verification.email,
      pass: verification.password
    }
  });

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
        .replace("{{link}}", link)
  };

  transporter
    .sendMail(mailOptions)
    .then(result => {
      console.log(result);
    })
    .catch(error => {
      console.log(error.message);
    });
};

module.exports.addToQueue = addToQueue;
