/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
UID_2_SID = [];
SID_2_UID = [];

var existingImagesList = [];


function drawImage() {

    canvas = document.createElement('canvas');
    // $("body").append(canvas);

    var imageHolder = document.getElementById("picture");
    imageHolder.src = currentImage;

    var imageObj = new Image();

    canvas.width = imageHolder.width;
    canvas.height = imageHolder.height;

    imageObj.onload = function () {
        //ctx.getImageData(10,10,50,50);
        //            $("#hidden_canvas").width(imageObj.width);
        //            $("#hidden_canvas").height(imageObj.height);

        //ctx.drawImage(imageObj, 0, 0);

        cropping_canvas = document.createElement('canvas');
        cropping_canvas.width = imageHolder.width * 2;
        cropping_canvas.height = imageHolder.height * 2;

        cropping_ctx = cropping_canvas.getContext("2d");



        console.log("loaded: " + currentImage);
        ctx = canvas.getContext("2d");
        ctx.webkitImageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;

        ctx.drawImage(imageObj, 0, 0, imageObj.width, imageObj.height, // source rectangle
                0, 0, canvas.width, canvas.height); // destination rectangle

        cropping_ctx.drawImage(imageObj, 0, 0, imageObj.width, imageObj.height, // source rectangle
                0, 0, cropping_canvas.width, cropping_canvas.height); // destination rectangle

        $(document).trigger("pageLoaded", {hello: "hi"});
        // alert("Draw image called ");

        //0.08026315789473684 0.09461663947797716 0.2275693311582382 0.21842105263157896
    };

    imageObj.src = currentImage;
}

function drawMini(imageData, uniqueIdentifier) {

    if (imageData === null) {
        return null;
    }

    var found = 0;
    $("#side_menu_area").children().each( function( index, elem ) {
        if( $( elem ).attr("uniqueidentifier") === uniqueIdentifier){
            found = 1;
        }
    });

    if(found > 0 ){
        return;
    }


    var side_canvas = document.createElement('canvas');
    side_canvas.className = "sideMenuCanvas";
    side_canvas.id = "segment-" + $("#side_menu_area").children().length;

    UID_2_SID[uniqueIdentifier] = side_canvas.id;
    if (uniqueIdentifier === undefined) {
        SID_2_UID[side_canvas.id] = uniqueIdentifier;
    } else {
        SID_2_UID[side_canvas.id] = uniqueIdentifier.toLowerCase();
    }

    var side_ctx = side_canvas.getContext("2d");

    side_canvas.width = imageData.width;
    side_canvas.height = imageData.height;

    side_ctx.putImageData(imageData, 0, 0);

    // Creating image in folder if does not exist
    try { // it shouldnt be a show stopper.
        if(!isImageCreated(uniqueIdentifier)){
            createImage(uniqueIdentifier,imageData);
        }
    }catch (e ){
        console.log(e);
    }
    //


    $("#side_menu_area").prepend(side_canvas);


    // $("#" + side_canvas.id).width($("#side_menu_area").width() * 0.42);
    $("#" + side_canvas.id).width($("#side_menu_area").width() * 0.42);
    $("#" + side_canvas.id).height($("#side_menu_area").width() * 0.42);

    if (typeof uniqueIdentifier === 'undefined') {
        $("#" + side_canvas.id).attr("uniqueIdentifier", "");
    } else {
        $("#" + side_canvas.id).attr("uniqueIdentifier", uniqueIdentifier);
    }
    activeAnnotation.segmentID = "#" + side_canvas.id;
    $("#information_menu").html(activeAnnotation.segmentID);

    $("#" + side_canvas.id).attr("geometry", JSON.stringify(activeAnnotation.geometry));

    $("#" + side_canvas.id).hover(function (e) {


        var currentSegment = $(this).attr("id");
        console.log("Hovered: " + currentSegment);
        var currentPolygonId = SID_2_UID[currentSegment];
        var oldObjects = fabricCanvas.getObjects();
        for (j in oldObjects) {
            var obj = oldObjects[j];
            if (obj.uniqueId.toLowerCase() === currentPolygonId) {
                $("#information_menu").html(obj.uniqueId.toLowerCase() + " ---  > " + currentPolygonId);
                obj.setFill('yellow');
                if ($("#hideAnnotationsSwitch").prop('checked')){ obj.setOpacity(0.2); }

                fabricCanvas.renderAll();
                break;
            }
        }
    },
            function (e) {


                var currentSegment = $(this).attr("id");
                console.log("Hovered out: " + currentSegment);
                var currentPolygonId = SID_2_UID[currentSegment];
                var oldObjects = fabricCanvas.getObjects();
                for (j in oldObjects) {
                    var obj = oldObjects[j];
                    if (obj.uniqueId.toLowerCase() === currentPolygonId) {
                        obj.setFill('blue');
                        if ($("#hideAnnotationsSwitch").prop('checked')){ obj.setOpacity(0.0); }
                        fabricCanvas.renderAll();
                        break;
                    }
                }
            });

    $("#" + side_canvas.id).click(function (e) {

        currentSegment = $(this).attr("id");

        var currentGeometry = $("#" + currentSegment).attr("geometry");


        var uniqueID = $(this).attr("uniqueIdentifier");

        if (loadSegmentContentsOnForm(uniqueID) === null) {

            for (var f in fields) {
                var field = fields[f];
                $("#" + field).val("");
            }

            $("#Description").val(activeAnnotation.text);
        }

        var cgeo = JSON.parse(currentGeometry);
        if (cgeo.points === undefined) {
            cgeo = JSON.parse(cgeo);
        }

        if (cgeo.points.length < 1) {
            currentGeometry = activeAnnotation.geometry;
        }

        $("#Geometry").val(currentGeometry);


        var im = new Image();

        im.onload = function () {

            $("#report_image").attr("src", imageData.URL);
            $("#segment_report").show();

            $("#report_image").css("top", "0px");
            $("#report_image").css("left", "0px");
            $("#report_image").width($("#report_image_area").width());

            var segmentData = storedSegments[ $("#" + currentSegment).attr("segmentID")  ];

            for (var d in segmentData) {
                var data = segmentData[d];
                $("#" + data.name).val(data.value);
            }

        };


        im.src = imageData.URL;

    });
}


