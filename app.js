const express = require("express");
const bodyParser = require("body-parser");
const employeeRoute = require("./routes/employee.route");
const timesheetRoute = require("./routes/timesheet.route");
const taskRoute = require("./routes/task.route");
const classRoute = require("./routes/class.route");
const clientRoute = require("./routes/client.route");
const vendorRoute = require("./routes/vendor.route");
const expensesRoute = require("./routes/expenses.route");
const intuitRoute = require("./routes/intuit.route");
const uploadRoute = require("./routes/upload.route");
const listRoute = require("./routes/list.route");
const userRoute = require("./routes/user.route");
// const demoRoute = require("./routes/demo.route");

const mongoose = require("mongoose");
const cors = require("cors");
const config = require("config");
// const godb_host = config.get("mongodb.host");
const mongodb_host = config.get("mongodb.host");
const allowedOrigins = config.get("allowedOrigins");
const path = require("path");

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(
  express.static(path.join(__dirname, "./public"), {
    index: false,
  })
);
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.use(bodyParser.json());
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

mongoose.connect(
  mongodb_host,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  },
  function (err, client) {
    if (err) {
      console.log(err);
    }
    console.log("MongoDB Connected");
  }
);

mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      // if (allowedOrigins.indexOf(origin) === -1) {
      //   var msg =
      //     "The CORS policy for this site does not " +
      //     "allow access from the specified Origin.";
      //   return callback(new Error(msg), false);
      // }
      return callback(null, true);
    },
  })
);

app.get("/", (req, res) => {
  res.send("Bring it on! Verd API is running.");
});

// app.use("/demo",demoRoute);
app.use("/employee", employeeRoute);
app.use("/timesheet", timesheetRoute);
app.use("/task", taskRoute);
app.use("/class", classRoute);
app.use("/client", clientRoute);
app.use("/vendor", vendorRoute);
app.use("/expenses", expensesRoute);
app.use("/intuit", intuitRoute);
app.use("/upload", uploadRoute);
app.use("/list", listRoute);
app.use("/user", userRoute);
const port = process.env.PORT || 9000;

app.listen(port, () => {
  console.log("Verd API up and running " + port);
});
