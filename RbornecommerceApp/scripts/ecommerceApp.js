//
// E-Commerce Usage Demo App
//
// This sample is provided to show how an app may use the e-commerce API for usage based licensing.
// The app also makes use of several UI widgets which are described in the EIP  Software Developers Kit
//
//

// Global variables used through app

// Unitname is passed to trackUsage, and should match the name of the units selected when the app is uploaded to the App Gallery
var unitName = 'Copy Jobs';
var theme = "blue";
var entitledStatusCode = 0;
var httpStatusCode;

// Wait for document to finish loaded before setting up widgets
$(function () {

    $("#action_bar").addClass(theme);

    // This is our scrollable container for the app content
    $("#demoContent").xrxscrollable({
        tap: false,
        theme: theme
    });

    // This button widget calls the isEntitled function in this file
    // Search "button" in the EIP Software Developers Kit for information on this 9th Gen widget
    $('#callIsEntitled').xrxbutton({
        text: true,
        theme: theme
    })

    $('#callIsEntitled').on("click", function () {
        $('#numUnits').getkeyboard().close();
        isEntitled();
    });

    // This button widget calls the trackUsage function in this file
    // Search "button" in the EIP Software Developers Kit for information on this 9th Gen widget
    $('#callTrackUsage').xrxbutton({
        text: true,
        theme: theme
    })

    $('#callTrackUsage').on("click", function () {
        $('#numUnits').getkeyboard().close();
        var numUnitsSpec = parseInt(document.getElementById("numUnits").value);
        trackUsage(unitName, numUnitsSpec);
    });

    // This button widget closes the app
    // Search "button" in the EIP Software Developers Kit for information on this 9th Gen widget
    $('#exit').xrxbutton({
        icons: {
            glyph: "glyphicon-exit"
        },
        text: false,
        theme: theme
    })

    $('#exit').on("click", function () {
        ExitCUIMode(); return false;
    });

    // This banner is displayed by the calculateUsage function if there are less than 10% of units left
    // Search "Banner" in the EIP Software Developers Kit for information on this 9th Gen widget
    $("#banner").xrxbanner({
        bannerType: "simple",
        bannerTimeout: 2000
    });

    // This button widget opens the units popover
    // Search "button" in the EIP Software Developers Kit for information on this 9th Gen widget
    $("#btnUnits").xrxbutton({
        text: true,
        theme: theme
    });

    // This popover widget that prompts the user to select the unit name
    // This popover is displayed when the Units button is clicked
    // Search "popover" in the EIP Software Developers Kit for information on this 9th Gen widget
    $("#unit-popover").xrxpopover({
        theme: theme,
        arrowPosition: "xrx-arrow-right",
        targetControl: "#btnUnits",
        tap: true
    });

    // The keyboard widget for entering the name of the units
    // This widget appears in the popup when "Custom" is selected from the popover
    // Search "Keyboard/Keypad" in the EIP Software Developers Kit for information on this 9th Gen widget
    $('#keyboard').xrxkeyboard({
        appendLocally: false,
        theme: theme,
    });

    // The keyboard widget for entering the number of Units
    // Search "Keyboard/Keypad" in the EIP Software Developers Kit for information on this 9th Gen widget
    $('#numUnits').xrxkeyboard({
        initialPlaceholder: "Number to Consume",
        layout: 'xrxNum-signedDecimal',
        theme: theme
    });

    // This popup widget that prompts the user to enter the custom unit name
    // This popup is displayed when "Custom" is selected from the popover
    // Search "Popup" in the EIP Software Developers Kit for information on this 9th Gen widget
    $("#popup").xrxpopup({
        title: "Enter Custom Unit Name",
        focusControl: "#keyboard",
        height: "200px",
        width: "700px",
        theme: theme,
        close: function (event, ui) {
            unitName = $("#keyboard").val();
            $("#btnUnits-text").html(unitName);
        },
    });

    // This is the popup widget that prompts the user to enter the custom unit name
    // This popup is displayed when "Custom" is selected from the popover
    // Search "Popup" in the EIP Software Developers Kit for information on this 9th Gen widget
    $("#unitSelect").xrxsegmentedcontrol({
        type: "textonly",
        theme: theme,
        themePrimary: true,
        height: 270,
        width: 200,
        select: function (event, ui) {
            unitName = $("#unitSelect").val();
            if (unitName == "Custom") {
                $("#popup").xrxpopup("open");
            }
            $("#btnUnits-text").html(unitName);
        }
    });

});



