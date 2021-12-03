const config = require("config");
const nodemailer = require("nodemailer");
const generator = require("generate-password");
const intuit_config = config.get("intuit-config");
const path = require("path");
const verification = config.get("verification");
const OAuthClient = require("intuit-oauth");
const QuickBooks = require("node-quickbooks");
const Employee = require("../models/employee.model");
const Client = require("../models/client.model");
const Task = require("../models/task.model");
const Vendor = require("../models/vendor.model");
const Expenses = require("../models/expenses.model");
const Timesheet = require("../models/timesheet.model");
const Account = require("../models/account.model");
const Class = require("../models/class.model");
const crypto = require("crypto");
var util = require("../utils/util");
var queue = require("../queue/queue");
let oauth2_token_json = null;
let oauthClient = null;
const realmId = "4620816365164578440";
exports.index = function (req, res) {
  res.render(path.join(__dirname, "../public/index"));
};

exports.authUri = function (req, res) {
  oauthClient = new OAuthClient({
    clientId: intuit_config.clientId,
    clientSecret: intuit_config.clientSecret,
    environment: intuit_config.environment,
    redirectUri: intuit_config.redirectUri,
  });

  const authUri = oauthClient.authorizeUri({
    scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
    state: "testState",
  });
  res.send(authUri);
};

