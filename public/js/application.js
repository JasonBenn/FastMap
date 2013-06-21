var map;

google.maps.event.addDomListener(window, 'load', initialize);

function initialize() {
  $.post('/reset_waypoints')
  map = new google.maps.Map(document.getElementById("map-canvas"), buildMapOptions()); 
  
  google.maps.event.addListener(map, 'click', function(event) {
    dropWaypoint(event.latLng);
  });

  $('form').submit(function(event) { 
    event.preventDefault();
    userInput = $(this).find('input').val();
    $(this).find('input').val("");
    translateInputToLatLng(userInput);
  });

  $('#get_directions').click(function(event) {
    event.preventDefault();
    $.ajax('/waypoints/get_directions', {
      beforeSend: function(directions) { 
        $('#directions_and_waypoints').html("Thinking..."); 
      },
      success: function(latLngArray) { 
        $('#directions_and_waypoints').html("SUCCESS");
        console.log(latLngArray);
      },
      timeOut: 5000,
      error: function() { $('#directions_and_waypoints').html('DAMNIT') }
    });
  });

  setDroppableAndDraggable();
};

function buildDirectionsRequest() {

};

function dropWaypoint(latLng, latLngHasMethods) {
  translateLatLngToAddress(latLng);
  map.panTo(latLng);
  var markerOptions = buildMarkerOptions( {position: latLng} )
  new google.maps.Marker(markerOptions);
  rebuildWaypoints();
}

function rebuildWaypoints() {
  $.ajax('/waypoints/all', {
    beforeSend: function() { $('#waypoints').html("refreshing...") },
    success: function(data) { 
      $('#waypoints').html(data);
      $('.draggable').draggable({
        revert: 'invalid',
        snap: 'h2',
        snapMode: "inner",
        cursorAt: { top: 26, left: 182 }
      });
      $('.droppable').droppable({
        activeClass: "draggable_hover"
      }); 
    }
  });
};

function buildMarkerOptions(customOptions) {
  return $.extend(customOptions, {
    animation : google.maps.Animation.DROP,
    map : map
  });
};

function buildMapOptions(customOptions) {
  return $.extend(customOptions, {
    center: new google.maps.LatLng(-22.909700912054472, -43.17523956298828),
    zoom: 14,
    mapTypeId: google.maps.MapTypeId.HYBRID
  });
};

function translateLatLngToAddress(latLng) {
  var queryString = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' +
    latLng.lat() + ',' + latLng.lng() + 
    '&sensor=false';

  $.ajax(queryString, {
    success: function(data) { 
      var address_bits = data.results[0].address_components.slice(0, 3);
      address = address_bits.map(function(data){ return data.long_name }).join(', ');
      saveWaypoint(latLng, address);
    },
    async: false
  });
}

function saveWaypoint(latLng, address) {
  $.post('/waypoints/save', {
    lat: latLng.lat(), 
    lng: latLng.lng(),
    address: address
  });
};

function translateInputToLatLng(userInput) {
  var queryString = 'http://maps.googleapis.com/maps/api/geocode/json?address=' + 
    userInput.split(' ').join('+') + 
    '&sensor=false';

  $.get(queryString, function(data) {
    var waypoint = data.results[0].geometry.location;
    var latLng = new google.maps.LatLng(waypoint.lat, waypoint.lng);
    dropWaypoint(latLng);
  });
};

function setDroppableAndDraggable() {
  $('h2').droppable({
    activeClass: "draggable_hover"
  });

  $('h2#first_waypoint').on('drop', function(event, eventInfo) { 
    $.post('/waypoints/set_first_waypoint', { address: eventInfo.draggable.text() } );
  });

  $('h2#last_waypoint').on('drop', function(event, eventInfo) { 
    $.post('/waypoints/set_last_waypoint', { address: eventInfo.draggable.text() } );
  });
};



// Version 2: Div on the right that has two drop down menu that allows user to choose
// the coordinates that should be first and last. Design: where do buttons go? What
// do buttons read? FIRST, LAST, GO!
// Version 3: submit first, waypoints, last: print directions on right. Uses DirectionsResult
// Version 4: draw lines between points.
// Version 5: Map re-centers automatically after every point addition. Read about zoom level.
// Version 6: Deploy to Heroku
// Version 7: Styles!!
// Version 8: Link on directions to print-friendly styles!!
// After this: put it on website.
// Traveling salesman problem
