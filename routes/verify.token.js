const jwt = require("jsonwebtoken");
const config = require("config");
const secret = config.get("secret");

function verifyToken(req, res, next) {
  var token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    req.headers["token"];

  if (!token)
    return res.status(403).send({
      auth: false,
      message: "No token provided."
    });
  jwt.verify(token, secret, function(err, decoded) {
    if (err)
      return res.status(500).send({
        auth: false,
        message: "Failed to authenticate token."
      });

    req.body.userId = decoded.userId;
    req.body.intuitId = decoded.intuitId;
    next();
  });
}

module.exports = verifyToken;
