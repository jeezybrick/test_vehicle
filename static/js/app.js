
angular
    .module('myApp', [

        'ngResource',
        'ngMaterial',
        'ngAnimate',
        'myApp.services',
        'openlayers-directive'

    ])
    .config(function ($locationProvider, $httpProvider, $resourceProvider, $interpolateProvider,
                      $compileProvider) {

        // CSRF Support
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

        $resourceProvider.defaults.stripTrailingSlashes = false;

        // Force angular to use square brackets for template tag
        // The alternative is using {% verbatim %}
        $interpolateProvider.startSymbol('[[').endSymbol(']]');

        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);


    });