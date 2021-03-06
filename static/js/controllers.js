angular
    .module('myApp')
    .controller('HomeController', HomeController);

function HomeController($scope, MyVehicles, $mdDialog, $mdToast, olData, Settings) {

    //init
    var i = 0,
        j = 0,
        q = 0,
        w = 0, // var for max_points limit
        backDays = 1; // 24 hours start date

    $scope.markers = [];
    $scope.endDate = new Date();
    $scope.startDate = new Date();
    $scope.startDate.setDate($scope.startDate.getDate() - backDays);
    $scope.vehiclesLoad = false;
    $scope.vehiclesLoadError = false;
    $scope.vectorLineLayer = '';
    $scope.oldLayers = [];
    $scope.lineColors = ['red', 'blue', '#00FF00']; // colors of lines

    // toast position
    var last = {
        bottom: true,
        top: false,
        left: true,
        right: false
    };
    $scope.toastPosition = angular.extend({}, last);
    $scope.getToastPosition = function () {
        sanitizePosition();
        return Object.keys($scope.toastPosition)
            .filter(function (pos) {
                return $scope.toastPosition[pos];
            })
            .join(' ');
    };
    function sanitizePosition() {
        var current = $scope.toastPosition;
        if (current.bottom && last.top) current.top = false;
        if (current.top && last.bottom) current.bottom = false;
        if (current.right && last.left) current.left = false;
        if (current.left && last.right) current.right = false;
        last = angular.extend({}, current);
    }


    /**
     * Add render icons and lines of locations for each vehicle
     */
    $scope.renderIcons = function () {


        $scope.markers = [];
        $scope.coordinates = [];
        w = 0;


        olData.getMap().then(function (map) {

            /**
             * remove previous layers from map
             */
            if ($scope.oldLayers) {
                for (var n = 0; n < $scope.oldLayers.length; n++) {
                    map.removeLayer($scope.oldLayers[n]);
                }
                $scope.oldLayers = [];

            }

            for (i = 0; i < $scope.vehicles.length; i++) {

                if ($scope.vehicles[i].is_visible === true) {
                    // create marks for each vehicle
                    for (j = 0; j < $scope.vehicles[i].location_set.length; j++) {

                        w++; // var for max_points limit

                        // vehicle detail
                        var temp = {
                            name: $scope.vehicles[i].name,
                            lon: $scope.vehicles[i].location_set[j].longitude,
                            lat: $scope.vehicles[i].location_set[j].latitude,

                            // popup message and settings
                            label: {
                                message: '<div class="vehicle-popup">' +
                                '<h4>Ts:<small>' + moment($scope.vehicles[i].location_set[j].ts).format('YYYY-MM-DD') + '</small></h4>' +
                                '<h4>Name:<small>' + $scope.vehicles[i].name + '</small></h4>' +
                                '<h4>Longitude:<small>' + $scope.vehicles[i].location_set[j].longitude + '</small></h4>' +
                                '<h4>Latitude:<small>' + $scope.vehicles[i].location_set[j].latitude + '</small></h4>' +
                                '</div>',
                                show: false,
                                showOnMouseOver: true
                            },
                            draggable: true
                        };

                        $scope.markers.push(temp); // push each object detail in arr
                        $scope.coordinates.push([temp.lon, temp.lat]); // locations of each vehicle

                        // break loop if max_points <= draw points
                        if ($scope.settings.max_points <= w) {
                            break;
                        }


                    }

                    var points = []; // coordinates for lines

                    for (q = 0; q < $scope.coordinates.length; q++) {

                        points[q] = ol.proj.transform($scope.coordinates[q], 'EPSG:4326', 'EPSG:3857');
                    }

                    var featureLine = new ol.Feature({
                        geometry: new ol.geom.LineString(points)
                    });

                    var vectorLine = new ol.source.Vector({});
                    vectorLine.addFeature(featureLine);

                    // add layers of lines
                    $scope.vectorLineLayer = new ol.layer.Vector({
                        source: vectorLine,
                        style: new ol.style.Style({
                            fill: new ol.style.Fill({color: $scope.lineColors[i], weight: 4}),
                            stroke: new ol.style.Stroke({color: $scope.lineColors[i], width: 2})
                        })
                    });


                    map.addLayer($scope.vectorLineLayer);
                    $scope.oldLayers.push($scope.vectorLineLayer); // add vector in arr for remove after re-render
                    $scope.coordinates = [];

                }

                // break loop if max_points <= draw points
                if ($scope.settings.max_points <= w) {
                    break;
                }
            }

        });

    };

    // set map settings
    angular.extend($scope, {
            center: {
                lat: 0,
                lon: 0,
                zoom: 2,
                autodiscover: true // for discover your current position
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
                    zoom: true,
                    rotate: false,
                    attribution: false
                }
            }

        });

    /**
     * toggle checkbox of vehicle visibility
     */
    $scope.toggleVisibleVehicle = function (index) {
        $scope.vehiclesLoad = false;


        $scope.vehicles[index].$update(function (response) {

            $scope.renderIcons();
            $scope.vehiclesLoad = true;

        }, function (error) {
            $scope.maxVisibleVehiclesError = error.data.is_visible.toString();

            // error toast
            $mdToast.show(
                $mdToast.simple()
                    .content($scope.maxVisibleVehiclesError)
                    .position($scope.getToastPosition())
                    .hideDelay(3000)
                    .theme('error-toast')
            );


            $scope.vehiclesLoad = true;
        });

    };

    /**
     * sort locations of vehicle by date
     */
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

    /**
     * show modal with report with location and details of vehicle for a specified time
     */

    $scope.showReport = function (ev, index) {


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

    /**
     * get settings
     */

    $scope.settings = Settings.query(function (response) {


    }, function (error) {


    });

    /**
     * get list of vehicles
     */

    $scope.vehicles = MyVehicles.query(function (response) {

        $scope.renderIcons();

        $scope.vehiclesLoad = true;

    }, function (error) {

        $scope.vehiclesLoadError = error;

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
