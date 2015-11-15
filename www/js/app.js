// Ionic Starter App

var db = null;

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform,$cordovaSQLite,$rootScope) {
  $ionicPlatform.ready(function() {
    if (window.cordova) {
          db = $cordovaSQLite.openDB({ name: "score.db" }); //device
      }else{
          db = window.openDatabase("score.db", '1', 'my', 1024 * 1024 * 100); // browser
      }
      
      $cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS score(point integer)");
      
      $cordovaSQLite.execute(db,"SELECT * FROM score",[]).then(function(res){
              if(!res.rows.length){
                $cordovaSQLite.execute(db,"INSERT INTO score(point) VALUES(?)",[0]).then(function(res){
                  $rootScope.$emit('bestScore',{ score : 0 });
                },function(err){ console.log(err); });
              }else{
                $rootScope.$emit('bestScore',{ score : 0 });
              }
      },function(err){ console.log(err); });

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }

    if(window.StatusBar){
      // org.apache.cordova.statusbar required
      StatusBar.hide();
    }
  });

  $rootScope.$on('newScore',function(ev,args){
      $cordovaSQLite.execute(db,"SELECT * FROM score",[]).then(function(res){
        $rootScope.$emit('bestScore',{ score : res.rows.item(0).point });
        if(res.rows.item(0).point < args.score){
          $cordovaSQLite.execute(db,"UPDATE score SET point=?",[args.score]).then(function(res){
            $rootScope.$emit('bestScore',{ score : args.score });
          },function(err){ console.log(err); });
        }else{
          $rootScope.$emit('bestScore',{ score : res.rows.item(0).point });
        }
    },function(err){ console.log(err); });
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'mainController'
  })
  .state('app.game', {
      url: '/game',
      views: {
        'menuContent': {
          templateUrl: 'templates/game.html',
          controller : 'gameController'
        }
      }
    })
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/game');
});
