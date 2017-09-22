angular.module('app').controller('controller',
  ['$scope', 'WebRequest', function($scope, WebRequest) {

  $scope.handle = {
    username: "",
    contests: {},
    problems: {},
    tags: {},
    total_subs: 0,
    total_verdict: {},
    total_langs: {}
  };

  // consider team submissions
  $scope.team_submssions = false;

  // message will be updated if some request fails
  $scope.handle_error = "";

  $scope.myChartObject = {};

   /*$scope.secondRow = [
       {v: new Date($scope.valid_handles["marianneL"]["problems"]["25483564"]["unix_time"]).toString()},
       {v: $scope.valid_handles["marianneL"]["problems"]["25483564"]["num_submssions"]},
       {v: $scope.valid_handles["marianneL"]["problems"]["25483564"]["name"]},
       {v: 'They are very tall'},
       {v: 25},
       {v: 'Gallantors'},
       {v: 'First Encounter'}
   ];
*/
   $scope.myChartObject.type = "AnnotationChart";

   $scope.myChartObject.data = {
     "cols": [
       {id: "month", label: "Month", type: "date"},
       {id: "submission", label: "submission", type: "number"},
       {id: "kepler-data", label: "Kepler-22b mission", type: "number"},
       {id: "kepler-annot", label: "Kepler-22b Annotation Title", type: "string"},
       {id: "kepler-annot-body", label: "Kepler-22b Annotation Text", type: "string"},
       {id: "desktop-data", label: "Gliese mission", type: "number"},
       {id: "desktop-annot", label: "Gliese Annotation Title", type: "string"},
       {id: "desktop-annot-body", label: "Gliese Annotaioon Text", type: "string"}
   ], "rows": [
       {c: [
           {v: new Date(2314, 2, 15)},
           {v: 19 },
           {v: 'Lalibertines'},
           {v: 'First encounter'},
           {v: 7},
           {v: undefined},
           {v: undefined}
       ]},
       {c: [
           {v: new Date(2314, 2, 17)},
           {v: 0},
           {v: 'Lalibertines'},
           {v: 'All crew lost'},
           {v: 28},
           {v: 'Gallantors'},
           {v: 'Omniscience achieved'}

       ]}
   ]};

   $scope.myChartObject.options = {
     displayAnnotations: true
   };

   $scope.load_graph = function() {
     $scope.myChartObject = {
       "type": "PieChart"
     };
     $scope.myChartObject["data"] = {
         "cols": [{"id": "TypeSubmission", "type": "string"},
                  {"id": "Number", "type": "number"}],
         "rows": []
     };

     for(var key in $scope.handle["total_verdict"]) {
       console.log(key);
       $scope.myChartObject["data"]["rows"].push({
          c: [{v: key}, {v: $scope.handle["total_verdict"][key]}]
       });
     }
   };

  $scope.get_status = function() {
    var URL = "http://codeforces.com/api/user.status?handle=" + $scope.handle["username"];
    var url_id_promise = WebRequest.get(URL);

    url_id_promise.then(function(response) {
      if(!response.data) {
        $scope.handle_error = "Failed :(.";
      }
      else {
        var data = response.data.result;
        for(var j = data.length-1; j >= 0; j--) {
          // problem related data
          var problem_id = data[j]["id"];
          var contest_id = data[j]["contest_id"];
          var problem_name = data[j]["problem"]["name"];
          var problem_index = data[j]["problem"]["index"];
          var problem_tags = data[j]["problem"]["tags"];

          // user related data
          var user_handle = data[j]["author"]["members"][0]["handle"];
          var is_party = data[j]["author"]["teamId"];

          // submission related data
          var unix_time = data[j]["creationTimeSeconds"];
          var lang = data[j]["programmingLanguage"];
          var verdict = data[j]["verdict"];
          var testset = data[j]["testset"];

          if(!is_party) {
            if(testset == "TESTS") {
              if(problem_id in $scope.handle["problems"]) {
                if($scope.handle["problems"][problem_id]["last_verdict"] != "OK") {
                  if(verdict in $scope.handle["total_verdict"]) {
                    $scope.handle["total_verdict"][verdict] += 1;
                  } else {
                    $scope.handle["total_verdict"][verdict] = 1;
                  }
                  if(lang in $scope.handle["total_langs"]) {
                    $scope.handle["total_langs"][lang] += 1;
                  } else {
                    $scope.handle["total_langs"][lang] = 1;
                  }

                  $scope.handle["total_subs"] += 1;
                  $scope.handle["problems"][problem_id]["last_verdict"] = verdict;
                  $scope.handle["problems"][problem_id]["unix_time"] = unix_time;
                }
              }
              else {
                if(verdict in $scope.handle["total_verdict"]) {
                  $scope.handle["total_verdict"][verdict] += 1;
                } else {
                  $scope.handle["total_verdict"][verdict] = 1;
                }

                if(lang in $scope.handle["total_langs"]) {
                  $scope.handle["total_langs"][lang] += 1;
                } else {
                  $scope.handle["total_langs"][lang] = 1;
                }

                $scope.handle["total_subs"] += 1;

                $scope.handle["problems"][problem_id] = {};
                $scope.handle["problems"][problem_id]["contest_id"] = contest_id;
                $scope.handle["problems"][problem_id]["name"] = problem_name;
                $scope.handle["problems"][problem_id]["index"] = problem_index;
                $scope.handle["problems"][problem_id]["tags"] = problem_tags;

                $scope.handle["problems"][problem_id]["last_verdict"] = verdict;
                $scope.handle["problems"][problem_id]["unix_time"] = unix_time;
              }
            }
          }
        }

        $scope.load_graph();
      }
    });
  };

  // get Codeforces data for all handle in scope.handles
  $scope.get_cf_data = function() {

    $scope.handle_error = "";   // clean errors

    var URL = "http://codeforces.com/api/user.info?handles=" + $scope.handle["username"];

    if($scope.handle["username"].length == 0) {
      $scope.handle_error = "Handle can't be empty.";
      return;
    }

    var url_id_promise = WebRequest.get(URL);
    url_id_promise.then(function(response) {
        if(!response.data) {
          $scope.handle_error = "Handle doesn't exist.";
        }
        else {
          var data = response.data.result[0];
          $scope.handle["rank"] = data["rank"];
          $scope.handle["max_rank"] = data["maxRank"];
          $scope.handle["rating"] = data["rating"];
          $scope.handle["max_rating"] = data["maxRating"];
          $scope.handle["avatar"] = data["avatar"];
          $scope.handle["title_photo"] = data["titlePhoto"];
          $scope.handle["registration_time"] = data["registrationTimeSeconds"];
          $scope.handle["last_online_time"] = data["lastOnlineTimeSeconds"];

          $scope.get_status();
        }
      });
  };

}]);
