/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function initAnnotator() {
    $("#save_button").show();
    $("#prevWork").show();
    $("#segment_data input").prop("disabled", false);
    $("#segment_data textarea").prop("disabled", false);



    $("#save_button").click(
            function () {
                $("#segment_data").submit(function (e)
                {
                    var postData = $(this).serializeArray();
                    var uniqueIdentifier = postData[0].value;
                    var geometry;

//                    for ( var f in postData){
//                            if (postData[f].name === "Geometry"){
//                                geometry  = postData[f].value;
//                                geometry["Xres"] = resolution_x;
//                                geometry["Yres"] = resolution_y;
//
//                             //   alert ( geometry );
////                                postData[f].value = JSON.stringify(geometry);
////                                alert(postData[f].name +"  ---- "+postData[f].value);
//                            break;
//                            }
//                    }

//                            = JSON.parse(postData[28].value);


                    $("#" + currentSegment).attr("segmentID", uniqueIdentifier);

                    if (uniqueIdentifier.length > 0) {
                        storedSegments[uniqueIdentifier] = postData;
                        var formURL = $(this).attr("action");
                        $.ajax(
                                {
                                    url: formURL,
                                    type: "POST",
                                    data: postData,
                                    success: function (data, textStatus, jqXHR)
                                    {
                                        $("#information_menu").html("new Segment saved!.")
                                        $("#segment_report").hide();
                                    },
                                    error: function (jqXHR, textStatus, errorThrown)
                                    {
                                        alert("Error saving segment!");
                                    }
                                });

                    } else {
                        alert("Need to specify an ID for the segment.");
                    }
                    e.preventDefault(); //STOP default action
                    e.stopImmediatePropagation();
                    e.stopPropagation();

//                    e.unbind(); //unbind. to stop multiple form submit.
                });

                $("#segment_data").submit(); //Submit  the FORM
            }
    );

    fabric.util.addListener(window, 'keydown', function (e) {
        if (e.keyCode === 16) {
            addingAnnotation = true;
        }
    });

    fabric.util.addListener(window, 'keyup', function (e) {
        addingAnnotation = false;
        if (e.keyCode === 13) { // when enter is pressed draw the new annotation polygon.

            drawPolygon(fabricCanvas);

        } else if (e.keyCode === 107) {
            if (selectedAnnotation !== null) {
                selectedAnnotation.bringForward();
            }
        } else if (e.keyCode === 109) {
            if (selectedAnnotation !== null) {
                selectedAnnotation.sendBackwards();
            }

        } else if (e.keyCode === 27) {
            stopAnnotation();
        }
    });

    fabricCanvas.observe("mouse:down", function (event) {

        var pos = fabricCanvas.getPointer(event.e);
        if (addingAnnotation || event.keyCode === 16) {
            if ( user.toLowerCase() !== "guest"){
                drawSelectionPoint(fabricCanvas, pos.x, pos.y);
                //alert (user);
            }
        }


        if (event.target) {
            selectedAnnotation = event.target;

            $("#information_menu").html(event.target.uniqueId + " --> " + UID_2_SID[event.target.uniqueId.toLowerCase()]);

            if (!addingAnnotation) {
                $("#" + UID_2_SID[event.target.uniqueId.toLowerCase()]).click();
            }
            console.log('an object was clicked!: ' + event.target.type + " " + event.target.id);
        }

    });

    return true;
}
