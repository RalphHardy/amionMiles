(function() {
	'use strict';

	angular.module('amionApp').factory('appDbSvc', ['$rootScope',  'appConfig', 'appAdmin', appDbSvc]);

	function appDbSvc($rootScope, appConfig, appAdmin) {

//console.log('appDbSvc, dev mode =', appConfig.debugLog);
	//-- CONSTANTS --//	
	self.clientDBID="amion00";
	self.urlCouchDBonLocalhost= "http://localhost:5984/";
	self.urlCouchDBonWeb="http://amiontrack.iriscouch.com/";
	self.loginDoc={};

	// var self = this;
	self.itemMasterList = []; // pop'd by the DB.onchange method
	self.catMasterList= []; // pop'd by the DB.onchange method
	self.shoppingLists= []; // pop'd by the DB.onchange method
	self.currShoppingList = [];

	var mainDbOpen = false;
	var isConnectedToRemoteMainDb = false;
	var adminDbOpen = false;
	var isConnectedToRemoteAdminDb = false;
	
	var _categoriesDocId = 'category:';
	var _itemDocId='item:';
	var _shopDocId='shop:';
	var _histDocId='hist:';
	var _recurDocId='recur:';

	var _blnkLoginDoc = {
		  "_id": "login-id---0amion00Ralph",
		  "_rev": "2-7c86308c0585180eb47c12a689907c2d",
		  "login_id": "Ralph",
		  "pwd": "123",
		  "last_login_dt": "",
		  "last_logout_dt": "",
		  "last_synced": "",
		  "admin_status_flag": "",
		  "account_status": "",
		  "account_setup_dt": "",
		  "account_closed_dt": "",
		  "user_request": "",
		  "user_request_dt": "",
		  "admin_response": "",
		  "admin_response_dt": "",
		  "last_user_comment": "",
		  "last_user_comment_dt": "",
		  "region": "",
		  "dt_format": "",
		  "currency": ""
		};


	var _blnkCategories = {
		"_id" : _categoriesDocId+"zzzzzz",
		"cat_name" : "",
		"cat_desc" : "",
		"crtd_date" : "",
		"items" : [
		{"seq_num" : 9999,
		"item_name" : "",
		"item_desc" : "",
		"item_units" : "ea"}
		] };

	var _blnkItems = {
		"_id" : ""
	};
				
	//-- SET DEFAULTS --//
	self.isOnLine = false;  // offline by default
	if (appConfig.debugLog) { self.useWebUrl  = false; } // development will use localhost:5984 by default
		else { self.useWebUrl = true; }

	if (self.useWebUrl) {
		changeWebUrl(true);
	} 
	else {	changeWebUrl(false); // using the local host instance of CouchDb by default
	}

if (appConfig.debugLog) {	console.log('URL of CouchDB -->', self.remoteDBcurrDomain ); }	
	
	// -- MANAGE ON/OFF-LINE DB --//
	/** Admin DB functions
		isOnLine: function() {return self.isOnLine; },
		isRemoteDbSetToWeb: function() {return self.useWebUrl; },
		connectRemoteDb: function (isWeb) {connectRemoteDb();},
		disconnectRemoteDb: function (isWeb) {disconnectRemoteDb();},
	**/
 
	function changeWebUrl(isWeb) {
		self.useWebUrl = isWeb;
		if (self.useWebUrl) {
			self.remoteDBcurrDomain = appConfig.urlWebCouchDB;
		} 
		else {	self.remoteDBcurrDomain = self.urlCouchDBonLocalhost; // using the local host instance of CouchDb by default
		}
	} //  function changeWebUrl


	/* .value('appConfig',  
	   {debugLog: true,
	    devMode: true,
	    loginDbName: "amion00-admin",
	    mainDbRootName: "groceries",
	    mainDbName: "", 
	    urlWebCouchDB: "http://amiontrack.iriscouch.com/" 
	    */
	
	//--- OPEN POUCH DBs ---//
		
	function openAdminDb() {
		var OK = false;
		self.localAdminDb = new PouchDB(appConfig.adminDbName);    
		console.log('opening ADMIN DB:', appConfig.adminDbName, self.localAdminDb);

		self.localAdminDb.then ( function () {	
			OK = true;
console.log('Opened ADMIN DB'); 
		}).catch (function (err) {
			console.log('>>ERROR<< opening adminDB: ', err);
		}); 
		} // function openAdminDb(

	function connectRemoteAdminDb() {
		if (!isConnectedToRemoteAdminDb) { // only do if NOT ALREADY CONNECTED!!!
			var remoteDbUrl  = '';

			if (self.useWebUrl) {				
			 	remoteDbUrl = self.urlCouchDBonWeb + 'amion00-admin';
			} else { // CouchDB is Localhost	
				 remoteDbUrl = self.urlCouchDBonLocalhost + 'amion00-admin';// use PC / local CouchDB
			}

			self.remoteAdminDb = new PouchDB(remoteDbUrl);   
if (appConfig.debugLog) {console.log('AFTER connecting to REMOTE Admin DB', remoteDbUrl,self.remoteAdminDb); }


			self.remoteAdminDb.then ( function () {              
				self.localAdminDb.sync(self.remoteAdminDb, {live: true, retry: true})
					.on('change', function (change) {
						appAdmin.currSyncedAdminData = true;
						 console.log('sync detected change:', change); 
					})
					.on('error', function (err) {
						appAdmin.currSyncedAdminData = false;
						 console.log('sync FAILED:', err); 
					});
			} ); // remoteAdminDb.then	
		} // !isConnectedToRemoteAdminDb	
		return true;
	} // function connectRemoteAdminDb

	function openMainDb() {

		self.localMainDb = new PouchDB( appConfig.mainDbRootName );        
		self.localMainDb.then ( function () {	
			mainDbOpen = true;
if (appConfig.debugLog) {console.log('Opened Main DB'); }	
			self.localMainDb .changes({
				continuous: true,
				onChange: function(change) {
					if (!change.deleted) {
						$rootScope.$apply(function() {
							self.localMainDb .get(change.id, function(err, doc) {
								//self. woMasterList.push(doc);
if (appConfig.debugLog) {console.log('onChange - broadcast add Rec:', doc); }
								$rootScope.$apply(function() {
									if (err) console.log(err);
									$rootScope.$broadcast('add', doc);
								});
							});
						});
					} else {
						$rootScope.$apply(function() {
							$rootScope.$broadcast('delete', change.id);
						});
					} // else
				} // function(change)
			}); //  self.localMainDb .changes
		}); //self.localMainDb.then
	} // function openMainDb(

	function connectRemoteMainDb() {
		if (!isConnectedToRemoteMainDb) { // only do if NOT ALREADY CONNECTED!!!

			if (self.useWebUrl) {				
				self.remoteDBcurrDomain = self.urlCouchDBonWeb + self.clientDBID;
			} else { // CouchDB is Localhost	
				self.remoteDBcurrDomain = self.urlCouchDBonLocalhost + self.clientDBID;// use PC / local CouchDB
			}

if (appConfig.debugLog) {console.log('BEFORE connecting to REMOTE Workorders DB', self.remoteDBcurrDomain); }	
			self.remoteMainDb = new PouchDB(self.remoteDBcurrDomain+"amiongroclist");   
if (appConfig.debugLog) {console.log('AFTER connecting to REMOTE Workorders DB', self.remoteMainDb); }
/***
			self.remoteMainDb.then ( function () {              
				self.localMainDb.sync(self.remoteMainDb, {live: true});
if (appConfig.debugLog) {console.log('after connecting to REMOTE Workorders DB', self.remoteMainDb);
			} );
****/			
		} // only do if NOT already connected
	} // function connectRemoteMainDb





	function disconnectRemoteMainDb () {
		if (self.offlineDB ) {

		}
		else {

		}
	}	




	// --- DB UPDATES --- //
	// 
	//  -- UPDATE  DATABASE RECS  -- //
		function updateCategoriesDoc() {
if (appConfig.debugLog) {console.log('updateCategoriesDoc -->', self.currentWo);}
			self.localMainDb.put(
				self.catalogDbDoc
			).then(function (response) {
if (appConfig.debugLog)  {console.log('updateCategoriesDoc --> SUCCESS!'); }
			  // handle response
			}).catch(function (err) {
			  console.log(err);
			});
		} // function updateCategoriesDoc

		function updateData (whichObj, newObj) {				
			var tmpObj = [];
			var itemFound = false;
			var  ok = false;

			switch(whichObj) {
			case 'categories':
				var listArray = self.catMasterList;
if (appConfig.debugLog) {console.log('updateData ENTER-->', newObj); }
				if (angular.isUndefined(listArray)) { // this will be the first object in the array
					self.catMasterList = []; 
				}
				else
				{ // first, confirm that this entry does not currently exist	
					var target_id = newObj.cat_name;

					angular.forEach(listArray, function(forItem) {
if (appConfig.debugLog) {console.log('checking forEach updateData -->', forItem); }
						if (forItem.cat_name === target_id) { // found the rec existing
							tmpObj.push(newObj); // add new Object
						itemFound = true;
if (appConfig.debugLog) {console.log('FOUND EXISTING REC -->', forItem, newObj);  }
						} // if found the rec existing
						else {
							tmpObj.push(forItem);	 // else add the current forEach-item						
						} // not found - add old one to the tmpObj array
					}); // forEach								
				} // 

				if ( itemFound ){ // then replace
					self.catMasterList = tmpObj;
				}
				else {  
					self.catMasterList.push(newObj);
				}
if (appConfig.debugLog) {console.log('updateData - BEFORE DB UPDAT (itemFound & object):',  itemFound, self.catMasterList); }
				ok = updateCategoriesDoc();

				return self.catMasterList;
			case 'X':
				// code block;
				break;
			default:
				ok = false;		
			} // switch				
			//$rootScope.$broadcast('addMyNotes', newObj);
				
			 return [];			
		} // function updateData



	function getCategoryList() {
		if (mainDbOpen) {
			return self.catMasterList;
		}
		else {
			openMainDb();
			return self.catMasterList;
		}
	} // function getCategoryList
		
	// --- ADMIN DB PROCEDURES --- //
	// 
	/***

var _blnkLoginDoc = {
	  "_id": "login-id----0amion00Ralph",
	  "_rev": "2-7c86308c0585180eb47c12a689907c2d",
	  "login_id": "Ralph",
	  "pwd": "123",
	  "last_login_dt": "",
	  "last_logout_dt": "",
	  "last_synced": "",
	  "admin_status_flag": "",
	  "account_status": "",
	  "account_setup_dt": "",
	  "account_closed_dt": "",
	  "user_request": "",
	  "user_request_dt": "",
	  "admin_response": "",
	  "admin_response_dt": "",
	  "last_user_comment": "",
	  "last_user_comment_dt": "",
	  "region": "",
	  "dt_format": "",
	  "currency": ""
	}

	value('appAdmin',  
	   {needLogin: true,
	    currLoginId: "",
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
	***/

	function getLoginDoc() {
		

		 self.loginDoc = {}; // _blnkLoginDoc;
		// build the login id:
		var loginDocId = "login-id---"+appAdmin.currOrgznId+appAdmin.currLoginId;

console.log('PREP DOC ID for getAdminDoc', loginDocId);
		self.localAdminDb.get ( loginDocId )
			.catch(function (err) {
				  if (err.status === 404) { // not found!
console.log('TRAPPED 404 on getAdminDoc');
				  	return _blnkLoginDoc;
				  } else { // hm, some other error
				  	throw err;
				  }
			})
			.then(function (gotDoc) {
				  self.loginDoc = gotDoc;
console.log('after getLoginDoc ...', gotDoc );
				 self.loginDoc.last_login_dt = new Date();
				 gotDoc.last_login_dt = new Date();
				  self.localAdminDb.put ( gotDoc )
				  .then (function (response) {
console.log('after AdminDoc PUT:', response);
				  }).catch(function (err) {
				    console.log(err);
				  });

			})
			.catch(function (err) {
				 console.log('>>ERROR<< retreiving LoginDoc: ', err);
			});

	} // function getLoginDoc


// ---- RESULTS ---- //
	return {
		// Admin DB functions
		changeWebUrl: function(isWeb) { changeWebUrl(isWeb); },
		isOnLine: function() {return self.isOnLine; },
		isRemoteDbSetToWeb: function() {return self.useWebUrl; },
		connectRemoteMainDb: function () {connectRemoteMainDb();},
		disconnectRemoteMainDb: function () {disconnectRemoteMainDb();},
		openAdminDb: function () { return openAdminDb(); },
		connectRemoteAdminDb: function () { return connectRemoteAdminDb(); },
		getLoginDoc: function () {getLoginDoc(); },

		// update documents
		updateData: function (whichObj, newObj) { returnupdateData(whichObj, newObj); },

		// retrieve documents	
		getCategoryList: function () {getCategoryList(); }
	};
}
})();