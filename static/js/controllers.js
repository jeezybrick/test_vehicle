angular
    .module('myApp')
    .controller('HomeController', HomeController);

function HomeController($scope, MyVehicles) {

    var i = 0,
        j = 0;

    $scope.vehicles = MyVehicles.query(function (response) {

        $scope.iconFeatures = []; // mark array

        for (i = 0; i < $scope.vehicles.length; i++) {

            // create marks for each vehicle
            for (j = 0; j < $scope.vehicles[i].location_set.length; j++) {

                var iconFeature = new ol.Feature({
                    geometry: new ol.geom.Point(
                        ol.proj.transform([$scope.vehicles[i].location_set[j].longitude, // add x
                                $scope.vehicles[i].location_set[j].latitude],// add y
                            'EPSG:4326',
                            'EPSG:3857'
                        )),
                    name: $scope.vehicles[i].name, // vehicle name
                    ts: $scope.vehicles[i].ts, // vehicle location time
                });

                $scope.iconFeatures.push(iconFeature); // push each object in arr

            }

        }

        // create vector for marks
        var vectorSource = new ol.source.Vector({
            features: $scope.iconFeatures//add an array of features
        });

        // add style for marks
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                anchor: [0.5, 46],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 0.75,
                src: 'static/images/icon.png'
            }))
        });

        // add style for lines
        var lineStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                anchor: [0.5, 46],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 0.75,
                src: 'static/images/icon.png'
            }))
        });


        // create layer for icons
        var vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: iconStyle
        });

        var coordinates = [[78.65, -32, 65], [-98.65, 12.65]];

        var layerLinesTest = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [new ol.Feature({
                    geometry: new ol.geom.LineString(coordinates),
                    name: 'Line'
                })]
            })
        });

        // new map with all marks and lines
        var map = new ol.Map({
            layers: [new ol.layer.Tile({source: new ol.source.OSM()}), vectorLayer, layerLinesTest],
            target: document.getElementById('map'),
            view: new ol.View({
                center: [0, 0],
                zoom: 2
            })
        });

        // popup for marks
        var element = document.getElementById('popup');

        // add overlay on map
        var popup = new ol.Overlay({
            element: element,
            positioning: 'bottom-center',
            stopEvent: false
        });
        map.addOverlay(popup);


        // display popup on mouse move
        map.on('pointermove', function (evt) {
            var feature = map.forEachFeatureAtPixel(evt.pixel,
                function (feature, layer) {
                    return feature;
                });
            if (feature) {
                var geometry = feature.getGeometry();
                var coord = geometry.getCoordinates();
                popup.setPosition(coord);

                //displaying content
                var content = [
                    'Name:' + feature.get('name') + '<br>',
                    'Date:' + feature.get('ts') + '<br>',
                ];
                $(element).popover({
                    'placement': 'top',
                    'html': true,
                    'content': content
                });
                $(element).popover('show');

            } else {
                $(element).popover('destroy');
            }
        });

        // change mouse cursor when over marker
        $(map.getViewport()).on('mousemove', function (e) {
            var pixel = map.getEventPixel(e.originalEvent);
            var hit = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
                return true;
            });
            if (hit) {
                map.getTarget().style.cursor = 'pointer';
            } else {
                map.getTarget().style.cursor = '';
            }
        });

    }, function () {

    });


    // Some functions for sidebar

    function applyMargins() {
        var leftToggler = $(".mini-submenu-left");
        if (leftToggler.is(":visible")) {
            $("#map .ol-zoom")
                .css("margin-left", 0)
                .removeClass("zoom-top-opened-sidebar")
                .addClass("zoom-top-collapsed");
        } else {
            $("#map .ol-zoom")
                .css("margin-left", $(".sidebar-left").width())
                .removeClass("zoom-top-opened-sidebar")
                .removeClass("zoom-top-collapsed");
        }
    }

    function isConstrained() {
        return $(".sidebar").width() == $(window).width();
    }

    function applyInitialUIState() {
        if (isConstrained()) {
            $(".sidebar-left .sidebar-body").fadeOut('slide');
            $('.mini-submenu-left').fadeIn();
        }
    }

    $(function () {
        $('.sidebar-left .slide-submenu').on('click', function () {
            var thisEl = $(this);
            thisEl.closest('.sidebar-body').fadeOut('slide', function () {
                $('.mini-submenu-left').fadeIn();
                applyMargins();
            });
        });

        $('.mini-submenu-left').on('click', function () {
            var thisEl = $(this);
            $('.sidebar-left .sidebar-body').toggle('slide');
            thisEl.hide();
            applyMargins();
        });

        $(window).on("resize", applyMargins);

        applyInitialUIState();
        applyMargins();
    });

}