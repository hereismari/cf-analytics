angular.module('app').controller('controller',
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

  
   $scope.myChartObject = {};
    
    $scope.myChartObject.type = "BarChart";
    
    $scope.onions = [
        {v: "Onions"},
        {v: 3},
    ];

    $scope.myChartObject.data = {"cols": [
        {id: "t", label: "Topping", type: "string"},
        {id: "s", label: "Slices", type: "number"}
    ], "rows": [
        {c: [
            {v: "Mushrooms"},
            {v: 3},
        ]},
        {c: $scope.onions},
        {c: [
            {v: "Olives"},
            {v: 31}
        ]},
        {c: [
            {v: "Zucchini"},
            {v: 1},
        ]},
        {c: [
            {v: "Pepperoni"},
            {v: 2},
        ]}
    ]};

    $scope.myChartObject.options = {
        'title': 'How Much Pizza I Ate Last Night'
    }; 

}]);
