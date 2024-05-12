const JWT = require("jsonwebtoken");

const createToken = (id) =>
  JWT.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: "30d", //
  });

module.exports = { createToken };
