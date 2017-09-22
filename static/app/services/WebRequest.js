angular.module('app').service('WebRequest', function($http) {
    this.get = function(url) {
      return $http.get(url).then(
        // successs
        function(response) {
          return response;
        },
        // failed
        function(failed_response) {
          return failed_response;
        }
      );
}});
