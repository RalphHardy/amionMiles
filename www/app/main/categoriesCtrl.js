(function () {
	'use strict';

	angular
		.module('amionApp')
		.controller('CategoriesCtrl', 
			['appDbSvc', 'currList', 
			'_devMode', '$ionicPopup','$state', '$scope', CategoriesCtrl]
			);

// APPROACH: change HTML view for each of the functions:
//  #1 - LIST VIEW -displays the  PLUS icon in header -> CLICK TO ADD  
//  	or CLICK on individual items to go into EDIT/DELETE MODE
//   #2 - ADD  VIEW - 
//   #3 - EDIT/DELETE MODE
//   
	function CategoriesCtrl(appDbSvc, currList, _devMode, $ionicPopup, $state, $scope) {
		var vm=this;

		vm.viewMode = "list"; // listView is initial view-state

		// vm.workorder = currWo; // WoDbSvc.getDefaultWo();
		// vm.wo_num = vm.workorder.wo_number;
		vm.dataItems = currList; 
		vm.dataItem = {};
		vm.formNameItem = [];

// 
// ---------------------------- VIEW LIST FUNCTIONS -----------------------------
// 
		vm.setViewModeBooleans = function() {
			vm.listView = (vm.viewMode === "list");
			vm.editView= (vm.viewMode === "edit");
			vm.addView= (vm.viewMode === "add");
console.log('function vmode: (list,edit,add)', vm.viewMode, vm.listView, vm.editView, vm.addView);
		}; // function setViewModeBooleans

		vm.changeForm = function () {
			console.log('CHANGE-FORM function');
			switch (vm.viewMode) { 
			case "list": 
				vm.viewMode = "add";
				vm.dataItem = {};
				//cat_name = '';
				//vm.cat_desc= '';
				break;
			case "add":
				vm.viewMode = "list";
				break;
			case "edit":
				vm.viewMode = "list";
				vm.dataItem.cat_name = item.cat_name;
				vm.dataItem.cat_desc= item.cat_desc;
				break;
			} // switch
			vm.setViewModeBooleans();
		};

		
		
		
		vm.submitData = function () {	
			if (vm.viewMode === "add") { // add a new record
				// vm.dataItem.cat_name = vm.cat_name;
				// vm.dataItem.cat_desc = vm.cat_desc;
console.log('Submit-Data - add');
			} else { // update the record with changes 

console.log('Submit-Data - edit');
			}
			vm.dataItems = appDbSvc.updateData ('categories', vm.dataItem);
			vm.viewMode = "list";
			vm.setViewModeBooleans();
		}; // function submitData

		vm.cancelForm = function () {	
			vm.viewMode = "list";
			vm.setViewModeBooleans();
		}; // function addForm
// 
// ---------------------------- ADD NOTE FUNCTIONS -----------------------------
// 
		vm.gotoAddForm = function() {
			vm.listView = false; // turn off  listScreen
			//-- Create default fields & empty-field values -- // 
console.log('inside gotoAddForm()');

			vm.add_label = null;
			vm.add_note_desc = null;			
			vm.add_alert ='medium';
			// vm.add_seq_num =  getNextNum();
			vm.addView = true;
		}; // function gotoAddForm


		function getNextNum() {
			if  (vm.notes  === null) {
				return 1;
			} else {
				return vm.notes.length + 1;	
			}
		} // vm.add_seq_num =  


		vm.addNote = function () {	
			var tmpNoteObj = {};
			tmpNoteObj.seq_num = vm.add_seq_num;
			tmpNoteObj.note_label = vm.add_label;
			tmpNoteObj.note_desc = vm.add_note_desc;
			tmpNoteObj.alert = vm.add_alert;

			vm.notes = WoDbSvc.updateWoSubObj('mobnotes', tmpNoteObj);
			
			/**** 
			if  ( (typeof  vm.notes  === "object") && ( vm.notes  === null ) ) {
				vm.notes  = [tmpNoteObj];
			}
			else {
				vm.notes .push(tmpNoteObj);
			}
			***/
if (_devMode) {console.log('CTRL: NOTE ADD - tmpNoteObj', vm.notes); }	
			// vm.seq_num = vm.seq_num++;
			vm.addView = false;
			vm.listView = true;
		}; // function addForm


// 
// ---------------------------- EDIT NOTE  FUNCTIONS -----------------------------
// 

		vm.gotoEditDelete = function(item) {
			vm.listView = false; // turn off  listScreen
if (_devMode) {console.log('changing to EDIT MODE ...', item.note_label,  item.note_desc );}
			vm.edit_seqnum = item.seq_num;
			vm.edit_label = item.note_label;
			vm.edit_desc = item.note_desc;
			vm.edit_alert = item.alert;

			vm.editView =  true;
		}; // function gotoAddForm


		vm.submitEdit = function () {	
			var tmpNoteObj = {};
			tmpNoteObj.seq_num = vm.edit_seqnum;
			tmpNoteObj.note_label = vm.edit_label;
			tmpNoteObj.note_desc = vm.edit_desc;
			tmpNoteObj.alert = vm.edit_alert;
if (_devMode) {console.log('CTRL: SUBMIT EDIT - tmpNoteObj', tmpNoteObj); }	

			vm.notes  = WoDbSvc.updateWoSubObj('mobnotes', tmpNoteObj);
			
if (_devMode) {console.log('CTRL: SUBMIT EDIT - vm.notes', vm.notes); }	
			// vm.seq_num = vm.seq_num++;
			vm.editView = false;
			vm.listView = true;
		}; // function addForm


// 
// ---------------------------- DELETE NOTE  FUNCTIONS -----------------------------
// 
		
		vm.gotoDeleteForm = function() {

			var confirmPopup = $ionicPopup.confirm({
			    title: 'Delete Note?',
			    template: 'Are you sure you want to delete this note?'
			});
			confirmPopup.then(function(res) {
			    if(res) { // do it ...
				vm.notes  = WoDbSvc.deleteWoSubObj('mobnotes', vm.edit_seqnum);
if (_devMode) {console.log('deleting My NOTE ', vm.edit_seqnum ); }
				vm.editView = false;
				vm.listView = true;
				$state.go('app.mynotes');
			    }
			});

		}; // function gotoAddForm


	} // function NotesOutCtrl

}() );