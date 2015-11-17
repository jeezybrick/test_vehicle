angular
    .module('myApp')
    .controller('HomeController', HomeController);

function HomeController($scope, MyVehicles, $mdDialog) {
    var i = 0,
        j = 0,
        backDays = 1;
    $scope.markers = [];
    $scope.endDate = new Date();
    $scope.startDate = new Date();
    $scope.startDate.setDate($scope.startDate.getDate() - backDays);
    $scope.vehiclesLoad = false;
    $scope.vehiclesLoadError = false;


    $scope.renderIcons = function () {

        $scope.markers = [];
        for (i = 0; i < $scope.vehicles.length; i++) {
            if ($scope.vehicles[i].visible === true) {
                // create marks for each vehicle
                for (j = 0; j < $scope.vehicles[i].location_set.length; j++) {

                    var temp = {
                        name: $scope.vehicles[i].name,
                        lon: $scope.vehicles[i].location_set[j].longitude,
                        lat: $scope.vehicles[i].location_set[j].latitude,
                        label: {
                            message: 'Finisterre',
                            show: true,
                            showOnMouseOver: true
                        },
                        draggable: false
                    };

                    $scope.markers.push(temp); // push each object in arr

                }
            }

        }

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
    $scope.endDate = startDate;
    $scope.startDate = endDate;

    $scope.closeDialog = function() {
          $mdDialog.hide();
        }

}