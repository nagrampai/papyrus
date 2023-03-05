/**
 *  Creates a table row with the given cell data
 * 
 * @param { Array } cellData 
 * @param { Node } parentTable 
 * @param { Boolean } ifHeader 
 * 
 */
function createTableRow( cellData, parentTable, ifHeader = false ){
    const cell = document.createElement( ifHeader ? 'th' : 'td' );
    cell.innerHTML = cellData;
    cell.classList.add( 
            'border', 
            'border-solid', 
            'border-black',
            'p-0',  
            'text-center'
        );
    parentTable.appendChild( cell );
} 

exports.createTableRow = createTableRow;
