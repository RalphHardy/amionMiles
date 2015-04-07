(function () {
	'use strict';

	angular
		.module('amionApp')
			.controller('MyInfoCtrl', 
			['appDbSvc', 'appConfig','appAdmin', '$state', '$ionicPopup', MyInfoCtrl]
			);


	function MyInfoCtrl(appDbSvc, appConfig, appAdmin, $state, $ionicPopup) {
		var vm=this;

		if (appAdmin.needLogin) {
			$state.go('main.login', {}, { reload: true });
		}
		vm._devMode = appConfig.devMode;
 console.log('myInfo CONTROLLER, appConfig =', appConfig);
		
		// global values
		vm.ulrRemoteDB = appConfig.urlRemoteCouchDB;
		// defaults
		vm.isOnline = appDbSvc.isOnLine();
		vm.usingLocalCouchDB = !appDbSvc.isRemoteDbSetToWeb();
		vm.usingRemoteCouchDB = !vm.usingLocalCouchDB;

		/****
		var errorOpeningDb = appDbSvc.openAdminDb();
		if ( errorOpeningDb )  {
			console.log('>>ERROR<< unable to open ADMIN DB', errorOpeningDb);
		}
		else if (appConfig.devMode) {
console.log('opened AdminDB ->', appDbSvc.localAdminDb);
		}
		***/


/*** testing
var todayIs = new Date();	
console.log('toDateString():', todayIs.toDateString());
console.log('toISOString():', todayIs.toISOString() );
console.log('toJSON():', todayIs.toJSON() );
console.log('toLocaleDateString():', todayIs.toLocaleDateString() );
console.log('toLocaleString():', todayIs.toLocaleString() );
console.log('toString():', todayIs.toString() );
console.log(':', todayIs);
***/ 

if (appConfig.devMode) {
	console.log('is ONline ->', vm.isOnline, 'vm.usingLocalCouchDB -->', vm.usingLocalCouchDB);
}

		vm.toggleDevMode= function(){
			vm.appConfig.devMode = !vm.appConfig.devMode;
			appConfig.devMode = vm.appConfig.devMode; // reset GLOBAL VALUE
		};

		vm.toggleOnOffline = function(){

		    if (vm.isOnline) {
		        var confirmPopup = $ionicPopup.confirm({
		            title: 'Go Offline?',
		            template: 'Are you sure you want to go OFFline?'
		        });
		        confirmPopup.then(function(res) {
		            if(res) { // switch to OFFline
		                vm.isOnline = false;
		                appDbSvc.disconnectRemoteDb();
		            }
		        });
		    } else { // switch to ONline
			vm.isOnline = true;
			appDbSvc.connectRemoteDb();
		    }
		}; // function toggleOffOnline


		vm.changeToWebCouchDB= function(){
if (appConfig.devMode) {	console.log('On button - changeToWebCouchDB, currently = ', vm.usingLocalCouchDB); }

		    if (vm.usingLocalCouchDB && vm.usingLocalCouchDB) {
		        var confirmPopup = $ionicPopup.confirm({
		            title: 'Developer Option',
		            template: 'Do you wish to change to WEB CouchDB?'
		        });
		        confirmPopup.then(function(res) {
		            if(res) { // switch to Localhost
		                vm.usingLocalCouchDB = false;
		                appDbSvc.changeWebUrl(true);
		            }
		        });
		    } 

		}; // function toggleOffOnline
    		
	} // function MetersCtrl

}() );
