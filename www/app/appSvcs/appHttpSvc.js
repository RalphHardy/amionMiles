(function() {
    'use strict';

    angular.module('amionApp').factory('appHttpSvc', ['$http', '$q', '$ionicLoading', 'DSCacheFactory', appHttpSvc]);

    function appHttpSvc($http, $q, $ionicLoading, DSCacheFactory) {


        self.leaguesCache = DSCacheFactory.get("leaguesCache");
        self.leagueDataCache = DSCacheFactory.get("leagueDataCache");

        if (leagueData) {
            console.log("Found data in cache", leagueData);
            deferred.resolve(leagueData);
        } else {
            $ionicLoading.show({
                template: 'Loading...'
            });
               
                       $http.get("http://elite-schedule.net/api/leaguedata/" + getLeagueId())
                           .success(function(data, status) {
                               console.log("Received schedule data via HTTP.", data, status);
                               self.leagueDataCache.put(cacheKey, data);
                               $ionicLoading.hide();
                               deferred.resolve(data);
                           })
                           .error(function() {
                               console.log("Error while making HTTP call.");
                               $ionicLoading.hide();
                               deferred.reject();
                           });
                   }
                   return deferred.promise;
               };

                return {
                    getLeagues: getLeagues,
                    getLeagueData: getLeagueData,
                    setLeagueId: setLeagueId
                };
            };
        })();