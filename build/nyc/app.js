//Import the required modules
var turf = require( "turf" ),
    fs = require('fs'),
    path = require('path'),
    csv = require("fast-csv");

console.log('loading polygons');

var hex = fs.readFileSync('nyc-hex.json');

hex = JSON.parse(hex);

var din = [];
csv
 .fromPath("nyc_domains_with_hexagonID.csv", {headers: true})
 .on("data", function(data){
     din.push(data); 
 })
 .on("end", function(){
     gatherDots(din);
 });

var newObject = {};

function gatherDots(data) {
    
    for(o in data) {
      if(newObject[data[o].hexagonID]){
        newObject[data[o].hexagonID].push(data[o].domain_);
      } else {
        newObject[data[o].hexagonID] = [data[o].domain_];
      }
    }
  
    for(var i = 0; i < hex.features.length; i++) {
  
      var hexId = hex.features[i].properties.hexagonID;
      
      hex.features[i].properties.domains = newObject[String(hexId)];

    }
  
   fs.writeFileSync('nyc-hex-with-data.json', JSON.stringify(hex));

    console.log('done! happy mapping!');
  
}