exports.callback = function (req, res) {
  console.log("CALLBACK");
  oauthClient
    .createToken(req.url)
    .then(function (authResponse) {
      oauth2_token_json = JSON.stringify(authResponse.getToken(), null, 2);

      const intuitTokens = JSON.parse(oauth2_token_json);

      var qbo = new QuickBooks(
        intuit_config.clientId,
        intuit_config.clientSecret,
        intuitTokens.access_token,
        false, // no token secret for oAuth 2.0
        intuitTokens.realmId,
        intuit_config.environment == "sandbox" ? true : false, // use the sandbox?
        true, // enable debugging?
        null, // set minorversion, or null for the latest version
        "2.0", //oAuth version
        intuitTokens.refresh_token
      );

      const qboPromises = [];

      const qboEmployeePromise = new Promise((qboResolve, qboReject) => {
        qbo.findEmployees({ fetchAll: true }, function (error, result) {
          const employeePromises = [];

          if (result && result.QueryResponse && result.QueryResponse.Employee) {
            result.QueryResponse.Employee.forEach((employee) => {
              if (
                employee.PrimaryEmailAddr &&
                employee.PrimaryEmailAddr.Address
              ) {
                const employeePromise = new Promise((resolve, reject) => {
                  Employee.findOne({ email: employee.PrimaryEmailAddr.Address })
                    .then((result) => {
                      if (result) {
                        resolve(result);
                      } else {
                        var password = generator.generate({
                          length: 10,
                          numbers: true,
                          symbols: true,
                        });

                        const newEmployee = new Employee(employee);
                        newEmployee.email = employee.PrimaryEmailAddr.Address;
                        newEmployee.password = password;
                        newEmployee._id = employee.Id;

                        newEmployee
                          .save()
                          .then((result) => {
                            return sendVerificationEMail(
                              result,
                              password,
                              resolve,
                              reject
                            );
                          })
                          .catch((error) => {
                            reject(error);
                          });
                      }
                    })
                    .catch((error) => {
                      reject(error);
                    });
                });

                employeePromises.push(employeePromise);
              }
            });
          }

          Promise.all(employeePromises)
            .then((reslt) => {
              qboResolve(result);
            })
            .catch((error) => {
              qboReject(error);
            });
        });
      });

      const qboCustomerPromise = new Promise((qboResolve, qboReject) => {
        qbo.findCustomers({ fetchAll: true }, function (error, result) {
          const customerPromises = [];

          if (result && result.QueryResponse && result.QueryResponse.Customer) {
            result.QueryResponse.Customer.forEach((customer) => {
              const customerPromise = new Promise((resolve, reject) => {
                Client.findOne({ DisplayName: customer.DisplayName })
                  .then((result) => {
                    if (result) {
                      resolve(result);
                    } else {
                      const client = new Client(customer);
                      client._id = customer.Id;

                      client
                        .save()
                        .then((result) => {
                          resolve(result);
                        })
                        .catch((error) => {
                          reject(error);
                        });
                    }
                  })
                  .catch((error) => {
                    reject(error);
                  });
              });

              customerPromises.push(customerPromise);
            });
          }

          Promise.all(customerPromises)
            .then((reslt) => {
              qboResolve(result);
            })
            .catch((error) => {
              qboReject(error);
            });
        });
      });

      const qboTaskPromise = new Promise((qboResolve, qboReject) => {
        qbo.findItems({ fetchAll: true }, function (error, result) {
          const itemPromises = [];

          if (result && result.QueryResponse && result.QueryResponse.Item) {
            result.QueryResponse.Item.forEach((item) => {
              const itemPromise = new Promise((resolve, reject) => {
                Task.findOne({ Name: item.Name })
                  .then((result) => {
                    if (result) {
                      resolve(result);
                    } else {
                      const task = new Task(item);
                      task._id = item.Id;

                      task
                        .save()
                        .then((result) => {
                          resolve(result);
                        })
                        .catch((error) => {
                          reject(error);
                        });
                    }
                  })
                  .catch((error) => {
                    reject(error);
                  });
              });

              itemPromises.push(itemPromise);
            });
          }

          Promise.all(itemPromises)
            .then((reslt) => {
              qboResolve(result);
            })
            .catch((error) => {
              qboReject(error);
            });
        });
      });

      const qboClassPromise = new Promise((qboResolve, qboReject) => {
        qbo.findClasses({ fetchAll: true }, function (error, result) {
          const classPromises = [];

          if (result && result.QueryResponse && result.QueryResponse.Class) {
            result.QueryResponse.Class.forEach((_class) => {
              const classPromise = new Promise((resolve, reject) => {
                Class.findOne({ Name: _class.Name })
                  .then((result) => {
                    if (result) {
                      resolve(result);
                    } else {
                      const newClass = new Class(_class);
                      newClass._id = _class.Id;

                      newClass
                        .save()
                        .then((result) => {
                          resolve(result);
                        })
                        .catch((error) => {
                          reject(error);
                        });
                    }
                  })
                  .catch((error) => {
                    reject(error);
                  });
              });

              classPromises.push(classPromise);
            });
          }

          Promise.all(classPromises)
            .then((reslt) => {
              qboResolve(result);
            })
            .catch((error) => {
              qboReject(error);
            });
        });
      });

      const qboVendorPromise = new Promise((qboResolve, qboReject) => {
        qbo.findVendors({ fetchAll: true }, function (error, result) {
          const vendorPromises = [];

          if (result && result.QueryResponse && result.QueryResponse.Vendor) {
            result.QueryResponse.Vendor.forEach((vendor) => {
              const vendorPromise = new Promise((resolve, reject) => {
                Vendor.findOne({ DisplayName: vendor.DisplayName })
                  .then((result) => {
                    if (result) {
                      resolve(result);
                    } else {
                      const newVendor = new Vendor(vendor);
                      newVendor._id = vendor.Id;

                      newVendor
                        .save()
                        .then((result) => {
                          resolve(result);
                        })
                        .catch((error) => {
                          reject(error);
                        });
                    }
                  })
                  .catch((error) => {
                    reject(error);
                  });
              });

              vendorPromises.push(vendorPromise);
            });
          }

          Promise.all(vendorPromises)
            .then((reslt) => {
              qboResolve(result);
            })
            .catch((error) => {
              qboReject(error);
            });
        });
      });

      const qboTimeActivityPromise = new Promise((qboResolve, qboReject) => {
        qbo.findCustomers({ fetchAll: true }, function (error, result) {
          const timeActivityPromises = [];

          if (
            result &&
            result.QueryResponse &&
            result.QueryResponse.TimeActivity
          ) {
            result.QueryResponse.TimeActivity.forEach((timeActivity) => {
              const timeActivityPromise = new Promise((resolve, reject) => {
                Timesheet.findOne({ Id: timeActivity.Id })
                  .then((result) => {
                    if (result) {
                      resolve(result);
                    } else {
                      const timesheet = new Timesheet(timeActivity);
                      timesheet._id = timeActivity.Id;

                      timesheet
                        .save()
                        .then((result) => {
                          resolve(result);
                        })
                        .catch((error) => {
                          reject(error);
                        });
                    }
                  })
                  .catch((error) => {
                    reject(error);
                  });
              });

              timeActivityPromises.push(timeActivityPromise);
            });
          }

          Promise.all(timeActivityPromises)
            .then((reslt) => {
              qboResolve(result);
            })
            .catch((error) => {
              qboReject(error);
            });
        });
      });

      const qboAccountPromise = new Promise((qboResolve, qboReject) => {
        qbo.findAccounts({ fetchAll: true }, function (error, result) {
          const accountPromises = [];

          if (result && result.QueryResponse && result.QueryResponse.Account) {
            result.QueryResponse.Account.forEach((account) => {
              const accountPromise = new Promise((resolve, reject) => {
                Account.findOne({ Id: account.Id })
                  .then((result) => {
                    if (result) {
                      resolve(result);
                    } else {
                      const newAccount = new Account(account);
                      newAccount._id = account.Id;

                      newAccount
                        .save()
                        .then((result) => {
                          resolve(result);
                        })
                        .catch((error) => {
                          reject(error);
                        });
                    }
                  })
                  .catch((error) => {
                    reject(error);
                  });
              });

              accountPromises.push(accountPromise);
            });
          }

          Promise.all(accountPromises)
            .then((reslt) => {
              qboResolve(result);
            })
            .catch((error) => {
              qboReject(error);
            });
        });
      });

      const qboPurchasePromise = new Promise((qboResolve, qboReject) => {
        qbo.findPurchases({ fetchAll: true }, function (error, result) {
          const purchasePromises = [];

          if (result && result.QueryResponse && result.QueryResponse.Purchase) {
            result.QueryResponse.Account.forEach((purchase) => {
              const purchasePromise = new Promise((resolve, reject) => {
                Expenses.findOne({ Id: purchase.Id })
                  .then((result) => {
                    if (result) {
                      resolve(result);
                    } else {
                      const newPurchase = new Purchase(purchase);
                      newPurchase._id = purchase.Id;

                      newPurchase
                        .save()
                        .then((result) => {
                          resolve(result);
                        })
                        .catch((error) => {
                          reject(error);
                        });
                    }
                  })
                  .catch((error) => {
                    reject(error);
                  });
              });

              purchasePromises.push(purchasePromise);
            });
          }

          Promise.all(purchasePromises)
            .then((reslt) => {
              qboResolve(result);
            })
            .catch((error) => {
              qboReject(error);
            });
        });
      });

      qboPromises.push(qboEmployeePromise);
      qboPromises.push(qboCustomerPromise);
      qboPromises.push(qboTaskPromise);
      qboPromises.push(qboClassPromise);
      qboPromises.push(qboVendorPromise);
      qboPromises.push(qboTimeActivityPromise);
      qboPromises.push(qboAccountPromise);
      qboPromises.push(qboPurchasePromise);

      Promise.all(qboPromises)
        .then((reslt) => {
          console.log("Connected to QuickBooks");
          res.status(200).send("");
        })
        .catch((error) => {
          console.log("Error occured while connecting to QuickBooks");
          res.status(500).send("");
        });
    })
    .catch(function (e) {
      res.status(500).send("");
    });
};

