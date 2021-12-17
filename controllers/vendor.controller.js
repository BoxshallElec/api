const Vendor = require("../models/vendor.model");
const Intuit = require("./intuit.controller");

exports.add = function (req, res) {
  if (Intuit.getOAuth2TokenJson()) {
    var qbo = Intuit.getQBOConnection();

    const vendorQBO = getVendorObj(req.body);

    qbo.createVendor(vendorQBO, function (error, vendor) {
      if (error) {
        return res.status(500).json({
          success: false,
          message: error.Fault.Error[0].Message
        });
      }

      const newVendor = new Vendor(vendor);
      newVendor._id = newVendor.Id;

      newVendor
        .save()
        .then(result => {
          return res.status(200).json({
            success: true,
            data: result,
            message: "Vendor added successfully"
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

function getVendorObj(data) {
  return {
    PrimaryEmailAddr: {
      Address: PrimaryEmailAddr
    },
    WebAddr: {
      URI: data.WebAddr
    },
    PrimaryPhone: {
      FreeFormNumber: data.FreeFormNumber
    },
    DisplayName: data.DisplayName,
    Suffix: data.Title,
    Title: data.Title,
    Mobile: {
      FreeFormNumber: data.FreeFormNumber
    },
    Fax: {
      FreeFormNumber: data.Fax
    },
    FamilyName: data.FamilyName,
    CompanyName: data.CompanyName,
    BillRate: data.BillRate,
    GivenName: data.GivenName,
    Active: data.Active
  }
}

// exports.list = function (req, res) {
//   Vendor.find({ Active: true })
//     .then(vendors => {
//       return res
//         .status(200)
//         .json({
//           success: true,
//           data: vendors,
//           message: "Vendors fetched successfully"
//         });
//     })
//     .catch(error => {
//       return res.status(500).json({ success: false, message: error.message });
//     });
// };

exports.update = function (req, res) {
  const qbo = Intuit.getQBOConnection();

  delete req.body._id;

  if (qbo) {
    let data = getVendorObj(req.body)
    qbo.updateVendor(data, function (error, result) {
      if (error) {
        return res.status(500).json({
          success: false,
          message: error.Fault.Error[0].Message
        });
      }

      Vendor.findByIdAndUpdate(result.Id, req.body)
        .then(vendor => {
          return res.status(200).json({
            success: true,
            data: vendor,
            message: "Vendor added successfully"
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
    qbo.updateVendor({ Active: false, Id: req.params.vendorId }, function (
      error,
      result
    ) {
      if (error) {
        return res.status(500).json({
          success: false,
          message: error.Fault.Error[0].Message
        });
      }

      Vendor.findByIdAndUpdate(result.Id, { Active: false })
        .then(vendor => {
          return res.status(200).json({
            success: true,
            data: vendor,
            message: "Vendor added successfully"
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
exports.list = function (req, res) {
  const qbo = Intuit.getQBOConnection();
  qbo.findVendors( function (error, result) {
    console.log("Trying to retrieve vendors");
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
  // Vendor.find({ Active: true })
  //   .then(vendors => {
  //     return res
  //       .status(200)
  //       .json({
  //         success: true,
  //         data: vendors,
  //         message: "Vendors fetched successfully"
  //       });
  //   })
  //   .catch(error => {
  //     return res.status(500).json({ success: false, message: error.message });
  //   });
};