function getFiles() {
    var items = [];
    $.getJSON("php/ListFiles.php", function (data) {

        $.each(data, function (key, val) {
            items.push(val);
        });

        $("#Page_select").html("");

        for (var i in items) {
            var item = items[i];
            $("#Page_select").append('<option value="' + item + '" onclick="changePage(\'low/' + item + '\');" >' + item + '</option>');
        }
    });
}

function changePage(page) {
    $("#loading-screen").show();
    $("#side_menu_area").empty();

    localStorage['visited'] = page;

    currentImage = page;
    $("#back_image").attr("src", page);

    drawImage();
    initialiseImage("#image_area", currentImage);

    $(document).on("pageLoaded", function (e) {

        var pagesArray = currentImage.split(".")[0].split("/")[1].split("-");
        var data = "page1=" + pagesArray[0] + "&page2=" + pagesArray[1];

        $.ajax({
            dataType: "json",
            url: "php/GetSegments.php?" + data,
            success: function (data) {
                storedSegments = {};
                storedSegmentsNames = [];
                segmentsToDrawNames = [];

                $.each(data, function (key, val) {

                    storedSegments[val.reference.toLowerCase()] = val;
                    storedSegmentsNames.push(val.reference.toLowerCase());

                    var geo = val.geometry;
                    if (geo !== null && geo.length > 0) {
                        segmentsToDrawNames.push(val.reference.toLowerCase());
                    }

                });

                createForm();

                while (segmentsToDrawNames.length > 0) {
                    var segment = segmentsToDrawNames.pop();
                    var seg = function (segment) {
                        var geo;
                        var testgeo = storedSegments[segment].geometry;
                        try {
                            if ( typeof(testgeo) === "object"){
                                geo = testgeo;
                            } else {
                                geo = JSON.parse(testgeo);
                            }
                        } catch(err) {
                            alert (typeof(testgeo) );
                           alert (err);
                        }


                        if (geo.type !== undefined && geo.points.length > 0) {
                            geo.relPoints = getRelativePoints(geo);

                            storedSegments[segment].geometry = geo;
                            activeAnnotation = storedSegments[segment];

                            $("#information_menu").html(activeAnnotation.reference);

                            var cropData = getPolygonCrop(geo, activeAnnotation.reference);

                            if (cropData === null) {
                                console.log("invalid crop data");
                            } else {
                                drawMini(cropData, segment);
                                var absPoints = translatePoints(geo.relPoints);
                                justDrawPolygon(absPoints, activeAnnotation);
                            }

                        }
                        return segment;
                    };
                    console.log(seg(segment));
                }
            }
        });

        e.stopImmediatePropagation();
        e.stopPropagation();
        $("#loading-screen").hide();
    });


}


