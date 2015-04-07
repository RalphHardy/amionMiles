(function() {
    'use strict';

    angular.module('amionApp')
    	.factory('appSecSvc', ['$rootScope', '$http', '$q', '$ionicLoading', appSecSvc]);


    function appSecSvc($rootScope, $http, $q, $ionicLoading) {


    	    return {
    	        loginUser: function(name, pw) {

   console.log('loginUser service function', name, pw);
    	            var deferred = $q.defer();
    	            var promise = deferred.promise;
    	           
    	            if ( (name !== '') && (pw !== '') ) {
    	               deferred.resolve( function () {
                                getLoginDoc();
                                needLogin.needLogin = false;
                            }
                            );
    	            } else {
    	                deferred.reject('Please fill in the fields.');
    	            }
    	            promise.success = function(fn) {
    	                promise.then(fn);
    	                return promise;
    	            };
    	            promise.error = function(fn) {
    	                promise.then(null, fn);
    	                return promise;
    	            };
    	            return promise;
    	        }, // loginuser: function
                        authorize: function() {
                          return principal.identity()
                            .then(function() {
                              var isAuthenticated = principal.isAuthenticated();

                              if ($rootScope.toState.data.roles && $rootScope.toState.data.roles.length > 0 && !principal.isInAnyRole($rootScope.toState.data.roles)) {
                                if (isAuthenticated) $state.go('accessdenied'); // user is signed in but not authorized for desired state
                                else {
                                  // user is not authenticated. stow the state they wanted before you
                                  // send them to the signin state, so you can return them when you're done
                                  $rootScope.returnToState = $rootScope.toState;
                                  $rootScope.returnToStateParams = $rootScope.toStateParams;

                                  // now, send them to the signin state so they can log in
                                  $state.go('main.login');
                                } // else
                            } // if $rootScope.toState.data.roles && $rootScope.toState.data.roles.length 
                        } ); // then function
                      } // authorize: function

            }; // return
    } // factory function appSecSvc
})();
