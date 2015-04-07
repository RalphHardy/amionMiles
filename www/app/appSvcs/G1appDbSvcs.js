(function() {
	'use strict';

	angular.module('gmobApp').factory('WoDbSvc', ['$rootScope', '_devMode',  '_urlRemoteDB', WoDbSvc]);

	function WoDbSvc($rootScope, _devMode, _urlRemoteDB) {

	//-- CONSTANTS --//	
	self.clientDBID="amion00";
	self.urlCouchDBonLocalhost= "http://localhost:5984/"+self.clientDBID;
	self.urlCouchDBonWeb="http://amiontrack.iriscouch.com/"+self.clientDBID;

	// var self = this;
	self.woMasterList = []; // pop'd by the DB.onchange method
	self.CatalogMaster= []; // pop'd by the DB.onchange method
	self.MeterMaster = []; // pop'd by the DB.onchange method
	self.mtlsMasterList = [];
	self.lbrMasterList = [];
	self.attachMasterList = [];
	self.currentWo = undefined;
	self.currentWoNum = '';
	self.currentWoIndex = -1;

	//-- SET DEFAULTS --//
	self.isOnLine = false;  // offline by default
	if (_devMode) { self.useWebUrl  = false; } // development will use localhost:5984 by default
		else { self.useWebUrl = true; }

	if (self.useWebUrl) {
		changeWebUrl(true);
	} 
	else {	changeWebUrl(false); // using the local host instance of CouchDb by default
	}

if (_devMode) {	console.log('URL of CouchDB -->', self.remoteDBcurrDomain ); }	
	
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
			self.remoteDBcurrDomain = _urlRemoteDB;
		} 
		else {	self.remoteDBcurrDomain = self.urlCouchDBonLocalhost; // using the local host instance of CouchDb by default
	}}

	function connectRemoteDb() {
		if (!self.isConnectedToRemoteDb) { // only do if NOT ALREADY CONNECTED!!!

			if (self.useWebUrl) {				
				self.remoteDBcurrDomain = self.urlCouchDBonWeb;
			} else { // CouchDB is Localhost	
				self.remoteDBcurrDomain = self.urlCouchDBonLocalhost; // use PC / local CouchDB
			}

			self.remoteWoDB = new PouchDB(self.remoteDBcurrDomain+"workorders");   
			self.remoteWoDB.then ( function () {              
				self.localWoDB.sync(self.remoteWoDB, {live: true});
if (_devMode) {console.log('after connecting to REMOTE Workorders DB', self.remoteWoDB);	}
			} );

			self.remoteMeterDB = new PouchDB(self.remoteDBcurrDomain+"meters");    
			self.remoteMeterDB.then ( function () {              
			self.localMeterDB.sync(self.remoteMeterDB, {live: true});
if (_devMode) {console.log('after connecting to REMOTE METERS DB', self.remoteMeterDB);	}		
			} );

			self.remoteCatalogDB = new PouchDB(self.remoteDBcurrDomain+"catalog");    
			self.remoteCatalogDB.then ( function () {              
				self.localCatalogDB.sync(self.remoteCatalogDB, {live: true});
if (_devMode) {console.log('after connecting to REMOTE CATALOG DB', self.remoteCatalogDB); }
			} );
		} // only do if NOT already connected
	} // function connectRemoteDb


	function disconnectRemoteDb () {
		if (self.offlineDB ) {

		}
		else {

		}
	}	


	//--- OPEN POUCH DBs ---//

	self.localWoDB = new PouchDB("workorders");        
	self.localWoDB.then ( function () {		
		self.localWoDB .changes({
			continuous: true,
			onChange: function(change) {
				if (!change.deleted) {
					$rootScope.$apply(function() {
						self.localWoDB .get(change.id, function(err, doc) {
							self. woMasterList.push(doc);
//console.log('onChange - broadcast addWo:', doc);
							$rootScope.$apply(function() {
								if (err) console.log(err);
								$rootScope.$broadcast('addWo', doc);
							});
						});
					});
				} else {
					$rootScope.$apply(function() {
						$rootScope.$broadcast('deleteWo', change.id);
					});
				} // else
			} // function(change)
		}); //  self.localWoDB .changes


		 
		self.localMeterDB = new PouchDB("meters");
		self.localMeterDB.then ( function () {			
			self.localMeterDB .changes({
				continuous: true,
				onChange: function(change) {
					if (!change.deleted) {
						$rootScope.$apply(function() {
							self.localMeterDB .get(change.id, function(err, doc) {
								self. MeterMaster.push(doc);
//console.log('onChange - broadcast addMeter:', doc);
								$rootScope.$apply(function() {
									if (err) console.log(err);
									//$rootScope.$broadcast('addMeter', doc);
								});
							});
						});
					} else {
						$rootScope.$apply(function() {
							//$rootScope.$broadcast('deleteMeter', change.id);
						});
					} // else
				} // function(change)
			}); //  self.localMeterDB .changes

			/**** RESET THIS DATABASE 
			var tmpDB = new PouchDB("gmob-catalog");
			tmpDB.then( function () {
				   	tmpDB.destroy().then(function() {
				    	self.localCatalogDB = new PouchDB('gmob-catalog');
				  });
			  });
			*****/
			
			self.localCatalogDB = new PouchDB('catalog');
			self.localCatalogDB.then ( function () {
				// TEMPORARILY CREATE SYNC CONNECTION ...
				//self.remoteCatalogDB.then (function () {
					//self.localCatalogDB.sync(self.remoteCatalogDB, {live: true});
				// END TEMPORARILY CREATE SYNC CONNECTION ...
					self.localCatalogDB .changes({
						continuous: true,
						onChange: function(change) {
							if (!change.deleted) {
								$rootScope.$apply(function() {
									self.localCatalogDB .get(change.id, function(err, doc) {									
										self. CatalogMaster.push(doc);									
//console.log('onChange - broadcast CATALOG addCat:', doc);
										$rootScope.$apply(function() {
											if (err) console.log(err);
											//$rootScope.$broadcast('addCat', doc);
										});
									});
								});
							} else {
								$rootScope.$apply(function() {
									//$rootScope.$broadcast('deleteCat', change.id);
								});
							} // else
						} // function(change)
					}); //  self.localCatalogDB .changes	
				// }); //  TEMP!!!! self.remoteCatalogDB  sync, etc ...	
//console.log('after connecting to LOCAL DBs', self.localWoDB, self.localMeterDB, self.localCatalogDB) ;
			});
		} );// self.localCatalogDB.then 
	} );// self.localCatalogDB.then 
	
	
	

	function insertSortedList() {
		var list = ['202'];
		var addstr = ['200'];

		function insertStr(list, addstr) {
			i = 0;
			j = 0;
			newlist = [];
			if (list.length === 0) {list.push(addstr);}
			else 
				if (list[list.length] <= addstr) {list.push(addstr);}
			else
				for (i=0; i < list.length; i++) {
										// insert just before one that is lower
										if (addstr >= list[i]) {
											newlist = list.slice(0,i) + [addstr] + list.slice(i,list.length-1);
										} 
									} // for i
									return newlist;
		} // function insertStr
if (_devMode) {console.log(insertStr(list, addstr)); }

	} // end - function insertSortedList

//  -- UPDATE WORKORDER DOC  -- //
	function updateCurrWoDoc() {
if (_devMode) {console.log('updateCurrWoDoc -->', self.currentWo);}
		localWoDB.put(
			self.currentWo
		).then(function (response) {
if (_devMode)  {console.log('updateCurrWoDoc --> SUCCESS!'); }
		  // handle response
		}).catch(function (err) {
		  console.log(err);
		});

	} // function updateCurrWoDoc
				  
// ---- WORKORDERS --- //

	function getWoIndex(workorderId) {
		for (var i = 0; i < self. woMasterList.length;  i++) {
			var target_id =   workorderId.trim();
			var sourceid  =   self. woMasterList[i]._id .trim();
			if (sourceid=== target_id) {
				// console.log('Found W/O index', sourceid, i);
				return i;
				}  //if
		} //for
		// else
		return -1;
	} // function getWoIndex

	
	function setDefaultWo (woId) {
if (_devMode) {console.log('#@# SETTING DEFAULT W/O:', woId); }
		self.currentWoId = woId;
		// get the index into the woList
		// 
		// Now get the actual object
		self.currentWo = retrieveSingleWorkorder(woId);

		self.currentWoNum = self.currentWo.wo_number;
	} // function getWoIndex

	function getDefaultWo () {

if (_devMode) {console.log('#@# RETRIEVING DEFAULT W/O:', self.currentWo); }	
		return  self.currentWo;
	} // function getWoIndex

	function retrieveSingleWorkorder(workorderId){
		 // Simple index lookup
		 var woDoc = [];
		 var woListIndex = getWoIndex(workorderId);
		 if (woListIndex > -1)  {
			woDoc =self. woMasterList[woListIndex];
			if (_devMode) {console.log('retrieving w/o:', woDoc);  }                               
		 }
		 return  woDoc; 
	}     
	  
// ---- MATERIALS RECS --- //
	function getMtlsIndex(woMtlsList, mtlCode) {
		var target_id =   mtlCode.trim();
		for (var i = 0; i < woMtlsList.length;  i++) {
			var sourceid  =   woMtlsList[i].mtl_code.trim();
			if (sourceid=== target_id) {
				if (_devMode) {console.log('Found W/O index', sourceid, i); }
				return i;
			}  //if
		} //for
		// else
		return -1;
	} // function getWoIndex

	function retrieveMtlsItem(woId, mtl_code){
		var woMtls = retrieveWoMtls(woId);
		var mtlsItem =  [];
		var mtlsItemIndex = getMtlsIndex(woMtls, mtl_code);
		if (mtlsItemIndex > -1)  {
			mtlsItem =  woMtls[mtlsItemIndex];
// console.log('retrieving single MTLS ITEM:', mtlsItem); 
		}
		return  mtlsItem; 
	}       

	function retrieveWoMtls(woId){
		// get W/O             
		var wo =  self.currentWo;
		// console.log('retrieving MTLS: ', wo.mtl);
		return  wo.mtl; 
	}          

	
		  
// ---- LABOR RECS --- //				  
	// ---- LABOR --- //

	function retrieveWoLabor(){
	// get W/O      
		if (angular.isUndefined(self.currentWo.labor)) {
			self.currentWo.labor = [];
		}
		if (_devMode) {console.log('retrieving LABOR: ', self.currentWo.labor); }
		return  self.currentWo.labor; 
	}  // function retrieveWoLabor
	

	function retrieveLaborItem(woId, seqNum) {
		var lbrItem =  [];
		var lbrItemIndex = getLbrIndex(wolbr, seqNum);
		if (lbrItemIndex > -1)  {
			lbrItem =  wolbr[seqNum];
//console.log('retrieving single lbr ITEM:', lbrItem); 
		}
		return  lbrItem; 
	}        

	function getWoLaborItem(woId, laborItem) {
		// get W/O    
	}
		

						  
// ---- ATTACHMENTS --- //	
	function retrieveListOfAttachments() {

		var wo =  self.currentWo;
		if ( angular.isUndefined(wo._attachments) ) {
if (_devMode) {console.log('attachments ARE UNDEFINED!!'); }
			return null;
		}
		else {
			 var keys = Object.keys(wo._attachments);
//console.log('found W/O attachments!!!!');
			//for (var i = 0; i < keys.length; i++) {
			   //  console.log(keys[i]);
			// }
			 return keys;
		}		
	}
			  
// ---- METERS --- //
		
		function retrieveListOfMeters(searchParam) {
			var lowerCaseSearchParam = searchParam.toString().toLowerCase();
			var newList = [];
			var masterList = self.MeterMaster;

			angular.forEach(masterList, function(meter) {
//console.log(meter.meter_no, 'v.', lowerCaseSearchParam); // => Object contains
				if (meter.meter_no.toLowerCase().indexOf(lowerCaseSearchParam)!=-1) {
					newList.push(meter);
				}
			}); // forEach
//console.log('DB Retrieve - newList ==>', newList);
			return newList;
		} // function retrieveListOfMeters


// ---- CATALOG --- //
		
		function retrieveCatalogList(searchParam) {
			var lowerCaseSearchParam = searchParam.toString().toLowerCase();
//console.log('DB Retrieve - searchParam ==>', searchParam);
			var newList = [];
			var masterList = self.CatalogMaster;

			angular.forEach(masterList, function(catItem) {
//console.log(catItem.catItem_no, 'v.', lowerCaseSearchParam); // => Object contains
				if (catItem.item_code.toLowerCase().indexOf(lowerCaseSearchParam)!=-1) {
					newList.push(catItem);
				}
			});

//console.log('DB Retrieve - newList ==>', newList);
			return newList;
		} // function retrieveListOfMeters


		
		function retrieveNotesInList() {
			var noteList = self.currentWo.notes;
// console.log('DATABASE - retrieveNotesInList for W/O ', self.currentWo);
			if (angular.isUndefined(noteList)) {
				 noteList = [];
			}
			
			return noteList;
		} // function retrieveNotesInList
		
		function retrieveNotesOutList() {
			var noteList = self.currentWo.mobnotes;
//console.log('DATABASE - retrieveNotes-OUT-List for W/O ', noteList, self.currentWo);
			if (angular.isUndefined(noteList)) {
				//self.currentWo.mobnotes = [];
				noteList = null;
			}	
			return noteList;
		} // function retrieveNotesInList
				
		function retrieveAlerts() {
			var noteList = self.currentWo.alerts;
// console.log('DATABASE - retrieveNotesInList for W/O ', self.currentWo);
			if (angular.isUndefined(noteList)) {
				self.currentWo.alerts = [];
				 noteList = null;
console.log('<><> CREATING EMPTY ALERTS list <><>',  self.currentWo);
			}
			
			return noteList;
		} // function retrieveAlerts

						
		function retrieveWoMeters() {
			var noteList = self.currentWo.meters;
// console.log('DATABASE - retrieveNotesInList for W/O ', self.currentWo);
			if (angular.isUndefined(noteList)) {
				self.currentWo.meters = [];
				 noteList = [];
console.log('<><> CREATING EMPTY WO-METERS list <><>',  self.currentWo);
			}
			
			return noteList;
		} // function retrieveWoMeters

	// --- DB UPDATES --- //
		function updateWoSubObj (whichObj, newObj) {				
			var tmpObj = [];
			var itemFound = false;
			var  ok = false;

			switch(whichObj) {
			case 'mobnotes':
				var noteList = self.currentWo.mobnotes;
if (_devMode) {console.log('updateWoSubObj ENTER-->', newObj); }
				if (angular.isUndefined(noteList)) { // this will be the first object in the array
					self.currentWo.mobnotes = []; 
				}
				else
				{ // first, confirm that this entry does not currently exist	
					var target_seqnum = newObj.seq_num;

					angular.forEach(noteList, function(forItem) {
if (_devMode) {console.log('checking forEach updateWoSubObj -->', forItem); }
						if (forItem.seq_num === target_seqnum) { // found the rec existing
							tmpObj.push(newObj); // add new Object
						itemFound = true;
if (_devMode) {console.log('FOUND EXISTING REC -->', forItem, newObj);  }
						} // if found the rec existing
						else {
							tmpObj.push(forItem);	 // else add the current forEach-item						
						} // not found - add old one to the tmpObj array
					}); // forEach								
				} // 

				if ( itemFound ){ // then replace
					self.currentWo.mobnotes = tmpObj;
				}
				else {  
					self.currentWo.mobnotes.push(newObj);
				}
if (_devMode) {console.log('updateWoSubObj - BEFORE DB UPDATE, itemFound & mobnotes:',  itemFound, self.currentWo.mobnotes); }
				ok = updateCurrWoDoc();

				return self.currentWo.mobnotes;
			case 'X':
				// code block;
				break;
			default:
				ok = false;		
			} // switch				
			//$rootScope.$broadcast('addMyNotes', newObj);
				
			 return [];			
		} // function updateWoSubObj


		function deleteWoSubObj (whichObj, objKeyValue) {				
			var tmpObj = [];
			var itemFound = false;
			var  ok = false;

			switch(whichObj) {
			case 'mobnotes':
				var noteList = self.currentWo.mobnotes;
if (_devMode) {console.log('deleteWoSubObj ENTER-->', objKeyValue); }
				if (angular.isUndefined(noteList)) { // this will be the first object in the array
					self.currentWo.mobnotes = []; 
				}
				else
				{ // copy all items except the one with the matching key 	
					var target_seqnum = objKeyValue;	

					angular.forEach(noteList, function(forItem) {
if (_devMode) {console.log('checking forEach deleteWoSubObj -->', forItem); }
						if (forItem.seq_num == target_seqnum) { // found the rec to be deleted
							itemFound = true;
if (_devMode) {console.log('FOUND EXISTING REC -->', forItem, objKeyValue);  }
						} 
						else {
							tmpObj.push(forItem);	 // else add the current forEach-item						
						} // not found - add to the tmpObj array
					}); // forEach								
				} // 

				if ( itemFound ){ // then replace
					self.currentWo.mobnotes = tmpObj;
				}
if (_devMode) {console.log('deleteWoSubObj - EXIT - itemFound & mobnotes:',  itemFound, self.currentWo.mobnotes); }
				ok = false;
				return self.currentWo.mobnotes;
			case 'X':
				// code block;
				break;
			default:
				ok = false;		
			} // switch				
			//$rootScope.$broadcast('addMyNotes', newObj);
				
			 return [];			
		} // function deleteWoSubObj


		

// ---- RESULTS ---- //
	return {
		// Admin DB functions
		changeWebUrl: function(isWeb) { changeWebUrl(isWeb); },
		isOnLine: function() {return self.isOnLine; },
		isRemoteDbSetToWeb: function() {return self.useWebUrl; },
		connectRemoteDb: function () {connectRemoteDb();},
		disconnectRemoteDb: function () {disconnectRemoteDb();},
		// update document 
		updateCurrWoDoc: function () {updateCurrWoDoc();},

		// Data DB functions
		currNumberOfWorkorders: function () {
				var numWorkorders = self.woMasterList.length;
			return numWorkorders; },

		getWoList: function () {return self.woMasterList;},               
		// getWo: function (woId) {return retrieveSingleWorkorder(woId);}, 
		setDefaultWo:  function (woId) {return setDefaultWo(woId);},  
		getDefaultWo: function () {return getDefaultWo();}, 
		getDefaultWoNum: function () {return self.currentWo; }, 
		getWoMtlsList: function (woId) {return retrieveWoMtls(woId);},        
		getWoMtlsItem: function (woId, mtl_code) {return retrieveMtlsItem(woId, mtl_code);} ,      
		getWoLaborList: function () {return retrieveWoLabor();},        
		getWoLaborItem: function (woId, mtl_code) {return retrieveLaborItem(woId, seqNum);},	
		getWoAttachList: function (woId) {return retrieveListOfAttachments();},    
		getWoAttachItem: function (woId, attachmentId) {return retrieveMtlsItem(woId, mtl_code);} ,

		getMeterList: function(searchParam) { return retrieveListOfMeters(searchParam); },

		getCatalogList: function(searchParam) { return retrieveCatalogList(searchParam); },

		getNotesInList: function() { return retrieveNotesInList(); },
		getNotesOutList: function() { return retrieveNotesOutList(); },
		getAlertsList: function() { return retrieveAlerts(); },

		getWoMeters: function() { return retrieveWoMeters(); },

		// Update functions 
		updateWoSubObj: function (whichObj, newObj) { return updateWoSubObj (whichObj, newObj); },
		deleteWoSubObj: function (whichObj, objKeyValue) { return deleteWoSubObj (whichObj, objKeyValue); }
		
	};
}
})();
