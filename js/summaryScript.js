/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var squareSize = 50;
var allSegmentData;
var riskLevel = "medium";

function mainSummary() {
 

    loadImages();
   $("#risk_slider").change(function () {
       
        var value = this.value;
        
        switch (value){
            case "0":
                riskLevel = "low";
                break;
            case "1":
                riskLevel = "medium";
                break;
            case "2":
                riskLevel = "high";
            
        }
        $("#risk_selected").html(riskLevel);
        loadImages();
        
    });
    


}

function loadImages() {
    
    $.ajax({
        dataType: "json",
        url: "php/GetAllSegments.php",
        success: function (data) {

            allSegmentData = data;

            drawImages(); // register the event listener before we get the images
            getImagesList();
            

        }
    });



}

function drawImages(){
        
        $("body").on("imagesLoaded", function (e, imagesLoaded) {
        $( "div" ).remove( ".image-holder" );
        for (var im in imagesLoaded) {
            if (imagesLoaded[im].length > 4) {
                var image = $("<img></img>");
                $(image).attr("src", "images/" + imagesLoaded[im]);
                
                $(image).width(squareSize);
                $(image).height(squareSize);
                
                var image_holder = $("<div></div>").addClass("image-holder");
                $(image_holder).attr("id", imagesLoaded[im].replace(".png",""));
                $(image_holder).append(image);
                
                var imageData =getSegmentData(imagesLoaded[im]);
                
                $(image_holder).attr("title",imageData.item_description+" -- "+imageData.risk_rating);
                
               
                var a = getRiskAsNumber(riskLevel.toLowerCase());
                var b = getRiskAsNumber(imageData.risk_rating.toLowerCase());
                
                if ( !(getRiskAsNumber(riskLevel.toLowerCase()) >= getRiskAsNumber(imageData.risk_rating.toLowerCase()) )  ){
                    $(image_holder).addClass("highOpacity");
                }
                
                    
                $("#image_area").append(image_holder);
                
            }
        }
    });
}

function getRiskAsNumber(risk){
    
    switch (risk.toLowerCase()){
        case "low":
            return 0;

        case "medium":
            return 1;
        case "high":
            return 2;
    }
    
}

function getSegmentData(uniqueIdentifier){
    uniqueIdentifier= uniqueIdentifier.replace(".png", "");
    
    for( var s in allSegmentData){
        
        if (allSegmentData[s].reference.toLowerCase() === uniqueIdentifier){
            
            return allSegmentData[s];
            
        }
    }
    
    
}