var mysql      = require('mysql')
var connection = mysql.createConnection({
  host: "localhost",
  user: "athenalibrary",
  password: "athena@123$",
  database: "library",
});

module.exports = connection;