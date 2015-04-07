(function () {
'use strict';

angular
	.module('amionApp')
	.directive('adCategoriesAdd',  function () {
	return {
		restrict: 'E',
		templateUrl: 'app/main/adCategoriesAdd.html',
		controller: function($scope) {
			$scope.initiateChangeForm = function () {
				$scope.activateChangeForm();	 // use this to access top controller function 
console.log('initiateChangeForm');			
			}; // function initiateChangeForm


			} // controller
		}; // function return
	}) // directive
	

}() );