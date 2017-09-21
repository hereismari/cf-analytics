angular.module('app') .controller('controller',
  ['$scope', 'WebRequest', function($scope, WebRequest) {

  var URL = "http://codeforces.com/api/user.info?handles=DmitriyH;Fefer_Ivan";
  var url_id_promise = WebRequest.get(URL);

  $scope.name = "";
  $scope.test = "";  

  url_id_promise.then(function(response) {
    if(!response.data) {
      $scope.test = 'Invalid username';
    }
    else {
      $scope.test = response.data;  
    }
  });

}]);
