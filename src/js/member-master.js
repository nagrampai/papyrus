const { default: Swal } = require('sweetalert2');
const { getQueryData } = require( '../js/db' );
const { getMemberIDFromFlatNumber } = require( '../js/members' );

const memberSearchForm = document.getElementById( 'member-search-form' );
const checkMemberButton = document.getElementById( 'check-member-button' );
const memberFlatNumberField = document.getElementById( 'member-flat-number-textbox' );
const memberNameField = document.getElementById( 'member-name-textbox' );
const memberMobileField = document.getElementById( 'member-mobile-textbox' );
const memberDetailsForm = document.getElementById( 'member-details-form' );
const editMemberButton = document.getElementById( 'add-edit-member-button' );

memberSearchForm.addEventListener( 'submit', checkMemberButtonHandler );

/**
 * Manage member search event, and query details from DB
 *
 * @param {Object} memberDetails
 */

function checkMemberButtonHandler(e) {
    e.preventDefault();
    const memberFlatNumber = memberFlatNumberField.value;

    if ( memberFlatNumber.length !== 5 ) {
        Swal.fire( {
            icon: 'error',
            title: 'Invalid flat number',
            text: 'Please enter a valid flat number',
            button: 'OK',
        } );
        return;
    }
    const memberID = getMemberIDFromFlatNumber( memberFlatNumber );

    const memberSearchQuery = `SELECT * FROM members WHERE member_id = ${memberID}`;

    getQueryData( memberSearchQuery )
        .then( ( result ) => {
            checkMemberDetails( result );
            memberDetailsForm.hidden = false;
        } )
        .catch( ( err ) => {
            console.log(err);
            Swal.fire( {
                icon: 'error',
                title: 'Member not found',
                text: 'Please create a new member if needed.',
                button: 'OK',
            } );

            checkMemberButton.hidden = true;
            editMemberButton.addEventListener( 'click', addMemberHandler );
            memberSearchForm.hidden = true;
            memberDetailsForm.hidden = false;
            throw err;
        } );


    /**
     * Display member details if member exists in DB or allow to add member
     *
     * @param {Object} memberDetails
     */

    function checkMemberDetails( memberDetails ) {
        memberNameField.value = memberDetails[0].name;
        memberMobileField.value = memberDetails[0].mobile ?? null;
        checkMemberButton.hidden = true;
        editMemberButton.hidden = false;
        editMemberButton.disabled = false;
        editMemberButton.addEventListener( 'click', editMemberHandler );
    }
    
    /**
     * Add member details handler
     *
     * @param {Object} event
     */
    function addMemberHandler( event ) {
        event.preventDefault();

        const newMemberName = memberNameField.value;
        const newMemberMobile = memberMobileField.value;
        const addMemberQuery = `INSERT INTO library.members ( members.member_id, members.name, members.mobile) VALUES('${memberID}', '${newMemberName}', '${newMemberMobile}' );`;
        console.log( addMemberQuery );
        getQueryData( addMemberQuery )
            .then( ( result ) => {
                console.log( result );
                Swal.fire( {
                    icon: 'success',
                    title: 'Member added',
                    button: 'OK',
                } ).then ( () => {
                    location.reload();
                } );
            } )
            .catch( ( err ) => {
                console.log( err );
                Swal.fire( {
                    icon: 'error',
                    title: 'Error adding member',
                    button: 'OK',
                } );
                throw err;
            } );
    }

    /**
     * Edit member details handler
     *
     * @param {Object} event
     */
    function editMemberHandler( event ) {
        event.preventDefault();

        Swal.fire({
            title: 'Have you thought about it?',
            text: 'Are you sure you want to update member details?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
          }).then((result) => {
            if (result.isConfirmed) {
                const updateMemberQuery = `UPDATE library.members SET name = '${memberNameField.value}', 
                mobile = '${memberMobileField.value}' WHERE member_id = '${memberID.toString()}';`;

                getQueryData( updateMemberQuery )
                    .then( ( result ) => {
                        console.log( result );
                        Swal.fire( {
                            icon: 'success',
                            title: 'Member details updated',
                            button: 'OK',
                        } ).then ( () => {
                            location.reload();
                        } );       
                    } )
                    .catch( ( err ) => {
                        console.log( err );
                        Swal.fire( {
                            icon: 'error',
                            title: 'Error updating member details',
                            button: 'OK',
                        } ).then ( () => {
                            location.reload();
                        } );
                        throw err;
                    } );
            } else return;
        });
    }
}
