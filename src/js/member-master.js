'use strict';

const { startConnection, runDBQuery } = require('./js/db');

const checkMemberButton = document.getElementById('check-member-button');
const memberNameField = document.getElementById('member-name-textbox');
const editMemberButton = document.getElementById('add-edit-member-button');
const memberUpdateForm = document.getElementById('member-search-form');
const messageArea = document.getElementById('message-container');

checkMemberButton.addEventListener('click', checkMemberButtonHandler);

/**
 * Manage member search event, and query details from DB
 *
 * @param {Object} memberDetails
 */

function checkMemberButtonHandler() {
	const memberFlatNumber =
		document.getElementById('member-flat-number-textbox').value;

    if ( memberFlatNumber.length !== 5 ) {
        alert('Please enter a valid flat number');
        return;
    }
    const memberID = getMemberIDFromFlatNumber(memberFlatNumber);

	const sqlQuery = `SELECT * FROM members WHERE member_id = ${memberID}`;
	runDBQuery(sqlQuery, editMemberDetails);

    /**
     * Display member details if member exists in DB or allow to add member
     *
     * @param {Object} memberDetails
     */

    function editMemberDetails(memberDetails) {
        if ( memberDetails.length > 0 ){ 
            const memberName = memberDetails[0].name;
            //const memberRemarks = memberDetails[0].remarks;
            memberNameField.value = memberName;
            editMemberButton.hidden = false;
            editMemberButton.addEventListener('click', editMemberHandler);
        } else {
            alert('Member not found, create new?');
            editMemberButton.hidden = false;
            editMemberButton.addEventListener('click', addMemberHandler);
        }
    }

     /**
     * Add member details handler
     * 
     * @param {Object} memberDetails
    */
    function addMemberHandler(event){
        event.preventDefault();

        const newMemberName = memberNameField.value;
        const addMemberQuery = `INSERT INTO library.members ( members.member_id, members.name) VALUES('${memberID}', '${newMemberName}' );`;
        runDBQuery(addMemberQuery, () => {
            alert('Member added!');
            editMemberButton.hidden = true;
        });
    }

    /**
     * Edit member details handler
     * 
     * @param {Object} memberDetails
    */
   function editMemberHandler(event){
        event.preventDefault();
        
        if(window.confirm('Are you sure you want to update member details?')){
        const updateMemberQuery = `UPDATE library.members SET name = '${memberNameField.value}' WHERE member_id = '${ memberID.toString() }';`;
        runDBQuery(updateMemberQuery, () => {
                alert('Member details updated!');
                editMemberButton.hidden = true;
            });
        }
    }

/**
 * Convert Wing and flat number to member ID ( number )
 *
 * @param {string} Flat Number
 * @return {number} member ID
 */

    function getMemberIDFromFlatNumber(flatNumber) {
        // Converts wing and flat number to member ID. Eg. - D0703 to 60703
        if (flatNumber.length !== 5) return;

        const wingNumber = flatNumber[0].toUpperCase();
        const flatNumberOnly = flatNumber.split('').slice(1).join('');

        switch (wingNumber) {
            case 'A':
                return Number(`3${flatNumberOnly}`);

            case 'B':
                return Number(`4${flatNumberOnly}`);

            case 'C':
                return Number(`5${flatNumberOnly}`);

            case 'D':
                return Number(`6${flatNumberOnly}`);

            default:
                return null;
	    }
    }
} 