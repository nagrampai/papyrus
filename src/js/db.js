require( 'dotenv' ).config();
const mysql = require( 'mysql' );
const { default: Swal } = require('sweetalert2');

const connection = mysql.createConnection( {
    host: 'localhost',
    user: process.env.DB_USERNAME,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
} );

function startConnection() {
    // Open a DB connection if there is none already open.
    try {
      if (connection.state === 'disconnected') {
        connection.connect();
      }
    } catch (error) {
      throw error;
    }
  }
  

function getQueryData( sqlQuery ) {
    console.log( sqlQuery );
    return new Promise( function ( resolve, reject ) {
        startConnection();
        // eslint-disable-next-line no-unused-vars
        connection.query( sqlQuery, function ( error, results, fields ) {
            if ( error ) {
                return reject( error );
            }
            resolve( results );
        } );
    } );
}

/* function runDBQuery to be deprecated soon */
function runDBQuery( sqlQuery, callback ) {
    console.log( sqlQuery );
    getQueryData( sqlQuery )
        .then( ( results ) => {
            callback( results );
        } )
        .catch( ( err ) =>
            setImmediate( () => {
                Swal.fire( {
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Unable to locate book / member in our record',
                    button: 'OK',
                } );
                throw err;
            } )
        );
}

exports.runDBQuery = runDBQuery;
exports.getQueryData = getQueryData;