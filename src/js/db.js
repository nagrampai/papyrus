require( 'dotenv' ).config();
const mysql = require( 'mysql' );

const connection = mysql.createConnection( {
    host: 'localhost',
    user: process.env.DB_USERNAME,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
} );

function startConnection() {
    console.log( process.env );
    // Open a DB connection if there is none already open.
    if ( connection.state === 'disconnected' ) {
        connection.connect( ( error ) => {
            if ( error ) {
                throw error;
            }
        } );
    }
}

function getQueryData( sqlQuery ) {
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

function runDBQuery( sqlQuery, callback ) {
    console.log( sqlQuery );
    getQueryData( sqlQuery )
        .then( ( results ) => {
            callback( results );
        } )
        .catch( ( err ) =>
            setImmediate( () => {
                // eslint-disable-next-line no-alert, no-undef
                alert( 'Unable to locate book / member in our record' );
                throw err;
            } )
        );
}

//module.exports = { runDBQuery };

exports.runDBQuery = runDBQuery;
