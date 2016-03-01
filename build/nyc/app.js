//Import the required modules
var turf = require( "turf" ),
    fs = require('fs'),
    path = require('path'),
    csv = require("fast-csv");

console.log('loading polygons');

var hex = fs.readFileSync('nyc_hex_greater_3.geojson');

hex = JSON.parse(hex);

var din = [];
csv
 .fromPath("nyc_dots_hex_id.csv", {headers: true})
 .on("data", function(data){
     din.push(data); 
 })
 .on("end", function(){
     gatherDots(din);
 });

var newObject = {};

function gatherDots(data) {
    
    for(o in data) {
      if(newObject[data[o].hex_id]){
        newObject[data[o].hex_id].push(data[o].domain);
      } else {
        newObject[data[o].hex_id] = [data[o].domain];
      }
    }
  
    for(var i = 0; i < hex.features.length; i++) {
  
      var hexId = hex.features[i].properties.hex_id;
      
      hex.features[i].properties.domains = newObject[String(hexId)];

    }
  
   fs.writeFileSync('nyc-hex-with-data.json', JSON.stringify(hex));

    console.log('done! happy mapping!');
  
}