// This function calls track usage and feeds the return values into local variables/ UI
function trackUsage(unit, usage) {
    window.Entitlements.TrackUsage(unit, usage).then(function (error, result, xhr) {
        // Save the http status code 
        httpStatusCode = xhr.status;

        if (error) {
            switch (httpStatusCode) {
                case 404:
                    reportResult("TrackUsage() failed. Verify unit name and units consumed are correct.");
                    break;
                case 403:
                    reportResult("TrackUsage() failed. License expired or usage is depleted.");
                    break;
                default:
                    reportResult("TrackUsage() failed.");
            }

        } else {
            reportResult("TrackUsage() was sucessful.")
        }

    });
}


// This function calls the isEntitled method of the App Gallery API and prases the response
function isEntitled() {
    window.Entitlements.IsEntitled().then(function (error, result, xhr) {
        // Save the http status code
        httpStatusCode = xhr.status;

        if (error) {
            reportResult("IsEntitled() failed.");
        } else {
            var entitled = JSON.parse(result);

            // Save the status code
            statusCode = entitled.entitledStatusCode;

            // Format the success message based on the status code
            var successMessage = "IsEntitled() suceeded. ";
            switch (statusCode) {
                case 1:
                    reportResult(successMessage + "Entitled Status: 1 - Ok");
                    break;
                case 2:
                    reportResult(successMessage + "Entitled Status: 2 - Developer Mode");
                    break;
                case 3:
                    reportResult(successMessage + "Entitled Status: 3 - Developer Mode Expired");
                    break;
                case 4:
                    reportResult(successMessage + "Entitled Status: 4 - Payment Required");
                    break;
                case 5:
                    reportResult(successMessage + "Entitled Status: 5 - License Expired");
                    break;
                case 6:
                    reportResult(successMessage + "Entitled Status: 6 - License Not Found");
                    break;
                case 7:
                    reportResult(successMessage + "Entitled Status: 7 - Usage Exceeded");
                    break;
                case 8:
                    reportResult(successMessage + "Entitled Status: 8 - Internal Server Error");
                    break;
                case 9:
                    reportResult(successMessage + "Entitled Status: 9 - Processing Order");
                    break;
                default:
                    reportResult(successMessage);
            }


            // usage can be null if the app is not entitled
            if (entitled.usage && entitled.usage[0]) {
                // Display returned values from isEntitled call
                document.getElementById('remainingUnits').innerHTML = entitled.usage[0].remaining;
                document.getElementById('usedUnits').innerHTML = entitled.usage[0].consumed;

                //use the returned unit name for the labels in the UI
                document.getElementById('unitRemaininLabel').innerHTML = entitled.usage[0].unit + " remaining:";
                document.getElementById('unitUsedLabel').innerHTML = entitled.usage[0].unit + " consumed:";
            }

            // remainingDays can be null if the app is not entitled
            if (entitled.remainingDays) {
                document.getElementById('remainingDays').innerHTML = entitled.remainingDays;
            }
            document.getElementById('entitled').innerHTML = entitled.isEntitled;


        }
    });
}

// This function reports the return values and status of the trackUsage call - uses the banner widget
function reportResult(message) {
    document.getElementById('httpStatus').innerHTML = "Http Status: " + httpStatusCode;
    document.getElementById('bannerMessage').innerHTML = message;
    $('#banner').xrxbanner('call');
}

document.documentElement.style.overflow = 'hidden';