function translatePoints(relativePoints) {

    var absolutePoints = [];

    for (var p in relativePoints) {
        var point = relativePoints[p];

        point.x = point.x * resolution_x;
        point.y = point.y * resolution_y;

        absolutePoints.push(point);
    }

    return absolutePoints;
}


/**
 * Fills up the form with the segment information.
 *
 * @param {type} uniqueIdentifier unique idenfier as defined by Kerry.
 * @returns {undefined} nothing.
 */
function loadSegmentContentsOnForm(uniqueIdentifier) {
    var segmentData = storedSegments[uniqueIdentifier];
    if (segmentData === undefined) {
        return null;
    }

    for (var d in fields) {
        var field = fields[d].toString();

        if (field !== 'Geometry') {
            var data = segmentData[field.toLowerCase()];
            $("#" + field).val(data);
            //var data = segmentData[field.toLowerCase()];
            //$("#" + field).val(JSON.stringify(activeAnnotation.geometry));
        }
    }
}


/**
 * Recreates the form from the side menu segments, adding functionality for submitting segments to the DB.
 *
 * @returns {undefined}
 */
function createForm() {
    // create fields in form
    $("#segment_data").empty();

    var segmentSelector = "<div id='prevWork'> Previous Work Selector: <select id='segmentSelect'>";
    for (var s in storedSegmentsNames) {
        var uniqueIdentifier = storedSegmentsNames[s];

        var segmentOption = '<option value="' + uniqueIdentifier + '">' + uniqueIdentifier + '</option>';
        segmentSelector = segmentSelector + segmentOption;

    }
    segmentSelector = segmentSelector + "</select> </div> <br><hr style='margin-top: 5px;'> ";

    $("#segment_data").append(segmentSelector);

    $('#segmentSelect').on('change', function () {
        //alert(  ); // or $(this).val()
        loadSegmentContentsOnForm(this.value);
    });

    $('#segmentSelect').on('keypress', function () {
        //alert(  ); // or $(this).val()
        loadSegmentContentsOnForm(this.value);
    });


    var dataFields = "<table id = 'columns' style='width:95%; margin-left: 5%;'>";

    var bigFields = [];
    bigFields.push("Copyright_Credits".toLowerCase());
    bigFields.push("Related_Links".toLowerCase());
    bigFields.push("Contributor_Information".toLowerCase());
    bigFields.push("Item_Description".toLowerCase());
    bigFields.push("Risk_Notes".toLowerCase());
    bigFields.push("Item_Notes_".toLowerCase());

    for (var field in fields) {
        var field_id = fields[field];

        var field_text = field_id.replace("QQMM", "?").replace("qqmm", "?").replace("_", " ").replace("_", " ").replace("_", " ").replace("_", " ");



        if (bigFields.indexOf(field_id.toLowerCase()) > -1) {
            dataFields = dataFields+'<tr id="' + field_id + '_cont" class="form_input"><td style="width: 216px; font-weight: bold;">' + field_text + '</td><td><textarea id="' + field_id + '" type="text" name="' + field_id + '" cols="40" rows="5"></textarea></td> </tr>';
        } else {
            dataFields = dataFields+'<tr id="' + field_id + '_cont" class="form_input"><td style="width: 216px; font-weight: bold;">' + field_text + '</td><td><input id="' + field_id + '" type="text" name="' + field_id + '"></td> </tr>';
        }
    }

//    dataFields = dataFields+$("#segment_data").append('</div>');
    //dataFields = dataFields+'</div>';

    $("#segment_data").append( dataFields+"</table>" );

    $("#segment_data").append("<button id='toggle_extra' style='float: right; margin-right: 43%; margin-top: 40px; height: 35px; margin-bottom: 50px;' type='button' onclick='toggleExtraFields();'> Click Here For More Information </button>")

    toggleExtraFields();

    //$("#segment_data").append( "<hr>" );

    $("#segment_data").append('<input type="text" class="hidden" name="option" value="insert">');

  //  $("#segment_data").append('<button id="toggle_extra" type="button" onclick="toggleExtraFields();"> More Information </button> ');

    $("#segment_data").append('<button id="save_button" type="button"> Save </button> ');
    $("#save_button").hide();

    $("#Geometry_cont").hide();
    $("#prevWork").hide();

    $("#quit_button").click(function () {
        $("#segment_report").hide();
    });

    $("#segment_data input").prop("readonly", true);
    $("#segment_data textarea").prop("readonly", true);

}

