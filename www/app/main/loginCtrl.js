(function () {
	'use strict';

	angular
		.module('amionApp')
		.controller('LoginCtrl', 
		['appDbSvc', 'appConfig', 'appSecSvc', '$state', '$ionicPopup', LoginCtrl]
		);


	function LoginCtrl(appDbSvc, appConfig, appSecSvc, $state, $ionicPopup) {
		var vm=this;
		    vm.data = {};

console.log('LoginCtrl on entry');		 
		    vm.login = function() {
console.log('LoginCtrl on-click function');
		        appSecSvc.loginUser(vm.data.username, vm.data.password).success(function(data) {
		            $state.go('main.myInfo');
		        }).error(function(data) {
		            var alertPopup = $ionicPopup.alert({
		                title: 'Login failed!',
		                template: 'Please check your credentials!'
		            });
		        });
		    };
	} // function LoginCtrl

}() );