sendVerificationEMail = function (employee, password, resolve, reject) {
  var username = employee.DisplayName;

  var link = "https://verd.com.au/";

  var transporter = nodemailer.createTransport({
    host: "webcloud64.au.syrahost.com",
    port: 465,
    secure: true,
    auth: {
      user: verification.email,
      pass: verification.password,
    },
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
        .replace("{{link}}", link),
  };

  transporter
    .sendMail(mailOptions)
    .then((result) => {
      resolve(result);
    })
    .catch((error) => {
      reject(error);
    });
};

exports.retrieveToken = function (req, res) {
  res.send(oauth2_token_json);
};

exports.refreshAccessToken = function (req, res) {
  oauthClient
    .refresh()
    .then(function (authResponse) {
      console.log(
        "The Refresh Token is  " + JSON.stringify(authResponse.getJson())
      );
      oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);
      res.send(oauth2_token_json);
    })
    .catch(function (e) {
      console.error(e);
    });
};

exports.getCompanyInfo = function (req, res) {
  const companyID = oauthClient.getToken().realmId;

  const url =
    oauthClient.environment == "sandbox"
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({
      url: url + "v3/company/" + companyID + "/companyinfo/" + companyID,
    })
    .then(function (authResponse) {
      console.log(
        "The response for API call is :" + JSON.stringify(authResponse)
      );
      res.send(JSON.parse(authResponse.text()));
    })
    .catch(function (e) {
      console.error(e);
    });
};

