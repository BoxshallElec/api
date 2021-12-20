const Client = require("../models/client.model");
const Intuit = require("./intuit.controller");

exports.add = function(req, res) {
  Client.findOne({ DisplayName: req.body.DisplayName })
    .then(output => {
      if (output) {
        return res
          .status(500)
          .json({ success: false, message: "Display name already exist" });
      }

      if (Intuit.getOAuth2TokenJson()) {
        var qbo = Intuit.getQBOConnection();

        const customer = {
          DisplayName: req.body.DisplayName,
          Notes: req.body.description || ""
        };

        if (req.body.parentId) {
          customer.ParentRef = { value: req.body.parentId };
        }

        qbo.createCustomer(customer, function(error, customer) {
          if (error) {
            return res.status(500).json({
              success: false,
              message: error.Fault.Error[0].Message
            });
          }
          const client = new Client(customer);
          client._id = customer.Id;

          client
            .save()
            .then(result => {
              return res.status(200).json({
                success: true,
                data: result,
                message: "Client added successfully"
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
    })
    .catch(error => {
      return res.status(500).json({ success: false, message: error.message });
    });
};

exports.update = function(req, res) {
  if (Intuit.getOAuth2TokenJson()) {
    var qbo = Intuit.getQBOConnection();

    delete req.body.userId;
    delete req.body._id;

    qbo.updateCustomer(req.body, function(error, customer) {
      if (error) {
        return res.status(500).json({
          success: false,
          message: error.Fault.Error[0].Message
        });
      }

      Client.findByIdAndUpdate({ Id: req.body.Id }, req.body)
        .then(result => {
          res.json({
            data: result,
            success: true,
            message: "updated successfully."
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
    return res
      .status(500)
      .json({ success: false, message: "No quickbook connection found" });
  }
};

exports.listSubClient = function(req, res) {
  Client.aggregate([
    {
      $match: { ParentRef: { $ne: null } }
    },
    {
      $group: {
        _id: "$ParentRef"
      }
    },
    {
      $project: {
        client: "$_id"
      }
    },
    {
      $lookup: {
        from: "clients",
        localField: "_id",
        foreignField: "ParentRef",
        as: "clients"
      }
    }
  ])
    .then(result => {
      Client.populate(result, { path: "client" })
        .then(clients => {
          return res.status(200).json({
            success: true,
            message: "Client list fetched successfully",
            data: clients
          });
        })
        .catch(error => {
          return res
            .status(500)
            .json({ success: false, message: error.message });
        });
    })
    .catch(error => {
      return res.status(500).json({ success: false, message: error.message });
    });
};

exports.list = function(req, res) {
  const from = req.body.from || 0;
  const size = req.body.size || 10;

  Client.find({})
    .skip(from)
    .limit(size)
    .then(data => {
      if (from == 0) {
          // console.log("LOLLZZZ");
          // console.log(Client.countDocuments({}));
        Client.countDocuments({})
          .then(totalCount => {
            return res.status(200).json({
              success: true,
              message: "Client list fetched successfully",
              data: data,
              totalCount: totalCount
            });
          })
          .catch(error => {
            return res
              .status(500)
              .json({ success: false, message: error.message });
          });
      } else {
        return res.status(200).json({
          success: true,
          message: "Client list fetched successfully",
          data: data
        });
      }
    })
    .catch(error => {
      return res.status(500).json({ success: false, message: error.message });
    });
};

exports.listAll = function(req, res) {
  Client.find({})
    .select("Id DisplayName")
    .then(data => {
      return res.status(200).json({
        success: true,
        message: "Client list fetched successfully",
        data: data
      });
    })
    .catch(error => {
      return res.status(500).json({ success: false, message: error.message });
    });
};
exports.listQBO = function(req, res){
  const qbo = Intuit.getQBOConnection();
  qbo.findCustomers( function (error, result) {
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
        message: "Customer list fetched successfully",
        data: result,
      });
    }
  });
};