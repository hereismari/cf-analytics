var app = angular.module('app', ['ui.router', 'ngAnimate']);

app.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.when('', '/');
  $stateProvider.state('home', {
    url: '/',
    controller: 'controller',
    templateUrl: '/static/app/main_page/home.html'
  });
  $stateProvider.state('about', {
    url: '/about',
    templateUrl: '/static/app/about/about.html'
  });
  $stateProvider.state('issues', {
    url: '/issues',
    templateUrl: '/static/app/issues/issues.html'
  });
});

