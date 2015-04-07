(function () {
'use strict';

angular
	.module('amionApp')
	.directive('adActionButtons',  function () {
	return {
		restrict: 'E',
		templateUrl: 'app/appDirs/adActionButtons.html',
		controller: function($scope) {
			$scope.initiateChangeForm = function () {
				$scope.activateChangeForm();	 // use this to access top controller function 
console.log('initiateChangeForm');			
			}; // function initiateChangeForm


			} // controller
		}; // function return
	}) // directive
	

}() );