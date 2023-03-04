// write a function to export csv file from json data
//
// @param {Array} data
// @param {String} filename
// @param {Array} columns
// @param {String} delimiter
// @param {String} newLine
//
// @return {String} csv
//
function exportCSV( data, headers, filename = 'data' ) {

    let csv = headers.join( ',' ) + '\n';
    console.log( data );
    data.forEach( ( row ) => {
        let rowArray = Object.values( row );

        //replace commas in string with empty string
        rowArray = rowArray.map( ( item ) => {
            if ( typeof item === 'string' &&  item.includes( ',' ) ) {
                return `"${ item }"`;
            } else {
                return item;
            }
        } );

        //check if row length is same as headers length
            if ( rowArray.length !== headers.length ) {
                    throw new Error( 'Row and headers length mismatch' );
                } else console.log( 'Row and headers length match' );
            csv += rowArray.join( ',' ) + '\n';
        }
    );

   // Prompt the user to download the CSV file
    var link = document.createElement( 'a' );
    link.setAttribute( 'href', 'data:text/csv;charset=utf-8,' + encodeURIComponent( csv ) );
    link.setAttribute( 'download', `${filename}.csv` );
    link.style.display = 'none';
    document.body.appendChild( link );
    link.click();
    document.body.removeChild( link );
}

exports.exportCSV = exportCSV;
