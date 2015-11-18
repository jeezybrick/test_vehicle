angular.module('myApp.services', ['ngResource'])

    .factory('MyVehicles', function ($resource) {
        return $resource('/api/vehicle/:id/',
            {
                id: '@id'
            },
            {
                'update': {method: 'PUT'},
                'get': {method: 'GET', cache: false}
            });
    });