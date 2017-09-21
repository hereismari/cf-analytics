var app = angular.module('app', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.when('', '/');
  $stateProvider.state('home', {
    url: '/',
    controller: 'controller',
    templateUrl: '/static/app/main_page/home.html'
  });
});
