
var map;
var currentDomain;

function map() {

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/rgdonohue/cihje6km800twrom4lkfdtfxv',
        center: [-73.989, 40.734],
        zoom: 12
//        ,
//        minZoom: 10,
//        maxZoom: 14
    });
    
    var lilmap = new maboxgl.Map({
        container: 'lilmap'
    })
    map.addControl(new mapboxgl.Navigation({position: 'top-left'}));

    map.on('style.load', function () {
        map.flyTo({
            center: [ -73.989, 40.734],
            zoom: 11.89
        });
        
        loadData();
    });
}

function loadData() {

    queue()
    .defer(d3.json, 'data/berlin_hex.json')
    .defer(d3.json, 'data/london_hex.json')
    .defer(d3.json, 'data/nyc_hex.json')
    .await(function(error, berlin, london, nyc) {
        if (error) throw error;
        drawMap(berlin, london, nyc);
    });
}

function drawMap(berlinData, londonData, nycData) {

    currentDomain = 'nyc';

    var layerFill = {
        'fill-color': 'rgba(255, 255, 0, 0)',
        'fill-opacity': 1
    },
    layerHover = {
        'line-color': 'rgba(157, 185, 159, .6)',
        'line-width': 2
    };
    
    // add new york

    map.addSource('nycHex', {
      'type': 'geojson',
        'data': nycData
    });

    map.addLayer({
      'id': 'nyc-hex',
      'type': 'fill',
      'source': 'nycHex',
      'layout': {},
      'interactive': true,
      'paint': layerFill
    });
    map.addLayer({
      'id': 'nyc-hover',
      'type': 'line',
      'source': 'nycHex',
      'layout': {},
      'paint': layerHover,
      'filter': ["==", "id", ""]
    });

    // add london

    map.addSource('londonHex', {
      'type': 'geojson',
        'data': londonData
    });

    map.addLayer({
      'id': 'london-hex',
      'type': 'fill',
      'source': 'londonHex',
      'layout': {},
      'interactive': true,
      'paint': layerFill
    });
    map.addLayer({
      'id': 'london-hover',
      'type': 'line',
      'source': 'londonHex',
      'layout': {},
      'paint': layerHover,
      'filter': ["==", "name", ""]
    });
    
    // add berlin

    map.addSource('berlinHex', {
      'type': 'geojson',
        'data': berlinData
    });

    map.addLayer({
      'id': 'berlin-hex',
      'type': 'fill',
      'source': 'berlinHex',
      'layout': {},
      'interactive': true,
      'paint': layerFill
    });
    map.addLayer({
      'id': 'berlin-hover',
      'type': 'line',
      'source': 'berlinHex',
      'layout': {},
      'paint': layerHover,
      'filter': ["==", "name", ""]
    });

    
    addUI(map);
    addNavigation(map);

} // end drawMap()

function addUI(map) {
    var $ulLeft = $('.output-left ul'),
        $ulRight = $('.output-right ul'),
        hovering = true;
    
    map.on("mousemove", function(e) {
        if(hovering) {
            map.featuresAt(e.point, {
                radius: .1,
                layer: ["berlin-hex", "london-hex", "nyc-hex"]
            }, function (err, features) {

                if (!err && features.length) {

                map.setFilter(currentDomain+"-hover", ["==", "hex_id", features[0].properties.hex_id]);

                $ulLeft.html('');
                $ulRight.html('');

                for(var i = 0; i < features[0].properties.domains.length; i++) {
                    // split the output left and right
                    if(i % 2 == 0) {
                        $ulLeft.append('<li>'+colorDomain(features[0].properties.domains[i])+'</li>');
                    } else {
                        $ulRight.append('<li>'+colorDomain(features[0].properties.domains[i])+'</li>');
                    } 
                }

                } else {
                    $ulLeft.html('');
                    $ulRight.html('');
                }
            }); // end featuresAt callback function
        } // end if hovering
    }); // end on mouse move

  map.on("click", function(e) {
     map.featuresAt(e.point, {
      radius: .1,
      layer: ["berlin-hex", "london-hex", "nyc-hex"]
    }, function (err, features) {

        if (!err && features.length) {
          if(!hovering) {
            hovering = true;
          } else {
            hovering = false;
          }
        }
     });
  });   
    
} // end addUI

function colorDomain(tin) {

    var base = tin.split(".")[1];

    if(base == 'nyc') {
        var className = 'nyc';
    } else if (base == 'london') {
        var className = 'london';
    } else if (base == 'berlin') {
        var className = 'berlin';
    }
    var http = '<a class="domain" target="_blank" href="http://'+tin+'">';
    var domain = "<span>"+tin.split(".")[0]+"</span>";
    return http + domain + '.' + "<span class='"+className+"'>"+tin.split(".")[1]+"</span></a>";
}

function addNavigation(map) {
    
    $('#nyc').fadeIn(2000, function() {
        $('#london').fadeIn(300, function() {
            $('#berlin').fadeIn(300);
        });
    });

    $('#nyc').click(function() {
        map.flyTo({
            center: [-73.989, 40.734],
            zoom: 11.89
        });
        map.fitBounds(map.getBounds(), {
            maxZoom: 14
        });
        
        map.setLayerZoomRange('nyc-hex', 10, 14);

        currentDomain = 'nyc';
        $('#london').addClass('button-opaque');
        $('#berlin').addClass('button-opaque');
        $('#nyc').removeClass('button-opaque');
    });
    $('#london').click(function() {

        map.flyTo({
          center: [-.13, 51.51],
          zoom: 10
        });

        currentDomain = 'london';
        $('#berlin').addClass('button-opaque');
        $('#nyc').addClass('button-opaque');
        $('#london').removeClass('button-opaque');
    });
    $('#berlin').click(function() {

        map.flyTo({
          center: [13.38, 52.51],
          zoom: 10
        });
        $('#london').addClass('button-opaque');
        $('#nyc').addClass('button-opaque');
        $('#berlin').removeClass('button-opaque');

        currentDomain = 'berlin';
    });

} // end addNavigation()