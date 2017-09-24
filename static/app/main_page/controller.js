angular.module('app').controller('controller',
  ['$scope', 'WebRequest', function($scope, WebRequest) {

  // stores all the user's data
  $scope.handle = { username: "" , problems: {}};

  // this message will be updated and desplayed if some request fails
  $scope.handle_error = "";

  // only true when all data is loaded
  $scope.loaded = false;

  // only true while loading data
  $scope.loading = false;

  // chart types
  $scope.chart_types = ["AreaChart", "PieChart", "ColumnChart", "LineChart", "Table", "BarChart"];
  $scope.chart_verdict_select = {"options": "PieChart"};
  $scope.chart_tags_select = {"options": "BarChart"};

  // charts
  $scope.chart_verdict = {};
  $scope.chart_tags = {};
  $scope.chart_contests = {};

  // chart metrics for contest chart
  $scope.contest_metrics = ["rank", "new rating", "number of solved problems"];
  $scope.chart_contests_select = {"options": "rank"};

  // sort dictionary by value
  $scope.sort_dict = function(dict) {
    // create items array
    var items = Object.keys(dict).map(function(key) {
        return [key, dict[key]];
    });

    // sort the array based on the second element
    items.sort(function(first, second) {
        return second[1] - first[1];
    });

    return items;
  };

  // clear user's data
  $scope.clear_handle = function(){
   $scope.handle["contests"] = {};
   $scope.handle["problems"] = {};
   $scope.handle["contests"] = {};
   $scope.handle["tags"] = [];
   $scope.handle["total_subs"] = 0;
   $scope.handle["total_verdict"] = {};
   $scope.handle["total_langs"] = {};
   $scope.handle["unsolved"] = [];
   $scope.handle["first_try"] = [];
  };

  $scope.load_graphs = function(){
    $scope.load_graph_verdict();
    $scope.load_graph_tags();
    $scope.load_graph_contests();
    $scope.loading = false;
    $scope.loaded = true;
  };

  $scope.load_graph_contests = function() {

    $scope.chart_contests = {
      "type": "AnnotationChart",
      "options": {"displayAnnotations": true}
    };

    $scope.chart_contests["data"] = {
      "cols": [{"id": "date", "label": "date", "type": "date"},
               {"id": "rank", "label": "rank", "type": "number"},
               {"id": "new_rating", "label": "new rating", "type": "number"},
               {"id": "solved_problems", "label": "number of solved problems", "type": "number"},
               {"id": "annotation", "label": "contest Annotation Text", "type": "string"},
               {"id": "annotation2", "label": "contest Annotation Text", "type": "string"}
             ],
      "rows": []
    };

    for(var key in $scope.handle["contests"]) {
      var date = new Date($scope.handle["contests"][key]["unix_time"] * 1000);
      var rank = $scope.handle["contests"][key]["rank"];
      var new_rating = $scope.handle["contests"][key]["new_rating"];
      var name = $scope.handle["contests"][key]["name"];

      // maybe there're some not ranked submissions in the users submissions
      // this line will ignore these contests
      if(name == undefined) {
        continue;
      }

      var tried = "tried:";
      for(var k in $scope.handle["contests"][key]["tried"]) {
        if($scope.handle["contests"][key]["tried"][k] != undefined) {
          tried += " " + k;
        }
      }

      var solved = "solved:";
      var num_solved = 0;
      for(var k in $scope.handle["contests"][key]["solved"]) {
        solved += " " + k;
        num_solved += 1;
      }

      // only displays tried problems, if there is at least one
      var annotation = solved;
      if(tried != "tried:") {
        annotation += " " + tried;
      }

      if($scope.chart_contests_select["options"] == "rank") {
        new_rating = undefined;
        num_solved = undefined;
      }
      else if($scope.chart_contests_select["options"] == "number of solved problems") {
        new_rating = undefined;
        rank = undefined;
      }
      else if($scope.chart_contests_select["options"] == "new rating") {
        num_solved = undefined;
        rank = undefined;
      }

      $scope.chart_contests["data"]["rows"].push({
        c: [{v: date}, {v: rank}, {v: new_rating}, {v: num_solved}, {v: name}, {v: annotation}]
      });
    }
  };

 $scope.load_graph_verdict = function() {
   var chart_type = $scope.chart_verdict_select["options"];

   $scope.chart_verdict = {
     "type": chart_type
   };
   $scope.chart_verdict["data"] = {
     "cols": [{"id": "TypeSubmission", "label": "Result", "type": "string"},
              {"id": "Number", "label": "Number of submissions", "type": "number"}],
       "rows": []
   };

   var sorted_list = $scope.sort_dict($scope.handle["total_verdict"]);
   for(var i = 0; i < sorted_list.length; i++) {
     console.log(sorted_list[i][0]);
     $scope.chart_verdict["data"]["rows"].push({
        c: [{v: sorted_list[i][0]}, {v: sorted_list[i][1]}]
     });
   }
 };

 $scope.load_graph_tags = function() {
   var chart_type = $scope.chart_tags_select["options"];

   $scope.chart_tags = {
     "type": chart_type
   };
   $scope.chart_tags["data"] = {
       "cols": [{"id": "Tag", "label": "Tag", "type": "string"},
                {"id": "Number", "label": "Number of submissions", "type": "number"}],
       "rows": []
   };

   var sorted_list = $scope.sort_dict($scope.handle["tags"]);
   for(var i = 0; i < sorted_list.length; i++) {
     console.log(sorted_list[i][0]);
     $scope.chart_tags["data"]["rows"].push({
        c: [{v: sorted_list[i][0]}, {v: sorted_list[i][1]}]
     });
   }
 };

 $scope.get_contest = function() {
   var URL = "http://codeforces.com/api/user.rating?handle=" + $scope.handle["username"];
   var url_id_promise = WebRequest.get(URL);

   url_id_promise.then(function(response) {
     if(!response.data) {
       $scope.handle_error = "Failed to request contest data.";
     }
     else {
       var data = response.data.result;
       for(var j = 0; j < data.length; j++) {
         var contest_id = data[j]["contestId"];
         var contest_name = data[j]["contestName"];
         var contest_rank = data[j]["rank"];
         var new_rating = data[j]["newRating"];
         var update_time = data[j]["ratingUpdateTimeSeconds"]

         if(!(contest_id in $scope.handle["contests"])) {
           $scope.handle["contests"][contest_id] = {};
           $scope.handle["contests"][contest_id]["tried"] = {};
           $scope.handle["contests"][contest_id]["solved"] = {};
           $scope.handle["contests"][contest_id]["unix_time"] = update_time;
         }
         $scope.handle["contests"][contest_id]["new_rating"] = new_rating;
         $scope.handle["contests"][contest_id]["name"] = contest_name;
         $scope.handle["contests"][contest_id]["rank"] = contest_rank;
       }
     }
     $scope.load_graphs();
   });
 };

$scope.get_status = function() {
  var URL = "http://codeforces.com/api/user.status?handle=" + $scope.handle["username"];
  var url_id_promise = WebRequest.get(URL);

  url_id_promise.then(function(response) {
    if(!response.data) {
      $scope.handle_error = "Failed to request users status.";
    }
    else {
      var data = response.data.result;
      // problems are sorted by submission date
      for(var j = data.length-1; j >= 0; j--) {
        // problem related data
        var contest_id = data[j]["contestId"];
        var problem_index = data[j]["problem"]["index"];
        var problem_id = contest_id + "*" + problem_index;
        var problem_name = data[j]["problem"]["name"];
        var problem_tags = data[j]["problem"]["tags"];

        // user related data
        var is_party = data[j]["author"]["teamName"];
        var is_contestant = (data[j]["author"]["participantType"] == "CONTESTANT");

        // submission related data
        var unix_time = data[j]["creationTimeSeconds"];
        var lang = data[j]["programmingLanguage"];
        var verdict = data[j]["verdict"];
        var testset = data[j]["testset"];

        // only updates problem data if is the first submission
        // or the problem was not accepted yet
        if(!(problem_id in $scope.handle["problems"]) ||
            ($scope.handle["problems"][problem_id]["last_verdict"] != "OK")) {
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

           // if solution was accepted update solved problems
           // from the problem tags and check if was accepted at first try
           if(verdict == "OK") {
             if(!(problem_id in $scope.handle["problems"])) {
               $scope.handle["first_try"].push(problem_id);
             }

             for(var index in problem_tags) {
               if($scope.handle["tags"][problem_tags[index]]) {
                $scope.handle["tags"][problem_tags[index]] += 1;
               }
               else {
                 $scope.handle["tags"][problem_tags[index]] = 1;
               }
             }
           }

           $scope.handle["problems"][problem_id] = {};
           $scope.handle["problems"][problem_id]["contest_id"] = contest_id;
           $scope.handle["problems"][problem_id]["name"] = problem_name;
           $scope.handle["problems"][problem_id]["index"] = problem_index;
           $scope.handle["problems"][problem_id]["tags"] = problem_tags;

           $scope.handle["problems"][problem_id]["last_verdict"] = verdict;
           $scope.handle["problems"][problem_id]["unix_time"] = unix_time;

           // if this submission was during a contest update contests data
           if(is_contestant) {
             if(!(contest_id in $scope.handle["contests"])) {
               $scope.handle["contests"][contest_id] = {};
               $scope.handle["contests"][contest_id]["tried"] = {};
               $scope.handle["contests"][contest_id]["solved"] = {};
               $scope.handle["contests"][contest_id]["unix_time"] = unix_time;
              }

              if(verdict == "OK") {
                $scope.handle["contests"][contest_id]["solved"][problem_index] = 1;
                $scope.handle["contests"][contest_id]["tried"][problem_index] = undefined;
              }
              else {
                $scope.handle["contests"][contest_id]["tried"][problem_index] = 1;
              }
           }
        }
      }
    }

    // store info about number of submissions and unsolved problems
    $scope.tried = Object.keys($scope.handle["problems"]).length;
    for(var key in $scope.handle["problems"]) {
      if($scope.handle["problems"][key]["last_verdict"] != "OK") {
        $scope.handle["unsolved"].push(key);
      }
    }

    $scope.get_contest();
  });
};

$scope.get_cf_data = function() {

  $scope.handle_error = "";   // clean errors

  if($scope.handle["username"].length == 0) {
    $scope.handle_error = "Handle can't be empty.";
    return;
  }

  var URL = "http://codeforces.com/api/user.info?handles=" + $scope.handle["username"];
  var url_id_promise = WebRequest.get(URL);
  url_id_promise.then(function(response) {
      if(!response.data) {
        $scope.handle_error = "Handle doesn't exist.";
      }
      else {
        $scope.clear_handle();  // forget other handle data
        $scope.loading = true;  // wait until all the data is available to show charts
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