exports.webhooks = function (req, res) {
  var payload = JSON.stringify(req.body);
  var signature = req.get("intuit-signature");

  if (!signature) {
    return res.status(401).send("FORBIDDEN");
  }

  if (!payload) {
    return res.status(200).send("success");
  }

  if (oauthClient && !oauthClient.isAccessTokenValid()) {
    oauthClient
      .refresh()
      .then(function (authResponse) {
        oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);

        if (util.isValidPayload(signature, payload)) {
          queue.addToQueue(payload);
          console.log("task added to queue ");

          return res.status(200).send("success");
        } else {
          return res.status(401).send("FORBIDDEN");
        }
      })
      .catch(function (e) {
        console.error("The error message is :" + e.originalMessage);
        console.error(e.intuit_tid);
      });
  } else {
    if (util.isValidPayload(signature, payload)) {
      queue.addToQueue(payload);
      console.log("task added to queue ");

      return res.status(200).send("success");
    } else {
      return res.status(401).send("FORBIDDEN");
    }
  }
};

exports.disconnect = function (req, res) {
  console.log("The disconnect called ");
  const authUri = oauthClient.authorizeUri({
    scope: [OAuthClient.scopes.OpenId, OAuthClient.scopes.Email],
    state: "intuit-test",
  });
  res.redirect(authUri);
};

exports.getOAuth2TokenJson = function () {
  return oauth2_token_json;
};

exports.getOAuthClient = function () {
  return oauthClient;
};

exports.getQBOConnection = function () {
  // if (oauth2_token_json) {
    // const intuitTokens = JSON.parse(oauth2_token_json);
    console.log("QBOCONN");
    // const realmId = 4620816365164578440;
    console.log(realmId);
    let access_token = "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiZGlyIn0..v13-bhvogjSNWRQxBJlcXQ.mTNHR2AdKhL4MjvYEKBClfzim3TvhDxnsGW2pExNrxWER_fxnKfQJk3BIjhbNFKVFhvo2lCkyQGchOOj5wGp6oqKi2I-95T_QIxsayORGmkyaxBSF_9AzOgUzvqXIph3-T6geVU6CVW64AZ78Kqaqs2jXkdUpvrz4azZrPDplSniZ6NkoFVT7wDd8hUsfibfZfai9zKtmLmX3kQldm9GeKDy4HcNaLCIyZxtLmasQnow3-jZ6UR80DMcezWo6_jIWQRW94Q_nNkXOGZFAjZUDZRoAabac3SZNZPZFJXBE08MO51fAzdzZ-YVyaflN6ZqCPKyJhbmbUHgxvH9ndtkWkDC8E_UtQEBft1I3ubzArf35VE5uxyn4z0L9YlF1cJhasGzZwJN4CDjeAa05gffmB46W1tcNH4vCivcH-Ff3vC4of-CuWRteOSGYJ2CcOsZFdH9HYsUHOTnZ_ruQF4gMYPYVsLtlwexTs00AM1-1vceWyWSQaGm4T-gQRTucrrzSV5CqdMgAooMVN3YA3FWj1KJnHxzTUkf90WgAVbjIFmDDGgsSAvhs3TwNaJuPv2qG253m2dXP2n7MZegekRJtpElRQIjRP68z6TdnZ1pQx1caabWJAB8HvkDXqtImkHxsv7vUzYSSj4Ie_hgeW1m2l8WidcK7KmOYpYwSm9keuzc6e7YkuiAZDlgEIYG-8YZFPYPcnMWBFSBGfTtMv5gVIn4sbuNh1tocvDsncVgP5bzCHUsax3HeqCs39eBh4XQgocWqsmIiWTRNlO5125kjTNaGawwmXqA3ZBd__V-7r6KYvr4CJaeyGBoS8EJkALwiG9t63vUthNCFYS29HvDyKC_-I6UOyQsWrgROjGqLIyX8wcb9SaWBhFPsoMhLBYktOx0oRyEvBbi3t7nuP2iug.Z7m9uDAvZHtsOFIpKu_FDA";
    let refresh_token = "AB11647125661aXHZtOdaP2lHHwbs7jSZtys5KByJNOxx1Iyd2";
    var qbo = new QuickBooks(
      intuit_config.clientId,
      intuit_config.clientSecret,
      access_token,
      false, // no token secret for oAuth 2.0
      realmId,
      intuit_config.environment == "sandbox" ? true : false, // use the sandbox?
      true, // enable debugging?
      63, // set minorversion, or null for the latest version
      "2.0", //oAuth version
      refresh_token
    );
    console.log(realmId);
    console.log(qbo);
    return qbo;
  // } else {
  //   return null;
  // }
};
