var mysql      = require('mysql')
var connection = mysql.createConnection({
  host: "localhost",
  user: "athenalibrary",
  password: "athena@123$",
  database: "library",
});

function startConnection(){
  // Open a DB connection if there is none already open.
  if( connection.state === 'disconnected' ){
    connection.connect( ( error ) => {
      if( error ) throw error;
      console.log( 'connected' );
    });}
}

function getQueryData( sqlQuery ) {
  return new Promise( function( resolve, reject ){

    connection.query( sqlQuery, function( error, results, fields ){
      if( error ){
        return reject( error );
      }
      resolve( results );
    });
  });
}

module.exports = { connection, getQueryData, startConnection };