function toggleExtraFields() {
    for (var field in initially_hidden_fields) {
        var field_id = initially_hidden_fields[field];
        $("#" + field_id + "_cont").toggle();
    }

    if (user === "guest") {
        hideUserFields();
    }
}

function hideUserFields() {
    for (var field in user_hidden_fields) {
        var field_id = user_hidden_fields[field];
        $("#" + field_id + "_cont").hide();
    }
}



function ClearAuthentication(LogOffPage)
{
    var IsInternetExplorer = false;

    try
    {
        var agt = navigator.userAgent.toLowerCase();
        if (agt.indexOf("msie") != -1) {
            IsInternetExplorer = true;
        }
    }
    catch (e)
    {
        IsInternetExplorer = false;
    }
    ;

    if (IsInternetExplorer)
    {
        // Logoff Internet Explorer
        document.execCommand("ClearAuthenticationCache");
        window.location = LogOffPage;
    }
    else
    {
        // Logoff every other browsers
        $.ajax({
            username: 'unknown',
            password: 'WrongPassword',
            url: './cgi-bin/PrimoCgi',
            type: 'GET',
            beforeSend: function (xhr)
            {
                xhr.setRequestHeader("Authorization", "Basic AAAAAAAAAAAAAAAAAAA=");
            },
            error: function (err)
            {
                window.location = LogOffPage;
            }
        });
    }
}

function getImagesList(){

    $.ajax({
            dataType: "json",
            url: "php/ListImages.php",

        success: function (data) {

            existingImagesList = data;
            $( "body" ).trigger( "imagesLoaded",[existingImagesList] );
            //return existingImagesList;
        }

    });

}

function createImage(uniqueIdentifier,base64data){

    $.ajax({
    type: "POST",
    url: "php/SaveImage.php",
    data: {uniqueId: uniqueIdentifier, img: base64data.URL},
    contentType: "application/x-www-form-urlencoded;charset=UTF-8"});

}

function isImageCreated(uniqueIdentifier){
    var exists = false;

    $.each(existingImagesList,function(a,b){

        exists = uniqueIdentifier === b ? true : false;

    });

    return exists;
}

function initViewer() {

    getImagesList();


    $("#picture").width(resolution_x);
    $("#picture").height(resolution_y);

    $("#report_image").draggable();
    $("#login-screen").draggable();

    $('#loginform').on('submit', function(e){

        initializeAnnotatorRole(); $("#login-screen").hide();


        e.preventDefault();

    });



    $("#report_image").width($("#report_image_area").width());
    $("#report_image").dblclick(function (e) {
        $("#report_image").width($("#report_image").width() * 1.25);
        // $("#report_image").height($("#report_image").height()/1.25);
    });

    $('#report_image').bind('contextmenu', function (e) {
        $("#report_image").width($("#report_image").width() / 1.25);
        // do stuff here instead of normal context menu
        return false;
    });

    $("#loading-screen").hide();

    getFiles();

    var pageVisited = localStorage['visited'];
    if (pageVisited) {
        // open popup
        currentImage = pageVisited;
        $("#Page_select").val(pageVisited.replace("low/", ""));
    }

    createForm();

    $("#Page_select").change(function () {
        changePage("low/" + this.value);

    });

    $("#segment_report").hide();
    $("#risk_slider").change(function () {
        switch (this.value) {
            case "0":
                $("#risk_selected").html("<b><font color='green'>Low</font></b>");
                break;
            case "1":
                $("#risk_selected").html("<b><font color='GoldenRod'>Medium</font></b>");
                break;
            case "2":
                $("#risk_selected").html("<b><font color='red'>High</font></b>");
                break;
            case "3":
                $("#risk_selected").html("<b><font color='red'>OFF</font></b>");
                break;
            default:
                $("#risk_selected").html("didnt work");
                break;
        }
        changePage(currentImage);
    });
    $("#risk_slider").change();

}


function zoom(zoomin) {
//    if (zoomin) {
        $('body').css('zoom', parseFloat($('body').css('zoom')) + ( zoomin ? 0.1 : -0.1 ));
//    } else {
//        $('body').css('zoom', parseFloat($('body').css('zoom')) - 0.1);
//    }
}
