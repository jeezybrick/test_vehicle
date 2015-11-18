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
    })
    .factory('Settings', function ($resource) {
        return $resource('/api/settings/:id/',
            {
                id: '@id'
            },
            {
                'query': {method: 'GET', isArray: false}
            });
    });