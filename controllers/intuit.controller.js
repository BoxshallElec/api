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
const https = require('https');
var ping = require ("net-ping");

// let oauth2_token_json = null;
// let oauthClient = null;
// let url_val = "/callback";
exports.index = function (req, res) {
  res.render(path.join(__dirname, "../public/index"));
};

exports.authUri = function (req, res) {
  console.log("Authuri");
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

exports.callback = function (req,res) {
  // Instance of client
  console.log("RE");
  console.log(req);
  console.log("RE");
  console.log(req.url);
  
  // https.get('https://3614-110-145-213-10.ngrok.io/intuit/callback', (resp) => {
  //   let data = '';
  //   resp.on('data', (chunk) => {
  //     data += chunk;
  //   });
  //   resp.on('end', () => {
  //     console.log(JSON.parse(data).explanation);
  //   });
  
  // }).on("error", (err) => {
  //   console.log("Error: " + err.message);
  // });  
  // console.log(util.isValidPayload(signature,"{}"));
//   var session = ping.createSession ();

// session.pingHost ("127.0.0.1", function (error, target) {
//     if (error)
//         console.log (target + ": " + error.toString ());
//     else
//         console.log (target + ": Alive");
// });
var net = require('net');
var hosts = [['127.0.0.1',9000]];
hosts.forEach(function(item) {
    var sock = new net.Socket();
    sock.setTimeout(2500);
    sock.on('connect', function() {
        console.log(item[0]+':'+item[1]+' is up.');
        sock.destroy();
    }).on('error', function(e) {
        console.log(item[0]+':'+item[1]+' is down: ' + e.message);
    }).on('timeout', function(e) {
        console.log(item[0]+':'+item[1]+' is down: timeout');
    }).connect(item[1], item[0]);
});
const oauthClient = new OAuthClient({
  clientId: intuit_config.clientId,
  clientSecret: intuit_config.clientSecret,
  environment: intuit_config.environment,
  redirectUri: 'https://5271-110-145-213-10.ngrok.io/intuit/callback',
  logging: true,
});

// AuthorizationUri
const authUri = oauthClient.authorizeUri({
  scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
  state: 'testState',
}); // can be an array of multiple scopes ex : {scope:[OAuthClient.scopes.Accounting,OAuthClient.scopes.OpenId]}

// Redirect the authUri
res.redirect(authUri);
// console.log(authUri);

const parseRedirect = req.url;

// Exchange the auth code retrieved from the **req.url** on the redirectUri
oauthClient
  .createToken(parseRedirect)
  .then(function (authResponse) {
    console.log('The Token is  ' + JSON.stringify(authResponse.getJson()));
  })
  .catch(function (e) {
    console.error('The error message is :' + e.originalMessage);
    console.error(e.intuit_tid);
  });
  // console.log("REQ");
  // // console.log(req);
  // oauthClient = new OAuthClient({
  //   clientId: intuit_config.clientId,
  //   clientSecret: intuit_config.clientSecret,
  //   environment: intuit_config.environment,
  //   redirectUri: 'https://a12a-110-145-213-10.ngrok.io/intuit/callback',
  // });
  // // console.log(intuit_config.redirectUri);
  // // const authUri = oauthClient.authorizeUri({
  // //   scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
  // //   state: "testState",
  // // });
  
  // // res.send(authUri);
  // // let oac = new OAuthClient({
  // //   clientId : 'ABZRADfUaKKkHodapUH4FJkda1KN2hI1gWbisp0pOXPtG1NxsK',
  // //   clientSecret : 'QzyRt99zuLUL3CtK3OnHMAHpJUPW1hsPwk7jVeIF',
  // //   environment : 'sanbox',
  // //   redirectUri : 'https://3955-110-145-213-10.ngrok.io/intuit/callback',
  // // });
  // console.log("CALLBACK");
  // console.log("URL");
  // // console.log(typeof('/callback'));
  // console.log(req._parsedUrl.path);
  // console.log("URL end");
  // console.log(oauthClient);
  // oauthClient.createToken('https://a12a-110-145-213-10.ngrok.io/intuit/callback')
  // .then(function(authResponse){
  //   console.log("Auth");
  //   console.log(authResponse);
  // })
  // .catch(function(e){
  //   console.log(e);
  // });
  // res.send(oauthClient);
  // let realmId = '1309604325';
  // let access_token = 'eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiZGlyIn0..spXxvk3e-sWB6kqU8sGYGQ.qnCnxk74u591f1aWsXD_lLFTQXlnb4ayvM9LZCeVuHUPoqIwSpBXRiU7zmAKHUYYYUb4Y-wh6oBWX1YfgekQvAdJeOeeTLDHJLHO7s2WMlim627afvowixQ1qpFYAOcLuwfJpoJ_v70hDLVRp9V44HLrizrWbPulul-y69Dgscgn2ojC1mxvxuL5Ik9n-rVJvuMpj2VuwEQxEpa3YkSk_z4IeF2nnnCisAd6-1Yz10ZbHJw0SvjXisiyD0Xdz4EVwteBcWSLidhrtu_b2RJfh4h2q3wxvJBJdgGtu4fRZxXfzz-rxXDp9cE2KDEfxZSOysTe0TRsad3IqzxsqvOkVE6IE4CvdoYFrhQxpq1vzw9gZFf5wmj_gY9e8_Kk1WRFWo88ydbZmt3GIlCEhq-PHkGBkyQEsisKB6En5AwZj0qVYbDQxUjGz6CathzFUoFgUUaBfV9830ZGcI3ZaLHnp_WeTEz34KaMMx_7RdZnleY4hZg9aSNniemyRHTY7oEqGks-iTl8JBpsV9UrgduDBT9D6GRSKAS_2_n466KI2jhilfIl2SAoZOBJq0d2UY9MuKWqxP-TetjrK-147Xwz41FfJgPhPMurONOXubWX08FZFvxhQ2HUnchMY31z4Jl4AiMXrqRPVoTLgx8vABAliTUYD1rE07TzA_X754maKwpUgTJ9fTVNQUdiIaFYjivBlygPtYqnIz7i3uCk50py9w4dbJIfD2_jSeC5TT3iGuyjEsl_plj6u-r6SvoJX_RXZ_dmEoTP4RE1fRdg8fPcqLgF8k7p3Xblx5q5ntSdyBSdrVfD65UWwwW1FRkY2B_ZaZ4mMqrZqrrVq9Qli4Ht2t3YKnhImEJ8peS46N3hVqo.ul9biTaFhN6q16ocOr3z8A';
  // let refresh_token = 'AB11647652496fwPb7j5wPgjuqCVDqvoCewU0a6BeY6DYoHYE2';
  //     var qbo = new QuickBooks(
  //       intuit_config.clientId,
  //       intuit_config.clientSecret,
  //       access_token,
  //       false, // no token secret for oAuth 2.0
  //       realmId,
  //       intuit_config.environment, // use the sandbox?
  //       true, // enable debugging?
  //       null, // set minorversion, or null for the latest version
  //       "2.0", //oAuth version
  //       refresh_token
  //     );
  //     console.log("REQ");
  //     console.log(qbo);
  //     console.log(typeof(qbo));
  // res.send(qbo);
    // });
  // oauthClient.createToken(req._parsedUrl.path)
  // .then(function(authResponse){
  //   console.log("It works");
  // })
  // .catch(function (e) {
  //   console.error('The error message is :' + e.originalMessage);
  //   console.error(e);
  // });
  // oauthClient
  //   .createToken(req._parsedUrl.path)
  //   .then(function (authResponse) {
  //     console.log("AR");
  //     console.log(authResponse);
  //     oauth2_token_json = JSON.stringify(authResponse.getToken(), null, 2);

  //     const intuitTokens = JSON.parse(oauth2_token_json);

  //     var qbo = new QuickBooks(
  //       intuit_config.clientId,
  //       intuit_config.clientSecret,
  //       intuitTokens.access_token,
  //       false, // no token secret for oAuth 2.0
  //       intuitTokens.realmId,
  //       intuit_config.environment == "sandbox" ? true : false, // use the sandbox?
  //       true, // enable debugging?
  //       null, // set minorversion, or null for the latest version
  //       "2.0", //oAuth version
  //       intuitTokens.refresh_token
  //     );
  //     console.log("REQ");
  //     console.log(qbo);
  //   });

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

exports.getQBOConnection = function (req,res) {
  console.log("RE");
  console.log(req);
  console.log("Entered");
  const oauthClient = new OAuthClient({
    clientId: intuit_config.clientId,
    clientSecret: intuit_config.clientSecret,
    environment: intuit_config.environment,
    redirectUri: 'https://5271-110-145-213-10.ngrok.io/intuit/callback',
  });
  // console.log(oauthClient);
  // AuthorizationUri
  const authUri = oauthClient.authorizeUri({
    scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
    state: 'testState',
  }); // can be an array of multiple scopes ex : {scope:[OAuthClient.scopes.Accounting,OAuthClient.scopes.OpenId]}
  // console.log(authUri);
  // Redirect the authUri
  // res.redirect(authUri);

  // console.log(authUri);
  // let temp = this.callback();
  // console.log(temp);
  const parseRedirect = authUri;
  
  // Exchange the auth code retrieved from the **req.url** on the redirectUri
  oauthClient
    .createToken(parseRedirect)
    .then(function (authResponse) {
      console.log('The Token is  ' + JSON.stringify(authResponse.getJson()));
      const oauth2_token_json = JSON.stringify(authResponse.getToken(), null, 2);
      const intuitTokens = JSON.parse(oauth2_token_json);
    })
    .catch(function (e) {
      console.error('The error message is :' + e.originalMessage);
      console.error(e.intuit_tid);
    });
  // console.log(oauthClient);
  // const authUri = oauthClient.authorizeUri({
  //   scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
  //   state: "testState",
  // });
  // // res.send(authUri);
  // console.log("CALLBACK");
  // console.log("URL_VAL");
  // console.log(url_val);
  // oauthClient
  //   .createToken(req.url)
  //   .then(function (authResponse) {
  //     console.log("Inside oath");
  //     oauth2_token_json = JSON.stringify(authResponse.getToken(), null, 2);

  //      c
  //   });
  // console.log(oauth2_token_json);
  if (oauth2_token_json) {
    // const intuitTokens = JSON.parse(oauth2_token_json);
    console.log("QBOCONN");
    // const realmId = 4620816365164578440;
    // let realmId = "4620816365164578440";
    console.log(intuitTokens);
    let realmId = '1309604325';
    let access_token = intuitTokens.access_token;
    let refresh_token = intuitTokens.refresh_token;
    console.log(oauth2_token_json);
    console.log("Before qbo");
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
  } else {
    return null;
  }
};
exports.demo = function(req,res){
  console.log("Demo entered");
};
