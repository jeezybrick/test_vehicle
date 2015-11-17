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
    .factory('AuthUser', function ($resource) {
        return $resource('/api/user/:id/'
        , {id: '@id'}, {
            'update': {method: 'PUT'},
            'get': {method: 'GET'},
            'query': {method: 'GET', isArray: false}
        });
    });