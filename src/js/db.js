const mysql = require('mysql');
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'athenalibrary',
	password: 'athena@123$',
	database: 'library',
});

function startConnection() {
	// Open a DB connection if there is none already open.
	if (connection.state === 'disconnected') {
		connection.connect((error) => {
			if (error) throw error;
		});
	}
}

function getQueryData(sqlQuery) {
	return new Promise(function (resolve, reject) {
		// eslint-disable-next-line no-unused-vars
		connection.query(sqlQuery, function (error, results, fields) {
			if (error) {
				return reject(error);
			}
			resolve(results);
		});
	});
}

function runDBQuery(sqlQuery, callback) {
	getQueryData(sqlQuery)
		.then((results) => {
			callback(results);
		})
		.catch((err) =>
			setImmediate(() => {
				// eslint-disable-next-line no-alert, no-undef
				alert(' Unable to locate book / member in our record');
				throw err;
			})
		);
}

exports.startConnection = startConnection;
exports.runDBQuery = runDBQuery;
