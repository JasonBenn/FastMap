var map;
var markersArray = [];

google.maps.event.addDomListener(window, 'load', initialize);

function initialize() {
  hideMapTime(1500);

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
    var prom;

    $.ajax('/waypoints/order', {
      beforeSend: function(directions) { 
        animateFadeInputs();
      },
      success: function(latLngArray) {         
        clearMarkers();
        var directionsService = new google.maps.DirectionsService();
        var directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById('google_directions'));

        var request = buildRequest(latLngArray);
        directionsService.route(request, function(response, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
          }
        });
        animateReveal();
      }, // end success function
    }); // end AJAX call to order waypoints
  }); // end get directions click listener

  setDroppableAndDraggable();
};

function buildRequest(latLngArray) {
  return {
    origin: latLngArray.first.waypoint.address,
    destination: latLngArray.last.waypoint.address,
    waypoints: buildAddressArray(latLngArray),
    optimizeWaypoints: true,
    travelMode: google.maps.DirectionsTravelMode.DRIVING
  }
};

function buildAddressArray(latLngArray) {
  return latLngArray.waypoints.map(function(e) { 
    return { 
      location: e.waypoint.address,
      stopover: true
    }
  });
};

function animateFadeInputs() {
  $('#directions_and_waypoints').animate({
    'opacity': 0
  }, 1000)

  $('#map-canvas').animate({
    'width': '68%'
  }, 1000, function() { google.maps.event.trigger(map, "resize"); });

  prom = $('input').animate({
    'opacity': 0
  }, 1000);

  $('#google_directions').animate({
    'right': '0%',
  }, 1000);
}

function animateReveal() {
  $('#google_directions').animate({
    'color': '#444',
    'opacity': 1,
    'background-color': 'white'
  }, 1000);

  $('#google_directions .adp-substep').animate({
    'border-top-color': '#cdcdcd'
  }, 1000);

  $('tbody img').animate({
    'opacity': 1
  }, 1000);
}

function dropWaypoint(latLng, latLngHasMethods) {
  translateLatLngToAddress(latLng);
  map.panTo(latLng);
  var markerOptions = buildMarkerOptions( {position: latLng} )
  marker = new google.maps.Marker(markerOptions);
  markersArray.push(marker);
  rebuildWaypoints();
}

function clearMarkers() {
  for (i in markersArray) {
    markersArray[i].setMap(null);
  }
}

function rebuildWaypoints() {
  $.ajax('/waypoints/all', {
    beforeSend: function() { $('#waypoints').html("refreshing...") },
    success: function(data) { 
      $('#waypoints').html(data);
      $('.draggable').draggable({
        revert: 'invalid',
        snap: 'h2',
        snapTolerance: 30,
        snapMode: "inner",
        cursorAt: { top: 26, left: 182 },
        scroll: false,
        zIndex: 100,
        appendTo: '#directions_and_waypoints'
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
    center: new google.maps.LatLng(55.797228397339055, 12.368545532226562),
    zoom: 13,
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

function hideMapTime(timing) {
  setTimeout(function() {
    $('#maptime').animate({'opacity': 0}, 300, function() {
      $('#maptime').css({'z-index': '-1'});
    });
  }, timing);
};