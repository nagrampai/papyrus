const { runDBQuery } = require( './js/db' );
const { getMemberIDFromFlatNumber } = require( './js/members' );

const checkMemberButton = document.getElementById( 'check-member-button' );
const memberFlatNumberField = document.getElementById(
    'member-flat-number-textbox'
);
const memberNameField = document.getElementById( 'member-name-textbox' );
const editMemberButton = document.getElementById( 'add-edit-member-button' );

checkMemberButton.addEventListener( 'click', checkMemberButtonHandler );

/**
 * Manage member search event, and query details from DB
 *
 * @param {Object} memberDetails
 */

function checkMemberButtonHandler() {
    const memberFlatNumber = memberFlatNumberField.value;

    if ( memberFlatNumber.length !== 5 ) {
        alert( 'Please enter a valid flat number' );
        return;
    }
    const memberID = getMemberIDFromFlatNumber( memberFlatNumber );

    const sqlQuery = `SELECT * FROM members WHERE member_id = ${memberID}`;
    runDBQuery( sqlQuery, editMemberDetails );

    /**
     * Display member details if member exists in DB or allow to add member
     *
     * @param {Object} memberDetails
     */

    function editMemberDetails( memberDetails ) {
        if ( memberDetails.length > 0 ) {
            const memberName = memberDetails[0].name;
            //const memberRemarks = memberDetails[0].remarks;
            memberNameField.value = memberName;
            editMemberButton.hidden = false;
            editMemberButton.disabled = false;
            editMemberButton.addEventListener( 'click', editMemberHandler );
        } else {
            memberNameField.value = '';
            alert( 'Member not found, create new?' );
            editMemberButton.hidden = false;
            editMemberButton.disabled = false;
            editMemberButton.addEventListener( 'click', addMemberHandler );
        }
    }

    /**
     * Add member details handler
     *
     * @param {Object} event
     */
    function addMemberHandler( event ) {
        event.preventDefault();

        const newMemberName = memberNameField.value;
        const addMemberQuery = `INSERT INTO library.members ( members.member_id, members.name) VALUES('${memberID}', '${newMemberName}' );`;
        runDBQuery( addMemberQuery, () => {
            alert( 'Member added!' );
            editMemberButton.hidden = true;
            editMemberButton.disabled = true;
            memberNameField.value = '';
            memberFlatNumberField.value = '';
        } );
    }

    /**
     * Edit member details handler
     *
     * @param {Object} event
     */
    function editMemberHandler( event ) {
        event.preventDefault();

        if ( window.confirm( 'Are you sure you want to update member details?' ) ) {
            const updateMemberQuery = `UPDATE library.members SET name = '${
                memberNameField.value
            }' WHERE member_id = '${memberID.toString()}';`;
            runDBQuery( updateMemberQuery, () => {
                alert( 'Member details updated!' );
                editMemberButton.hidden = true;
                editMemberButton.disabled = true;
            } );
        }
    }
}
