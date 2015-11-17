angular
    .module('myApp')
    .controller('HomeController', HomeController);

function HomeController($scope, MyVehicles, $mdDialog, olData) {
    var i = 0,
        j = 0,
        backDays = 1;
    $scope.markers = [];
    $scope.endDate = new Date();
    $scope.startDate = new Date();
    $scope.startDate.setDate($scope.startDate.getDate() - backDays);
    $scope.vehiclesLoad = false;
    $scope.vehiclesLoadError = false;
    $scope.vectorLineLayer = '';


    $scope.renderIcons = function () {

        olData.getMap().then(function (map) {
            if (angular.isDefined($scope.vectorLineLayer)) {
                map.removeLayer($scope.vectorLineLayer);
            }

        });

        $scope.markers = [];
        $scope.coordinates = [];

        olData.getMap().then(function (map) {
            for (i = 0; i < $scope.vehicles.length; i++) {

                if ($scope.vehicles[i].visible === true) {
                    // create marks for each vehicle
                    for (j = 0; j < $scope.vehicles[i].location_set.length; j++) {


                        var temp = {
                            name: $scope.vehicles[i].name,
                            lon: $scope.vehicles[i].location_set[j].longitude,
                            lat: $scope.vehicles[i].location_set[j].latitude,
                            label: {
                                message: '<div class="vehicle-popup">' +
                                '<h3>ts:<small>' + moment($scope.vehicles[i].location_set[j].ts).format('YYYY-MM-DD') + '</small></hr>' +
                                '<h3>name:<small>' + $scope.vehicles[i].name + '</small></hr>' +
                                '<h3>longitude:<small>' + $scope.vehicles[i].location_set[j].longitude + '</small></hr>' +
                                '<h3>latitude:<small>' + $scope.vehicles[i].location_set[j].latitude + '</small></hr>' +
                                '</div>',
                                show: false,
                                showOnMouseOver: true
                            },
                            draggable: true
                        };

                        $scope.markers.push(temp); // push each object in arr
                        $scope.coordinates.push([temp.lon, temp.lat]);

                        // push coordinates here

                    }

                    //function

                    // map.removeLayer($scope.vectorLineLayer);
                    var points = [];

                    for (var q = 0; q < $scope.coordinates.length; q++) {

                        points[q] = ol.proj.transform($scope.coordinates[q], 'EPSG:4326', 'EPSG:3857');
                    }

                    var featureLine = new ol.Feature({
                        geometry: new ol.geom.LineString(points)
                    });

                    var vectorLine = new ol.source.Vector({});
                    vectorLine.addFeature(featureLine);

                    $scope.vectorLineLayer = new ol.layer.Vector({
                        source: vectorLine,
                        style: new ol.style.Style({
                            fill: new ol.style.Fill({color: '#00FF00', weight: 4}),
                            stroke: new ol.style.Stroke({color: '#00FF00', width: 2})
                        })
                    });


                    map.addLayer($scope.vectorLineLayer);
                    $scope.coordinates = [];

                    //clean coordinates
                }

            }
        });
        angular.extend($scope, {
            center: {
                lat: 0,
                lon: 0,
                autodiscover: true
            },

            markers: $scope.markers,
            defaults: {
                layers: {
                    main: {
                        source: {
                            type: 'OSM',
                            url: 'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
                        }
                    }
                },
                interactions: {
                    mouseWheelZoom: true
                },
                controls: {
                    zoom: false,
                    rotate: false,
                    attribution: false
                }
            },

        });


    };


    $scope.toggleVisibleVehicle = function (index) {
        $scope.vehiclesLoad = false;


        $scope.vehicles[index].$update(function (response) {

            $scope.renderIcons();
            $scope.vehiclesLoad = true;

        }, function (error) {

        });

    };

    $scope.sortByDate = function () {
        $scope.vehiclesLoad = false;

        $scope.vehicles = MyVehicles.query(params = {
            date_from: $scope.startDate,
            date_to: $scope.endDate
        }, function () {
            $scope.renderIcons();
            $scope.vehiclesLoad = true;

        }, function () {
            $scope.vehiclesLoadError = false;
        });

    };

    $scope.showReport = function (ev, index) {

        $scope.chooseVehicle = $scope.vehicles[index];

        $mdDialog.show({
            controller: ModalController,
            templateUrl: 'static/modals/report_modal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            locals: {
                vehicle: $scope.vehicles[index],
                startDate: $scope.startDate,
                endDate: $scope.endDate
            }
        })
            .then(function () {

            }, function () {

            });

    };


    $scope.vehicles = MyVehicles.query(function (response) {

        $scope.renderIcons();

        $scope.vehiclesLoad = true;

    }, function (error) {

        $scope.vehiclesLoadError = error;

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


angular
    .module('myApp')
    .controller('ModalController', ModalController);

function ModalController($scope, $mdDialog, vehicle, startDate, endDate) {

    $scope.vehicle = vehicle;
    $scope.endDate = endDate;
    $scope.startDate = startDate;

    $scope.closeDialog = function () {
        $mdDialog.hide();
    }

}
