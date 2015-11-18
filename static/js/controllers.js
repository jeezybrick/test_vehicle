angular
    .module('myApp')
    .controller('HomeController', HomeController);

function HomeController($scope, MyVehicles, $mdDialog, olData) {

    //init
    var i = 0,
        j = 0,
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


    /**
     * Add render icons and lines of locations for each vehicle
     */
    $scope.renderIcons = function () {


        $scope.markers = [];
        $scope.coordinates = [];


        olData.getMap().then(function (map) {

            /**
             * remove previous layers form map
             */
            if ($scope.oldLayers) {
                for (var n = 0; n < $scope.oldLayers.length; n++) {
                    map.removeLayer($scope.oldLayers[n]);
                }
                $scope.oldLayers = [];

            }

            for (i = 0; i < $scope.vehicles.length; i++) {

                if ($scope.vehicles[i].visible === true) {
                    // create marks for each vehicle
                    for (j = 0; j < $scope.vehicles[i].location_set.length; j++) {

                        // vehicle detail
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

                        $scope.markers.push(temp); // push each object detail in arr
                        $scope.coordinates.push([temp.lon, temp.lat]); // locations of each vehicle


                    }

                    var points = []; // coordinates for lines

                    for (var q = 0; q < $scope.coordinates.length; q++) {

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
            }

        });


    };


    /**
     * toggle checkbox of vehicle visibility
     */
    $scope.toggleVisibleVehicle = function (index) {
        $scope.vehiclesLoad = false;


        $scope.vehicles[index].$update(function (response) {

            $scope.renderIcons();
            $scope.vehiclesLoad = true;

        }, function (error) {

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
