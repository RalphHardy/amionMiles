// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('amionApp', ['ionic'])

.run( function($ionicPlatform, $rootscope, $state, $stateParams, appSecSvcs) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    
      $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
          // track the state the user wants to go to; authorization service needs this
          $rootScope.toState = toState;
          $rootScope.toStateParams = toStateParams;
          // if the principal is resolved, do an authorization check immediately. otherwise,
          // it'll be done when the state it resolved.
          if (principal.isIdentityResolved()) authorization.authorize();
      } );

  });
})

.value('_devMode', 1 ) // set 0 when deployed
.value('urlRemoteDB', 'http://amiontrack.iriscouch.com/') // IP for couchDB 
.value('appConfig',  
   {appFocus: "Miles",
    debugLog: true,
    devMode: true,
    adminDbName: "amion00-admin",
    mainDbRootName: "miles",
    mainDbName: "", 
    urlWebCouchDB: "http://amiontrack.iriscouch.com/" 
    })
.value('appAdmin',  
   {needLogin: true,
    currLoginId: "Ralph",
    currPwd: "123",
    currOrgznId: "0amion00",
    currSessionDT: null,
    currSyncedAdminData: false,
    prevSessionOnDT: null,
    PrevSessionOffDT: null,
    currSessionUserId: "",
    currSessionPwd: "",
    PrevSessionUserId: ""
    })


.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

    .state('main', {
      abstract: true,
      url: "/main",
      templateUrl: "app/main/mainTabs.html"
    })


    .state('main.login', {
      url: "/login",
      views: {
        "login": {
          templateUrl: "app/main/login.html",
          controller: "LoginCtrl as vm",
          resolve: {
                    ok1: function (appDbSvc, $q, $state) 
                    {
                      var currdt = new Date ();
                      console.log('Before1 Login', currdt);

                      var deferred = $q.defer();
                      deferred.resolve( appDbSvc.openAdminDb() );
                      return deferred.promise;
                  }, 

                    ok: function (appDbSvc, $q) 
                    { //if (ok1) {

                          var currdt2 = new Date ();
                          console.log('Before2 Login', currdt2);

                          var deferred = $q.defer();
                          deferred.resolve( appDbSvc.connectRemoteAdminDb() );

                          return deferred.promise;                          
                        //}
                  }, // 
                 } // resolve
        }
      }
    })

    .state('main.myInfo', {
      url: "/myInfo",
      views: {
        "login": {
          templateUrl: "app/main/myInfo.html",
          controller: "MyInfoCtrl as vm",
          resolve: {
            loggedIn: function (appAdmin, $state) {
console.log('before myInfo:', appAdmin.needLogin);
              if (appAdmin.needLogin) {
                $state.go('main.login', {}, { reload: true });
              }
            }
          }
        }
      }
    })

    .state('main.shopLists', {
      url: "/shopLists",
      views: {
        "shopLists": {
          templateUrl: "app/main/shopLists.html"
        }
      }
    })

    .state('main.categories', {
      url: "/categories",
      views: {
        "categories": {
          templateUrl: "app/main/categories.html",
          controller: "CategoriesCtrl as vm",
          resolve: {
                    currList: function (appDbSvc, $q) 
                    {
                      var deferred = $q.defer();
                      deferred.resolve( appDbSvc.getCategoryList() );
                      return deferred.promise;
                  }// 
                 } // resolve
        }
      }
    })

    .state('main.items', {
      url: "/items",
      views: {
        "items": {
          templateUrl: "app/main/items.html"
        }
      }
    })

    .state('app', {
      abstract: true,
      url: "/app",
      templateUrl: "app/side/sideMenu.html"
    })

    .state('app.shopList', {
      url: "/shopList",
      views: {
        'mainContent': {
          templateUrl: "app/side/shopList.html"
        }
      }
    })

    .state('app.shopHistory', {
      url: "/shopHistory/:id",
      views: {
        'mainContent': {
          templateUrl: "app/side/shopHistory.html"
        }
      }
    })

    .state('app.shopFuture', {
      url: "/shopFuture/:id",
      views: {
        'mainContent': {
          templateUrl: "app/side/shopFuture.html"
        }
      }
    })

    .state('app.shopCosts', {
      url: "/shopCosts",
      views: {
        'mainContent': {
          templateUrl: "app/side/shopCosts.html"
        }
      }
    });

    // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/main/login');
});