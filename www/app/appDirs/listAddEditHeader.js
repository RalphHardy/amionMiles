(function () {
'use strict';

angular
	.module('amionApp')
	.directive('adListAddEditHeader',  function () {
	return {
		restrict: 'E',
		templateUrl: 'app/appDirs/listAddEditHeader.html',
		scope: {
			formName: "@formname",
			vmode: "@vmode",
			activateChangeForm: "&method"
			},
		controller: function($scope) {
			$scope.vlist = ($scope.vmode === "list");
			$scope.vedit= ($scope.vmode === "edit");
			$scope.vadd= ($scope.vmode === "add");
console.log('function vmode:', $scope.vmode, $scope.vlist, $scope.vedit, $scope.vadd);
			$scope.initiateChangeForm = function () {
				$scope.activateChangeForm();	 // use this to access top controller function 
console.log('initiateChangeForm');			
			}; // function initiateChangeForm


			} // controller
		}; // function return
	}) // directive
	.directive('formbutton', function() {
	return {
		restrict: 'C',
		link: function ($scope, el, attrs) {
console.log('views booleans (list/edit/add):', $scope.listView, $scope.editView, $scope.addView);
		return "button button-full button-assertive icon-right ion-plus"; 
			//if ($scope.editView) {return "button button-full button-assertive icon-right ion-minus"; }
			//if ($scope.addView) {return "button button-full button-assertive icon-right ion-minus"; }
			}
		}; // function return
	}); // directive

	

}() );