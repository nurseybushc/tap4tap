angular.module('starter.controllers', ['ionic','ngCordova'])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {   
  });
})

.controller('mainController', function($scope, $ionicModal, $timeout) {
})
.directive('soundControl', function($rootScope) {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      elem.bind('click',function(){
        if($rootScope.isSound == true && elem.hasClass('ion-android-volume-up')){
          elem.removeClass('ion-android-volume-up');
          elem.addClass('ion-android-volume-off');
          $rootScope.isSound = false;
        }else{
          elem.removeClass('ion-android-volume-off');
          elem.addClass('ion-android-volume-up');
          $rootScope.isSound = true;
        }
      });

      if($rootScope.isSound == true){
        elem.removeClass('ion-android-volume-off');
        elem.addClass('ion-android-volume-up');
      }else{
        elem.removeClass('ion-android-volume-up');
        elem.addClass('ion-android-volume-off');
      }
    }
  };
})
.controller('gameController', function($scope,$rootScope,$ionicPlatform,$stateParams,$timeout,$interval,$ionicPopup,$cordovaSQLite){
  $scope.sound = true;
  $scope.score = 0;
  $scope.bar = 100;
  $rootScope.isSound = true;
  $scope.selectBox = undefined;
  $scope.selectList = [];
  $scope.colors = ['#E9D460','#03C9A9','#446CB3','#663399','#F62459','#D2527F','#4ECDC4','#87D37C','#F64747','#81CFE0'];
  var startPopup = undefined;
  var barInterval = undefined;
  var stop = false;
  var game = undefined;

  $timeout(function(){
    $scope.wait = false;
  },500);

  // tap sound
  $scope.clickSound = new Howl({
    urls: ['sound/click.wav']
  });

  // the end sound
  $scope.theendSound = new Howl({
    urls: ['sound/theend.wav']
  });

  // on score
  $rootScope.$on('bestScore',function(n,o){
    $rootScope.bestScore = o.score;
  });

  $scope.showPopup = function() {
    // An elaborate, custom popup
    startPopup = $ionicPopup.show({
      template: '<div style="text-align:center;margin-top:10px"><h3 style="margin-top:-20px">tap4tap</h3>'+
                  '<button class="button button-block" ng-click="start()">start</button>'+
                  '<h3>best score : {{ bestScore }}</h3>'+
                  '<i class="ion-android-volume-up" sound-control style="font-size:30px"></i>'+
                '</div>',
      scope: $scope,
      title : '<i class="ion-happy-outline"></i>'
    });
   };

  $scope.showPopup();

  // start game
  $scope.start = function(){
    $scope.score = 0;

    startPopup.close();

    stop = true;

    game = $interval(function(){
        if(stop){
          $scope.bar -= 2;

          if($scope.bar <= 0)
            $scope.theend();

          if(!$scope.$$phase) {
            $scope.$apply();
          }     
        }
    },250);
  }
  
  // the end
  $scope.theend = function(){
    // send score
    $rootScope.$emit('newScore',{ score : $scope.score });

    stop = false;

    $interval.cancel(game);

    game = undefined;

    $scope.allRandom();

    $scope.wait = true;

    $timeout(function(){
      $scope.wait = false;
    },500);

    if($rootScope.isSound)
      $scope.theendSound.play();

    $scope.selectBox = undefined;
    $scope.selectList = [];

    $scope.bar = 100;

    startPopup = $ionicPopup.show({
      template: '<div style="text-align:center;margin-top:10px"><h3 style="margin-top:-20px">tap4tap</h3>'+
                  '<button class="button button-block" ng-click="start()">start</button>'+
                  '<h3>score : {{ score }}</h3>'+
                  '<h3>best score : {{ bestScore }}</h3>'+
                  '<i class="ion-android-volume-up" sound-control style="font-size:30px"></i>'+
                '</div>',
      scope: $scope,
      title : '<i class="ion-happy-outline"></i>'
    });
  }

  $scope.randomColor = function(){
    return $scope.colors[Math.floor(Math.random()*10)];
  }

  $scope.randomNum = function(){
    return Math.floor(Math.random()*4)+1;
  }

  $scope.allRandom = function(){
    $scope.oneNum = $scope.randomNum();
    $scope.twoNum = $scope.randomNum();
    $scope.threeNum = $scope.randomNum();
    $scope.fourNum = $scope.randomNum();

    $scope.oneColor = $scope.randomColor();
    $scope.twoColor = $scope.randomColor();
    $scope.threeColor = $scope.randomColor();
    $scope.fourColor = $scope.randomColor();
    $scope.barColor = $scope.randomColor();
  }

  $scope.allRandom();

  $scope.oneTouch = function(e){
    $scope.score++;

    var elem = angular.element(e.target);

    if($rootScope.isSound)
      $scope.clickSound.play();

    $scope.selectBox = 'one';

    if($scope.selectList.indexOf('one') == -1)
      $scope.selectList.unshift('one');

    for(var i=2;i<$scope.selectList.length;i++){
      $scope.selectList.splice(i,1);
    }

    // back control
    if($scope.selectList.length == 2){
      if($scope[$scope.selectList[1]+'Num'] > 0){
        $scope.theend();
      }
    }

    if(--$scope.oneNum == 0){
      elem.addClass('border-animate');
      $timeout(function(){

        elem.removeClass('border-animate');

        if($scope.selectBox == 'one'){
          $scope.theend();
        }

        $scope.oneNum = $scope.randomNum();
        $scope.oneColor = $scope.randomColor();
        $scope.selectList.splice($scope.selectList.indexOf('one'),1);
      },1000);
    }else if($scope.oneNum == -1){
      // the end
      $scope.theend();
    }
    
    if($scope.bar < 100)
      $scope.bar += 2;
  }

  $scope.twoTouch = function(e){
    $scope.score++;

    var elem = angular.element(e.target);

    if($rootScope.isSound)
      $scope.clickSound.play();

    $scope.selectBox = 'two';

    if($scope.selectList.indexOf('two') == -1)
      $scope.selectList.unshift('two');

    for(var i=2;i<$scope.selectList.length;i++){
      $scope.selectList.splice(i,1);
    }
    
    // back control
    if($scope.selectList.length == 2){
      if($scope[$scope.selectList[1]+'Num'] > 0){
        $scope.theend();
      }
    }

    if(--$scope.twoNum == 0){
      elem.addClass('border-animate');
      $timeout(function(){

        elem.removeClass('border-animate');

        if($scope.selectBox == 'two'){
          $scope.theend();
        }

        $scope.twoNum = $scope.randomNum();
        $scope.twoColor = $scope.randomColor();
        $scope.selectList.splice(selectList.indexOf('two'),1);
      },1000);
    }else if($scope.twoNum == -1){
      // the end
      $scope.theend();
    }
    
    if($scope.bar < 100)
      $scope.bar += 2;
  }

  $scope.threeTouch = function(e){
    $scope.score++;

    var elem = angular.element(e.target);

    if($rootScope.isSound)
      $scope.clickSound.play();

    $scope.selectBox = 'three';

    if($scope.selectList.indexOf('three') == -1)
      $scope.selectList.unshift('three');

    for(var i=2;i<$scope.selectList.length;i++){
      $scope.selectList.splice(i,1);
    }

    // back control
    if($scope.selectList.length == 2){
      if($scope[$scope.selectList[1]+'Num'] > 0){
        $scope.theend();
      }
    }

    if(--$scope.threeNum == 0){
      elem.addClass('border-animate');
      $timeout(function(){

        elem.removeClass('border-animate');

        if($scope.selectBox == 'three'){
          $scope.theend();
        }

        $scope.threeNum = $scope.randomNum();
        $scope.threeColor = $scope.randomColor();
        $scope.selectList.splice($scope.selectList.indexOf('three'),1);
      },1000);
    }else if($scope.threeNum == -1){
      // the end
      $scope.theend();
    }
    
    if($scope.bar < 100)
      $scope.bar += 2;
  }

  $scope.fourTouch = function(e){
    $scope.score++;

    var elem = angular.element(e.target);

    if($rootScope.isSound)
      $scope.clickSound.play();

    $scope.selectBox = 'four';

    if($scope.selectList.indexOf('four') == -1)
      $scope.selectList.unshift('four');

    for(var i=2;i<$scope.selectList.length;i++){
      $scope.selectList.splice(i,1);
    }

    // back control
    if($scope.selectList.length == 2){
      if($scope[$scope.selectList[1]+'Num'] > 0){
        $scope.theend();
      }
    }

    if(--$scope.fourNum == 0){
      elem.addClass('border-animate');
      $timeout(function(){

        elem.removeClass('border-animate');

        if($scope.selectBox == 'four'){
          $scope.theend();
        }

        $scope.fourNum = $scope.randomNum();
        $scope.fourColor = $scope.randomColor();
        $scope.selectList.splice($scope.selectList.indexOf('four'),1);
      },1000);
    }else if($scope.fourNum == -1){
      // the end
      $scope.theend();
    }

    if($scope.bar < 100)
      $scope.bar += 2;
  }

});
