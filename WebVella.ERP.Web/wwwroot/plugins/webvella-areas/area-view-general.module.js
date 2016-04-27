﻿/* entities.module.js */

/**
* @desc this module manages the application home desktop screen
*/

(function () {
	'use strict';

	angular
        .module('webvellaAreas') //only gets the module, already initialized in the base.module of the plugin. The lack of dependency [] makes the difference.
        .config(config)
        .controller('WebVellaAreaViewGeneralController', controller)
        .controller('ManageRelationFieldModalController', ManageRelationFieldModalController)
		.controller('SelectTreeNodesModalController', SelectTreeNodesModalController);

	// Configuration ///////////////////////////////////
	config.$inject = ['$stateProvider'];


	function config($stateProvider) {
		$stateProvider
		//general view in an area with view sidebar
		.state('webvella-areas-view-general', {
			parent: 'webvella-area-base',
			url: '/view-general/sb/:viewName/:recordId/:regionName',
			params: {
				regionName: { value: "default", squash: true }
			},
			views: {
				"topnavView": {
					controller: 'WebVellaAreasTopnavController',
					templateUrl: '/plugins/webvella-areas/topnav.view.html',
					controllerAs: 'topnavData'
				},
				"sidebarView": {
					controller: 'WebVellaAreasRecordViewSidebarController',
					templateUrl: '/plugins/webvella-areas/view-record-sidebar.view.html',
					controllerAs: 'sidebarData'
				},
				"contentView": {
					controller: 'WebVellaAreaViewGeneralController',
					templateUrl: '/plugins/webvella-areas/area-view-general.view.html',
					controllerAs: 'ngCtrl'
				}
			},
			resolve: {
				loadDependency: loadDependency,
				resolvedCurrentParentView: function () { return null; },
				resolvedCurrentView: resolveCurrentView
			}
		})
		//general view in an area with the area sidebar
		.state('webvella-areas-view-general-no-sidebar', {
			parent: 'webvella-area-base',
			url: '/view-general/nsb/:viewName/:recordId/:regionName',
			params: {
				regionName: { value: "default", squash: true }
			},
			views: {
				"topnavView": {
					controller: 'WebVellaAreasTopnavController',
					templateUrl: '/plugins/webvella-areas/topnav.view.html',
					controllerAs: 'topnavData'
				},
				"sidebarView": {
					controller: 'WebVellaAreasSidebarController',
					templateUrl: '/plugins/webvella-areas/sidebar.view.html',
					controllerAs: 'sidebarData'
				},
				"contentView": {
					controller: 'WebVellaAreaViewGeneralController',
					templateUrl: '/plugins/webvella-areas/area-view-general.view.html',
					controllerAs: 'ngCtrl'
				}
			},
			resolve: {
				loadDependency: loadDependency,
				resolvedCurrentParentView: function () { return null; },
				resolvedCurrentView: resolveCurrentView
			}
		})
		.state('webvella-areas-view-general-in-view', {
			parent: 'webvella-area-base',
			url: '/view-general/sb/:parentViewName/:recordId/view-general/:viewName/:regionName',
			params: {
				regionName: { value: "default", squash: true }
			},
			views: {
				"topnavView": {
					controller: 'WebVellaAreasTopnavController',
					templateUrl: '/plugins/webvella-areas/topnav.view.html',
					controllerAs: 'topnavData'
				},
				"sidebarView": {
					controller: 'WebVellaAreasRecordViewSidebarController',
					templateUrl: '/plugins/webvella-areas/view-record-sidebar.view.html',
					controllerAs: 'sidebarData'
				},
				"contentView": {
					controller: 'WebVellaAreaViewGeneralController',
					templateUrl: '/plugins/webvella-areas/area-view-general.view.html',
					controllerAs: 'ngCtrl'
				}
			},
			resolve: {
				loadDependency: loadDependency,
				resolvedCurrentParentView: resolveCurrentParentView,
				resolvedCurrentView: resolveCurrentView
			}
		});
	};

	//#region << Resolve Function >> /////////////////////////
	resolveCurrentParentView.$inject = ['$q', '$log', 'webvellaCoreService', '$stateParams', '$state', '$timeout', 'resolvedCurrentEntityMeta'];
	function resolveCurrentParentView($q, $log, webvellaCoreService, $stateParams, $state, $timeout, resolvedCurrentEntityMeta) {

		// Initialize
		var defer = $q.defer();

		// Process
		function successCallback(response) {
			if (response.object === null) {
				alert("error in response!");
			}
			else if (response.object.meta === null) {
				alert("The view with name: " + $stateParams.parentViewName + " does not exist");
			} else {
				defer.resolve(response.object);
			}
		}

		function errorCallback(response) {
			if (response.object === null) {
				alert("error in response!");
			}
			else {
				defer.reject(response.message);
			}
		}

		var userHasUpdateEntityPermission = webvellaCoreService.userHasRecordPermissions(resolvedCurrentEntityMeta, "canRead");
		if (!userHasUpdateEntityPermission) {
			alert("you do not have permissions to view records from this entity!");
			defer.reject("you do not have permissions to view records from this entity");
		}

		webvellaCoreService.getRecordByViewName($stateParams.recordId, $stateParams.parentViewName, $stateParams.entityName, successCallback, errorCallback);

		return defer.promise;
	}

	resolveCurrentView.$inject = ['$q', '$log', 'webvellaCoreService', '$stateParams', '$state', '$timeout', 'resolvedCurrentEntityMeta', 'resolvedCurrentParentView'];

	function resolveCurrentView($q, $log, webvellaCoreService, $stateParams, $state, $timeout, resolvedCurrentEntityMeta, resolvedCurrentParentView) {

		// Initialize
		var defer = $q.defer();

		// Process
		function successCallback(response) {
			if (response.object === null) {
				alert("error in response!");
			}
			else if (response.object.meta === null) {
				alert("The view with name: " + $stateParams.viewName + " does not exist");
			} else {
				defer.resolve(response.object);
			}
		}

		function errorCallback(response) {
			if (response.object === null) {
				alert("error in response!");
			}
			else {
				defer.reject(response.message);
			}
		}

		var userHasUpdateEntityPermission = webvellaCoreService.userHasRecordPermissions(resolvedCurrentEntityMeta, "canRead");
		if (!userHasUpdateEntityPermission) {
			alert("you do not have permissions to view records from this entity!");
			defer.reject("you do not have permissions to view records from this entity");
		}
		var parentView = fastCopy(resolvedCurrentParentView);
		if (parentView == null) {
			webvellaCoreService.getRecordByViewName($stateParams.recordId, $stateParams.viewName, $stateParams.entityName, successCallback, errorCallback);
		}
		else {
			var currentView = {};
			currentView.meta = null;
			currentView.data = [];
			if ($stateParams.viewName.startsWith("$view$")) {
				//View from the same entity
				parentView.meta.sidebar.items.forEach(function (sidebarItem) {
					if (sidebarItem.dataName == $stateParams.viewName) {
						currentView.meta = sidebarItem.meta;
						currentView.data = parentView.data[0][$stateParams.viewName];
					}
				});
				defer.resolve(currentView);
			}
			else {

			}

		}

		return defer.promise;
	}

	loadDependency.$inject = ['$ocLazyLoad', '$q', '$http', '$state', '$timeout', '$stateParams', 'wvAppConstants', 'resolvedCurrentEntityMeta', 'resolvedCurrentParentView', 'resolvedEntityRelationsList'];
	function loadDependency($ocLazyLoad, $q, $http, $state, $timeout, $stateParams, wvAppConstants, resolvedCurrentEntityMeta, resolvedCurrentParentView, resolvedEntityRelationsList) {
		var lazyDeferred = $q.defer();
		var listServiceJavascriptPath = "";
		if (resolvedCurrentParentView == null) {
			//Parent view is reviewed
			listServiceJavascriptPath = wvAppConstants.apiBaseUrl + 'meta/entity/' + $stateParams.entityName + '/view/' + $stateParams.viewName + '/service.js?v=' + resolvedCurrentEntityMeta.hash;
		}
		else {
			//A view in another view is reviewed
			var dataNameArray = fastCopy($stateParams.viewName).split('$');
			if (dataNameArray.length < 3 || dataNameArray.length > 4) {
				lazyDeferred.reject("The view dataName is not correct");
			}
			else if (dataNameArray.length == 3) {
				//it is view from the current entity  e.g. $view$second
				var realViewName = dataNameArray[2];
				listServiceJavascriptPath = wvAppConstants.apiBaseUrl + 'meta/entity/' + $stateParams.entityName + '/view/' + realViewName + '/service.js?v=' + resolvedCurrentEntityMeta.hash;
			}
			else {
				//e.g. "$view$project_1_n_ticket$general"
				//extract the real view name
				var viewRealName = dataNameArray[3];
				//find the other entity in the relation so we can include it in the request
				var viewRealEntity = null;
				resolvedEntityRelationsList.forEach(function (relation) {
					if (relation.name == dataNameArray[2]) {
						if (relation.originEntityName == $stateParams.entityName) {
							viewRealEntity = relation.targetEntityName;
						}
						else if (relation.targetEntityName == $stateParams.entityName) {
							viewRealEntity = relation.originEntityName;
						}
					}
				});
				if (viewRealEntity == null) {
					lazyDeferred.reject("Cannot find the list real entity name");
				}
				else {
					listServiceJavascriptPath = wvAppConstants.apiBaseUrl + 'meta/entity/' + viewRealEntity + '/view/' + viewRealName + '/service.js?v=' + moment().toISOString();	//do not have the hash of the real entity here
				}
			}
		}



		var loadFilesArray = [];
		loadFilesArray.push(listServiceJavascriptPath);

		return $ocLazyLoad.load({
			cache: false,
			files: loadFilesArray
		}).then(function () {
			return lazyDeferred.resolve("ready");
		},
		function error(err) {
			$timeout(function () {
				$state.go('webvella-core-error', { 'code': '404', 'url': "some-url-error" });
			}, 0);
			lazyDeferred.reject(err);
			//return err;
		});

	}

	//#endregion


	// Controller ///////////////////////////////

	controller.$inject = ['$filter', '$uibModal', '$log', '$q', '$rootScope', '$state', '$stateParams', '$scope', '$window', 'pageTitle', 'webvellaCoreService',
        'resolvedAreas', '$timeout', 'resolvedCurrentView', 'ngToast', 'wvAppConstants', 'resolvedCurrentEntityMeta', 'resolvedEntityRelationsList', 'resolvedCurrentUser',
		'resolvedCurrentUserEntityPermissions', 'webvellaViewActionService', '$sessionStorage', 'resolvedCurrentParentView'];


	function controller($filter, $uibModal, $log, $q, $rootScope, $state, $stateParams, $scope, $window, pageTitle, webvellaCoreService,
        resolvedAreas, $timeout, resolvedCurrentView, ngToast, wvAppConstants, resolvedCurrentEntityMeta, resolvedEntityRelationsList, resolvedCurrentUser,
		resolvedCurrentUserEntityPermissions, webvellaViewActionService, $sessionStorage, resolvedCurrentParentView) {

		//#region << ngCtrl initialization >>
		var ngCtrl = this;
		//#endregion

		//#region <<Set Page meta>>
		ngCtrl.pageTitle = "Area Entities | " + pageTitle;
		webvellaCoreService.setPageTitle(ngCtrl.pageTitle);
		ngCtrl.currentArea = webvellaCoreService.getCurrentAreaFromAreaList($stateParams.areaName, resolvedAreas.data);
		webvellaCoreService.setBodyColorClass(ngCtrl.currentArea.color);
		ngCtrl.currentState = $state.current;
		//#endregion

		//#region << Initialize main objects >>
		ngCtrl.view = {};
		ngCtrl.view.meta = fastCopy(resolvedCurrentView.meta);
		ngCtrl.view.data = fastCopy(resolvedCurrentView.data);
		if (resolvedCurrentParentView == null) {
			ngCtrl.parentView = null;
		}
		else {
			ngCtrl.parentView = {};
			ngCtrl.parentView.meta = fastCopy(resolvedCurrentParentView.meta);
			ngCtrl.parentView.data = fastCopy(resolvedCurrentParentView.data[0]);
		}
		ngCtrl.entity = fastCopy(resolvedCurrentEntityMeta);
		ngCtrl.entityRelations = fastCopy(resolvedEntityRelationsList);
		ngCtrl.areas = fastCopy(resolvedAreas.data);
		ngCtrl.currentUser = fastCopy(resolvedCurrentUser);
		ngCtrl.$sessionStorage = $sessionStorage;
		ngCtrl.stateParams = $stateParams;
		//#endregion

		//#region << Init aux objects >>
		ngCtrl.currentUserEntityPermissions = fastCopy(resolvedCurrentUserEntityPermissions);
		//#endregion

		//#region << Initialize general views alternatives >>
		ngCtrl.generalViews = [];
		ngCtrl.entity.recordViews.forEach(function (view) {
			if (view.type == "general") {
				ngCtrl.generalViews.push(view);
			}
		});
		ngCtrl.generalViews.sort(function (a, b) { return parseFloat(a.weight) - parseFloat(b.weight) });
		//#endregion

		//#region << Run  webvellaViewActionService.onload >>
		if (webvellaViewActionService.onload === undefined || typeof (webvellaViewActionService.onload) != "function") {
			$log.warn("No webvellaViewActionService.onload function. Skipping");
		}
		else {
			var actionsOnLoadResult = webvellaViewActionService.onload(ngCtrl, $rootScope, $state);
			if (actionsOnLoadResult != true) {
				ngCtrl.validation.hasError = true;
				ngCtrl.validation.errorMessage = $sce.trustAsHtml(actionsOnLoadResult);
			}
		}
		//#endregion

		//#region << Entity relations functions >>
		ngCtrl.getRelation = function (relationName) {
			for (var i = 0; i < ngCtrl.entityRelations.length; i++) {
				if (ngCtrl.entityRelations[i].name == relationName) {
					//set current entity role
					if (ngCtrl.entity.id == ngCtrl.entityRelations[i].targetEntityId && ngCtrl.entity.id == ngCtrl.entityRelations[i].originEntityId) {
						ngCtrl.entityRelations[i].currentEntityRole = 3; //both origin and target
					}
					else if (ngCtrl.entity.id == ngCtrl.entityRelations[i].targetEntityId && ngCtrl.entity.id != ngCtrl.entityRelations[i].originEntityId) {
						ngCtrl.entityRelations[i].currentEntityRole = 2; //target
					}
					else if (ngCtrl.entity.id != ngCtrl.entityRelations[i].targetEntityId && ngCtrl.entity.id == ngCtrl.entityRelations[i].originEntityId) {
						ngCtrl.entityRelations[i].currentEntityRole = 1; //origin
					}
					else if (ngCtrl.entity.id != ngCtrl.entityRelations[i].targetEntityId && ngCtrl.entity.id != ngCtrl.entityRelations[i].originEntityId) {
						ngCtrl.entityRelations[i].currentEntityRole = 0; //possible problem
					}
					return ngCtrl.entityRelations[i];
				}
			}
			return null;
		}
		//#endregion

		//#region << Permission checks >>
		ngCtrl.currentUserHasReadPermission = function (item) {
			var result = false;
			if (!item.meta.enableSecurity || item.meta.permissions == null) {
				return true;
			}
			for (var i = 0; i < ngCtrl.currentUser.roles.length; i++) {
				for (var k = 0; k < item.meta.permissions.canRead.length; k++) {
					if (item.meta.permissions.canRead[k] == ngCtrl.currentUser.roles[i]) {
						result = true;
					}
				}
			}
			return result;
		}

		ngCtrl.currentUserHasUpdatePermission = function (item) {
			var result = false;
			//Check first if the entity allows it
			var userHasUpdateEntityPermission = webvellaCoreService.userHasRecordPermissions(ngCtrl.entity, "canUpdate");
			if (!userHasUpdateEntityPermission) {
				return false;
			}
			if (!item.meta.enableSecurity) {
				return true;
			}
			for (var i = 0; i < ngCtrl.currentUser.roles.length; i++) {
				for (var k = 0; k < item.meta.permissions.canUpdate.length; k++) {
					if (item.meta.permissions.canUpdate[k] == ngCtrl.currentUser.roles[i]) {
						result = true;
					}
				}
			}
			return result;
		}

		ngCtrl.userHasRecordDeletePermission = function () {
			return webvellaCoreService.userHasRecordPermissions(ngCtrl.entity, "canDelete");
		}

		ngCtrl.userHasRecordPermissions = function (permissionsCsv) {
			return webvellaCoreService.userHasRecordPermissions(ngCtrl.entity, permissionsCsv);
		}



		//The goal for this method is to check the permissions that this user has to change either the current record or the related record in the N:N case
		//The reason is:	when relation type 1:N or 1:1 only the target's record data is changed
		//					when relation type N:N the target's and the origin's record data is changed
		//User needs to have update permissions to change data
		ngCtrl.currentUserHasUpdatePermissionRelation = function (item) {
			var userHasUpdatePermission = false;
			var relation = ngCtrl.getRelation(item.relationName);
			var currentEntityId = ngCtrl.entity.id;
			var currentEntityIsRelationStatus = 1; // 1 - origin, 2- target, 3 - both
			if (relation.originEntityId == relation.targetEntityId && relation.originEntityId == currentEntityId) {
				currentEntityIsRelationStatus = 3;
			}
			else if (relation.targetEntityId == currentEntityId) {
				currentEntityIsRelationStatus = 2;
			}

			//Case 0: the current entity is both item and origin. 
			//		  User should have permission to update both fields in the current entity
			if (currentEntityIsRelationStatus == 3) {
				var originFieldMeta = null;
				var userCanUpdateOrigin = false;
				var targetFieldMeta = null;
				var userCanUpdateTarget = false;
				for (var i = 0; i < ngCtrl.entity.fields.length; i++) {
					if (ngCtrl.entity.fields[i].id == relation.originFieldId) {
						originFieldMeta = ngCtrl.entity.fields[i];
					}
					else if (ngCtrl.entity.fields[i].id == relation.targetFieldId) {
						targetFieldMeta = ngCtrl.entity.fields[i];
					}
				}
				//Check basic security
				if (!originFieldMeta.enableSecurity) {
					userCanUpdateOrigin = true;
				}

				if (!targetFieldMeta.enableSecurity) {
					userCanUpdateTarget = true;
				}

				for (var i = 0; i < ngCtrl.currentUser.roles.length; i++) {
					//Check if origin has this role
					if (!userCanUpdateOrigin) {
						for (var k = 0; k < originFieldMeta.permissions.canUpdate.length; k++) {
							if (originFieldMeta.permissions.canUpdate[k] == ngCtrl.currentUser.roles[i]) {
								userCanUpdateOrigin = true;
								break;
							}
						}
					}
					//Check if target has this role
					if (!userCanUpdateTarget) {
						for (var k = 0; k < targetFieldMeta.permissions.canUpdate.length; k++) {
							if (targetFieldMeta.permissions.canUpdate[k] == ngCtrl.currentUser.roles[i]) {
								userCanUpdateTarget = true;
								break;
							}
						}
					}
				}
				if (userCanUpdateOrigin && userCanUpdateTarget) {
					userHasUpdatePermission = true;
				}
				else {
					//we need to find the corresponding field from the current entity
					if (relation.originFieldId == item.meta.id) {
						//the field from the current entity is than target
						checkedFieldId = relation.targetFieldId;
					}
				}
			}
				//Case 1: (1:1 or 1:N) and the current entity is target
				//						the user should have permission to change the current Entity's field
			else if (currentEntityIsRelationStatus == 2 && (relation.relationType == 1 || relation.relationType == 2)) {
				var currentEntityFieldMeta = null;
				for (var i = 0; i < ngCtrl.entity.fields.length; i++) {
					if (ngCtrl.entity.fields[i].id == relation.targetFieldId) {
						currentEntityFieldMeta = ngCtrl.entity.fields[i];
					}
				}
				if (currentEntityFieldMeta != null) {
					if (!currentEntityFieldMeta.enableSecurity) {
						userHasUpdatePermission = true;
					}
					else {
						for (var i = 0; i < ngCtrl.currentUser.roles.length; i++) {
							for (var k = 0; k < currentEntityFieldMeta.permissions.canUpdate.length; k++) {
								if (currentEntityFieldMeta.permissions.canUpdate[k] == ngCtrl.currentUser.roles[i]) {
									userHasUpdatePermission = true;
									break;
								}
							}
						}
					}
				}
			}
				//Case 2: (1:1 or 1:N) and the current entity is origin
			else if (currentEntityIsRelationStatus == 1 && (relation.relationType == 1 || relation.relationType == 2)) {
				if (!item.meta.enableSecurity) {
					userHasUpdatePermission = true;
				}
				else {
					for (var i = 0; i < ngCtrl.currentUser.roles.length; i++) {
						for (var k = 0; k < item.meta.permissions.canUpdate.length; k++) {
							if (item.meta.permissions.canUpdate[k] == ngCtrl.currentUser.roles[i]) {
								userHasUpdatePermission = true;
								break;
							}
						}
					}
				}
			}
				//Case 3: (N:N) 	no matter if the current entity is origin or target
				//					user should have permission to update both fields in both entities 
			else if (relation.relationType == 3) {
				var originFieldMeta = null;
				var userCanUpdateOrigin = false;
				var targetFieldMeta = null;
				var userCanUpdateTarget = false;
				//get origin field meta
				if (currentEntityIsRelationStatus == 1) {
					for (var i = 0; i < ngCtrl.entity.fields.length; i++) {
						if (ngCtrl.entity.fields[i].id == relation.originFieldId) {
							originFieldMeta = ngCtrl.entity.fields[i];
						}
					}
					targetFieldMeta = item.meta;
				}
				else {
					originFieldMeta = item.meta;
					for (var i = 0; i < ngCtrl.entity.fields.length; i++) {
						if (ngCtrl.entity.fields[i].id == relation.targetFieldId) {
							targetFieldMeta = ngCtrl.entity.fields[i];
						}
					}
				}

				//Check basic security
				if (!originFieldMeta.enableSecurity) {
					userCanUpdateOrigin = true;
				}

				if (!targetFieldMeta.enableSecurity) {
					userCanUpdateTarget = true;
				}

				for (var i = 0; i < ngCtrl.currentUser.roles.length; i++) {
					//Check if origin has this role
					if (!userCanUpdateOrigin) {
						for (var k = 0; k < originFieldMeta.permissions.canUpdate.length; k++) {
							if (originFieldMeta.permissions.canUpdate[k] == ngCtrl.currentUser.roles[i]) {
								userCanUpdateOrigin = true;
								break;
							}
						}
					}
					//Check if target has this role
					if (!userCanUpdateTarget) {
						for (var k = 0; k < targetFieldMeta.permissions.canUpdate.length; k++) {
							if (targetFieldMeta.permissions.canUpdate[k] == ngCtrl.currentUser.roles[i]) {
								userCanUpdateTarget = true;
								break;
							}
						}
					}
				}
				if (userCanUpdateOrigin && userCanUpdateTarget) {
					userHasUpdatePermission = true;
				}
				else {
					userHasUpdatePermission = false;
				}
			}

			return userHasUpdatePermission;
		}

		ngCtrl.recursiveObjectCanDo = function (permissionName, relatedEntityName) {
			var currentEntityPermissions = {};
			var relatedEntityPermissions = {};
			for (var i = 0; i < ngCtrl.currentUserEntityPermissions.length; i++) {
				if (ngCtrl.currentUserEntityPermissions[i].entityName == ngCtrl.entity.name) {
					currentEntityPermissions = ngCtrl.currentUserEntityPermissions[i];
				}
				if (ngCtrl.currentUserEntityPermissions[i].entityName == relatedEntityName) {
					relatedEntityPermissions = ngCtrl.currentUserEntityPermissions[i];
				}
			}
			switch (permissionName) {
				case "can-add-existing":
					if (currentEntityPermissions.canUpdate) {
						return true;
					}
					else {
						return false;
					}
					break;
				case "can-create":
					if (currentEntityPermissions.canUpdate && relatedEntityPermissions.canCreate) {
						return true;
					}
					else {
						return false;
					}
					break;
				case "can-edit":
					if (relatedEntityPermissions.canUpdate) {
						return true;
					}
					else {
						return false;
					}
					break;
				case "can-remove":
					if (currentEntityPermissions.canUpdate) {
						return true;
					}
					else {
						return false;
					}
					break;
			}
		}

		//#endregion

		//#region << Render >>
		ngCtrl.renderFieldValue = webvellaCoreService.renderFieldValue;
		ngCtrl.getRelationLabel = function (item) {
			if (item.fieldLabel) {
				return item.fieldLabel
			}
			else {
				var relationName = item.relationName;
				var relation = findInArray(ngCtrl.entityRelations, "name", relationName);
				if (relation) {
					return relation.label;
				}
				else {
					return "";
				}
			}
		}
		//Date & DateTime 
		ngCtrl.getTimeString = function (item) {
			if (item && item.dataName && ngCtrl.view.data[item.dataName]) {
				var fieldValue = ngCtrl.view.data[item.dataName];
				if (!fieldValue) {
					return "";
				} else {
					return $filter('date')(fieldValue, "HH:mm");
				}
			}
		}

		//#endregion

		//#region << Logic >>

		//#region << Section collapse>>
		ngCtrl.toggleSectionCollapse = function (section) {
			section.collapsed = !section.collapsed;
		}
		//#endregion

		ngCtrl.goToRegion = function (regionName) {
			webvellaCoreService.GoToState(ngCtrl.currentState.name, { areaName: ngCtrl.stateParams.areaName, entityName: ngCtrl.stateParams.entityName, viewName: ngCtrl.stateParams.viewName, recordId: ngCtrl.stateParams.recordId, regionName: regionName })
		}


		//#region << Html box helpers >>

		//Init
		$scope.editorOptions = {
			language: GlobalLanguage,
			skin: 'moono',
			height: '160',
			contentsCss: '/plugins/webvella-core/css/editor.css',
			extraPlugins: "sourcedialog",
			allowedContent: true,
			toolbarLocation: 'top',
			toolbar: 'full',
			toolbar_full: [
				{ name: 'basicstyles', items: ['Save', 'Bold', 'Italic', 'Strike', 'Underline'] },
				{ name: 'paragraph', items: ['BulletedList', 'NumberedList', 'Blockquote'] },
				{ name: 'editing', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
				{ name: 'links', items: ['Link', 'Unlink'] },
				{ name: 'clipboard', items: ['Undo', 'Redo'] },
				{ name: 'styles', items: ['Format', 'FontSize', 'TextColor', 'PasteText', 'PasteFromWord', 'RemoveFormat'] },
				{ name: 'insert', items: ['Image', 'Table', 'SpecialChar', 'Sourcedialog'] }, '/',
			]
		};

		//on #content check if mouse is clicked outside the editor, so to perform a possible field update
		ngCtrl.checkMouseButton = function ($event) {
			if (ngCtrl.lastEnabledHtmlField != null) {
				ngCtrl.fieldUpdate(ngCtrl.lastEnabledHtmlField, ngCtrl.view.data[ngCtrl.lastEnabledHtmlField.dataName], ngCtrl.view.data["id"]);
				ngCtrl.lastEnabledHtmlFieldData = null;
				ngCtrl.lastEnabledHtmlField = null;
			}
			else {
				//Do nothing as this is a normal mouse click
			}
		}
		//on the editor textarea, prevent save when the mouse click is in the editor
		ngCtrl.preventMouseSave = function ($event) {
			if ($event.currentTarget.className.indexOf("cke_focus") > -1) {
				$event.stopPropagation();
			}
		}
		//save without unblur on ctrl+S, prevent exiting the textarea on tab, cancel change on esc
		ngCtrl.htmlFieldCheckEscapeKey = function ($event, item) {
			if ($event.keyCode == 27) { // escape key maps to keycode `27`
				//As the id is dynamic in our case and there is a problem with ckeditor and dynamic id-s we should use ng-attr-id in the html and here to cycle through all instances and find the current bye its container.$.id
				for (var property in CKEDITOR.instances) {
					if (CKEDITOR.instances[property].container.$.id == item.meta.name) {

						CKEDITOR.instances[property].editable().$.blur();
						//reinit the field
						ngCtrl.view.data[item.dataName] = fastCopy(ngCtrl.lastEnabledHtmlFieldData);
						ngCtrl.lastEnabledHtmlField = null;
						ngCtrl.lastEnabledHtmlFieldData = null;
						return false;
					}
				}
				var idd = 0;
			}
			else if ($event.keyCode == 9) { // tab key maps to keycode `9`
				$event.preventDefault();
				return false;
			}
			else if ($event.ctrlKey || $event.metaKey) {
				switch (String.fromCharCode($event.which).toLowerCase()) {
					case 's':

						$event.preventDefault();
						$timeout(function () {
							ngCtrl.fieldUpdate(ngCtrl.lastEnabledHtmlField, ngCtrl.view.data[ngCtrl.lastEnabledHtmlField.dataName], ngCtrl.view.data["id"]);
						}, 500);
						return false;
						break;
				}
			}
			return true;
		}

		ngCtrl.lastEnabledHtmlField = null;
		ngCtrl.lastEnabledHtmlFieldData = null;
		ngCtrl.htmlFieldIsEnabled = function ($event, item) {
			ngCtrl.lastEnabledHtmlField = item;
			ngCtrl.lastEnabledHtmlFieldData = fastCopy(ngCtrl.view.data[item.dataName]);
		}

		//#endregion

		//#region << Date time helpers >>
		ngCtrl.opened = {};
		ngCtrl.open = function (dataName, isOpen) {
			ngCtrl.opened[dataName] = isOpen;
		}
		//#endregion

		//#region << File upload >>
		ngCtrl.files = {}; // this is the data wrapper for the temporary upload objects that will be used in the html and for which we will generate watches below
		ngCtrl.progress = {}; //data wrapper for the progress percentage for each upload

		/////////Register variables
		for (var regionIndex = 0; regionIndex < ngCtrl.view.meta.regions.length; regionIndex++) {
			for (var sectionIndex = 0; sectionIndex < ngCtrl.view.meta.regions[regionIndex].sections.length; sectionIndex++) {
				for (var rowIndex = 0; rowIndex < ngCtrl.view.meta.regions[regionIndex].sections[sectionIndex].rows.length; rowIndex++) {
					for (var columnIndex = 0; columnIndex < ngCtrl.view.meta.regions[regionIndex].sections[sectionIndex].rows[rowIndex].columns.length; columnIndex++) {
						for (var itemIndex = 0; itemIndex < ngCtrl.view.meta.regions[regionIndex].sections[sectionIndex].rows[rowIndex].columns[columnIndex].items.length; itemIndex++) {
							if (ngCtrl.view.meta.regions[regionIndex].sections[sectionIndex].rows[rowIndex].columns[columnIndex].items[itemIndex].meta.fieldType === 7
								|| ngCtrl.view.meta.regions[regionIndex].sections[sectionIndex].rows[rowIndex].columns[columnIndex].items[itemIndex].meta.fieldType === 9) {
								var item = ngCtrl.view.meta.regions[regionIndex].sections[sectionIndex].rows[rowIndex].columns[columnIndex].items[itemIndex];
								var FieldName = item.dataName;
								ngCtrl.progress[FieldName] = 0;
							}
						}
					}
				}
			}
		}
		ngCtrl.getProgressStyle = function (name) {
			return "width: " + ngCtrl.progress[name] + "%;";
		}

		ngCtrl.uploadedFileName = "";
		ngCtrl.upload = function (file, item) {
			if (file != null) {
				ngCtrl.uploadedFileName = item.dataName;
				ngCtrl.moveSuccessCallback = function (response) {
					$timeout(function () {
						ngCtrl.view.data[ngCtrl.uploadedFileName] = response.object.url;
						ngCtrl.fieldUpdate(item, response.object.url, ngCtrl.view.data["id"]);
					}, 1);
				}

				ngCtrl.uploadSuccessCallback = function (response) {
					var tempPath = response.object.url;
					var fileName = response.object.filename;
					var targetPath = "/fs/" + ngCtrl.entity.name + "/" + newGuid() + "/" + fileName;
					var overwrite = false;
					webvellaCoreService.moveFileFromTempToFS(tempPath, targetPath, overwrite, ngCtrl.moveSuccessCallback, ngCtrl.uploadErrorCallback);
				}
				ngCtrl.uploadErrorCallback = function (response) {
					alert(response.message);
				}
				ngCtrl.uploadProgressCallback = function (response) {
					$timeout(function () {
						ngCtrl.progress[ngCtrl.uploadedFileName] = parseInt(100.0 * response.loaded / response.total);
					}, 1);
				}
				webvellaCoreService.uploadFileToTemp(file, item.meta.name, ngCtrl.uploadProgressCallback, ngCtrl.uploadSuccessCallback, ngCtrl.uploadErrorCallback);
			}
		};

		ngCtrl.cacheBreakers = {};
		ngCtrl.updateFileUpload = function (file, item) {
			if (file != null) {
				ngCtrl.uploadedFileName = item.dataName;
				var oldFileName = ngCtrl.view.data[ngCtrl.uploadedFileName];
				ngCtrl.moveSuccessCallback = function (response) {
					$timeout(function () {
						ngCtrl.view.data[ngCtrl.uploadedFileName] = response.object.url;
						ngCtrl.fieldUpdate(item, response.object.url, ngCtrl.view.data["id"]);
						ngCtrl.cacheBreakers[item.dataName] = "?v=" + moment().toISOString();
					}, 1);
				}

				ngCtrl.uploadSuccessCallback = function (response) {
					var tempPath = response.object.url;
					var fileName = response.object.filename;
					var targetPath = file.name;
					var overwrite = true;
					webvellaCoreService.moveFileFromTempToFS(tempPath, targetPath, overwrite, ngCtrl.moveSuccessCallback, ngCtrl.uploadErrorCallback);
				}
				ngCtrl.uploadErrorCallback = function (response) {
					alert(response.message);
				}
				ngCtrl.uploadProgressCallback = function (response) {
					$timeout(function () {
						ngCtrl.progress[ngCtrl.uploadedFileName] = parseInt(100.0 * response.loaded / response.total);
					}, 1);
				}
				webvellaCoreService.uploadFileToTemp(file, item.meta.name, ngCtrl.uploadProgressCallback, ngCtrl.uploadSuccessCallback, ngCtrl.uploadErrorCallback);
			}
		};

		ngCtrl.deleteFileUpload = function (item) {
			var fieldName = item.dataName;
			var filePath = ngCtrl.view.data[fieldName];

			function deleteSuccessCallback(response) {
				$timeout(function () {
					ngCtrl.view.data[fieldName] = null;
					ngCtrl.progress[fieldName] = 0;
					ngCtrl.fieldUpdate(item, null, ngCtrl.view.data["id"]);
				}, 0);
				return true;
			}

			function deleteFailedCallback(response) {
				ngToast.create({
					className: 'error',
					content: '<span class="go-red">Error:</span> ' + response.message,
					timeout: 7000
				});
				return "validation error";
			}

			webvellaCoreService.deleteFileFromFS(filePath, deleteSuccessCallback, deleteFailedCallback);

		}
		//#endregion


		// Update field
		ngCtrl.fieldUpdate = function (item, data, recordId) {
			//alert("need to pass the recordId too so we can manage and viewFromRelation");
			webvellaViewActionService.fieldUpdate(item, data, recordId, ngCtrl);
		}

		//#region << Remove relation >>
		ngCtrl.removeRelation = function (item) {
			var relation = ngCtrl.getRelation(item.relationName);
			var presentedFieldId = item.meta.id;
			var currentEntityId = ngCtrl.entity.id;
			//Currently it is implemented only for 1:N relation type and the current entity should be target and field is required
			if (relation.relationType == 2 && relation.targetEntityId == currentEntityId) {
				var itemObject = {};
				itemObject.meta = null;
				for (var i = 0; i < ngCtrl.entity.fields.length; i++) {
					if (ngCtrl.entity.fields[i].id == relation.targetFieldId) {
						itemObject.meta = ngCtrl.entity.fields[i];
					}
				}
				if (itemObject.meta != null && !itemObject.meta.required) {
					ngCtrl.view.data[item.dataName] = [];
					ngCtrl.fieldUpdate(itemObject, null, ngCtrl.view.data["id"]);
				}
			}
		}
		//#endregion

		//#endregion

		//#region << Modals >>

		//#region << Relation field >>

		////////////////////
		// Single selection modal used in 1:1 relation and in 1:N when the currently viewed entity is a target in this relation
		ngCtrl.openManageRelationFieldModal = function (item, relationType, dataKind) {
			//relationType = 1 (one-to-one) , 2(one-to-many), 3(many-to-many)
			//dataKind - target, origin, origin-target

			//Select ONE item modal
			if (relationType == 1 || (relationType == 2 && dataKind == "target")) {
				var modalInstance = $uibModal.open({
					animation: false,
					templateUrl: 'manageRelationFieldModal.html',
					controller: 'ManageRelationFieldModalController',
					controllerAs: "popupCtrl",
					size: "lg",
					resolve: {
						ngCtrl: function () {
							return ngCtrl;
						},
						selectedItem: function () {
							return item;
						},
						selectedRelationType: function () {
							return relationType;
						},
						selectedDataKind: function () {
							return dataKind;
						},
						resolvedLookupRecords: function () {
							return resolveLookupRecords(item, relationType, dataKind);
						},
						modalMode: function () {
							return "single-selection";
						},
					}
				});
				//On modal exit
				modalInstance.result.then(function (returnObject) {

					// Initialize
					var displayedRecordId = $stateParams.recordId;
					var oldRelationRecordId = null;
					if (ngCtrl.view.data["$field$" + returnObject.relationName + "$id"]) {
						oldRelationRecordId = ngCtrl.view.data["$field$" + returnObject.relationName + "$id"][0];
					}

					function successCallback(response) {
						ngToast.create({
							className: 'success',
							content: '<span class="go-green">Success:</span> Change applied'
						});
						webvellaCoreService.GoToState($state.current.name, ngCtrl.stateParams);
					}

					function errorCallback(response) {
						var messageHtml = response.message;
						if (response.errors.length > 0) { //Validation errors
							messageHtml = "<ul>";
							for (var i = 0; i < response.errors.length; i++) {
								messageHtml += "<li>" + response.errors[i].message + "</li>";
							}
							messageHtml += "</ul>";
						}
						ngToast.create({
							className: 'error',
							content: '<span class="go-red">Error:</span> ' + messageHtml,
							timeout: 7000
						});
					}

					// ** Post relation change between the two records
					var recordsToBeAttached = [];
					var recordsToBeDetached = [];
					if (returnObject.dataKind == "origin") {
						recordsToBeAttached.push(returnObject.selectedRecordId);
						if (oldRelationRecordId != null) {
							recordsToBeDetached.push(oldRelationRecordId);
						}
						webvellaCoreService.updateRecordRelation(returnObject.relationName, displayedRecordId, recordsToBeAttached, recordsToBeDetached, successCallback, errorCallback);
					}
					else if (returnObject.dataKind == "target") {
						recordsToBeAttached.push(displayedRecordId);
						webvellaCoreService.updateRecordRelation(returnObject.relationName, returnObject.selectedRecordId, recordsToBeAttached, recordsToBeDetached, successCallback, errorCallback);
					}
					else {
						alert("the <<origin-target>> dataKind is still not implemented. Contact the system administrator");
					}
				});
			}
				//Select MULTIPLE item modal
			else if ((relationType == 2 && dataKind == "origin") || (relationType == 3 && dataKind == "origin")) {
				var modalInstance = $uibModal.open({
					animation: false,
					templateUrl: 'manageRelationFieldModal.html',
					controller: 'ManageRelationFieldModalController',
					controllerAs: "popupCtrl",
					size: "lg",
					resolve: {
						ngCtrl: function () {
							return ngCtrl;
						},
						selectedItem: function () {
							return item;
						},
						selectedRelationType: function () {
							return relationType;
						},
						selectedDataKind: function () {
							return dataKind;
						},
						resolvedLookupRecords: function () {
							return resolveLookupRecords(item, relationType, dataKind);
						},
						modalMode: function () {
							return "multi-selection";
						},
					}
				});
				//On modal exit
				modalInstance.result.then(function (returnObject) {

					// Initialize
					var displayedRecordId = $stateParams.recordId;

					function successCallback(response) {
						ngToast.create({
							className: 'success',
							content: '<span class="go-green">Success:</span> Change applied'
						});
						webvellaCoreService.GoToState($state.current.name, ngCtrl.stateParams);
					}

					function errorCallback(response) {
						var messageHtml = response.message;
						if (response.errors.length > 0) { //Validation errors
							messageHtml = "<ul>";
							for (var i = 0; i < response.errors.length; i++) {
								messageHtml += "<li>" + response.errors[i].message + "</li>";
							}
							messageHtml += "</ul>";
						}
						ngToast.create({
							className: 'error',
							content: '<span class="go-red">Error:</span> ' + messageHtml,
							timeout: 7000
						});
					}

					// There are currently cases just for origin, error on else
					if (returnObject.dataKind == "origin") {
						webvellaCoreService.updateRecordRelation(returnObject.relationName, displayedRecordId, returnObject.attachDelta, returnObject.detachDelta, successCallback, errorCallback);
					}
					else {
						alert("the <<origin-target>> dataKind is still not implemented. Contact the system administrator");
					}
				});
			}
			else if ((relationType == 3 && dataKind == "target")) {
				var modalInstance = $uibModal.open({
					animation: false,
					templateUrl: 'manageRelationFieldModal.html',
					controller: 'ManageRelationFieldModalController',
					controllerAs: "popupCtrl",
					size: "lg",
					resolve: {
						ngCtrl: function () {
							return ngCtrl;
						},
						selectedItem: function () {
							return item;
						},
						selectedRelationType: function () {
							return relationType;
						},
						selectedDataKind: function () {
							return dataKind;
						},
						resolvedLookupRecords: function () {
							return resolveLookupRecords(item, relationType, dataKind);
						},
						modalMode: function () {
							return "single-trigger-selection";
						},
					}
				});

			}
		}
		ngCtrl.modalSelectedItem = {};
		ngCtrl.modalRelationType = -1;
		ngCtrl.modalDataKind = "";

		//Resolve function lookup records
		var resolveLookupRecords = function (item, relationType, dataKind) {
			// Initialize
			var defer = $q.defer();
			ngCtrl.modalSelectedItem = fastCopy(item);
			ngCtrl.modalRelationType = fastCopy(relationType);
			ngCtrl.modalDataKind = fastCopy(dataKind);
			// Process
			function errorCallback(response) {
				ngToast.create({
					className: 'error',
					content: '<span class="go-red">Error:</span> ' + response.message,
					timeout: 7000
				});
				defer.reject();
			}
			function getListRecordsSuccessCallback(response) {
				defer.resolve(response); //Submitting the whole response to manage the error states
			}

			function getEntityMetaSuccessCallback(response) {
				var entityMeta = response.object;
				var defaultLookupList = null;
				var selectedLookupListName = ngCtrl.modalSelectedItem.fieldLookupList;
				var selectedLookupList = null;
				//Find the default lookup field if none return null.
				for (var i = 0; i < entityMeta.recordLists.length; i++) {
					//Check if the selected lookupList Exists
					if (entityMeta.recordLists[i].name == selectedLookupListName) {
						selectedLookupList = entityMeta.recordLists[i];
					}
					if (entityMeta.recordLists[i].default && entityMeta.recordLists[i].type == "lookup") {
						defaultLookupList = entityMeta.recordLists[i];
					}
				}

				if (selectedLookupList == null && defaultLookupList == null) {
					response.message = "This entity does not have selected or default lookup list";
					response.success = false;
					errorCallback(response);
				}
				else {

					//var gg = ngCtrl.modalSelectedItem;
					//ngCtrl.modalRelationType;
					//ngCtrl.modalDataKind;
					if (selectedLookupList != null) {
						defaultLookupList = selectedLookupList;
					}

					//Current record is Origin
					if (ngCtrl.modalDataKind == "origin") {
						//Find if the target field is required
						var targetRequiredField = false;
						var modalCurrrentRelation = ngCtrl.getRelation(ngCtrl.modalSelectedItem.relationName);
						for (var m = 0; m < entityMeta.fields.length; m++) {
							if (entityMeta.fields[m].id == modalCurrrentRelation.targetFieldId) {
								targetRequiredField = entityMeta.fields[m].required;
							}
						}
						if (targetRequiredField && ngCtrl.modalRelationType == 1) {
							//Case 1 - Solves the problem when the target field is required, but we are currently looking on the origin field holding record. 
							//In this case we cannot allow this relation to be managed from this origin record as the change will leave the old target record with null for its required field
							var lockedChangeResponse = {
								success: false,
								message: "This is a relation field, that cannot be managed from this record. Try managing it from the related <<" + entityMeta.label + ">> entity record",
								object: null
							}
							getListRecordsSuccessCallback(lockedChangeResponse);
						}
						else {
							webvellaCoreService.getRecordsByListName(defaultLookupList.name, entityMeta.name, 1, null, getListRecordsSuccessCallback, errorCallback);
						}
					}
					else if (ngCtrl.modalDataKind == "target") {
						//Current records is Target
						webvellaCoreService.getRecordsByListName(defaultLookupList.name, entityMeta.name, 1, null, getListRecordsSuccessCallback, errorCallback);
					}
				}
			}

			webvellaCoreService.getEntityMeta(item.entityName, getEntityMetaSuccessCallback, errorCallback);

			return defer.promise;
		}

		//#endregion

		//#region << Tree select field >>
		ngCtrl.openSelectTreeNodesModal = function (item) {
			var treeSelectModalInstance = $uibModal.open({
				animation: false,
				templateUrl: 'selectTreeNodesModal.html',
				controller: 'SelectTreeNodesModalController',
				controllerAs: "popupCtrl",
				size: "width-100p",
				backdrop: "static",
				resolve: {
					ngCtrl: function () {
						return ngCtrl;
					},
					selectedItem: function () {
						return item;
					},
					selectedItemData: function () {
						return ngCtrl.view.data[item.dataName];
					},
					resolvedTree: resolveTree(item),
					resolvedTreeRelation: resolveTreeRelation(item),
					resolvedCurrentUserPermissions: function () {
						return resolvedCurrentUserEntityPermissions;
					}
				}
			});
			//On modal exit
			treeSelectModalInstance.result.then(function () {
				$state.reload();
			});
		}

		//Resolve function tree
		var resolveTree = function (item) {
			// Initialize
			var defer = $q.defer();

			// Process
			function errorCallback(response) {
				ngToast.create({
					className: 'error',
					content: '<span class="go-red">Error:</span> ' + response.message,
					timeout: 7000
				});
				defer.reject();
			}
			function successCallback(response) {
				defer.resolve(response.object);
			}

			webvellaCoreService.getRecordsByTreeName(item.treeName, item.entityName, successCallback, errorCallback);

			return defer.promise;
		}

		var resolveTreeRelation = function (item) {
			// Initialize
			var response = null;

			for (var i = 0; i < ngCtrl.entityRelations.length; i++) {
				if (ngCtrl.entityRelations[i].id == item.relationId) {
					response = ngCtrl.entityRelations[i];
					break;
				}
			}

			return response;

		}
		//#endregion

		//#endregion

		//#region << List actions and webvellaViewActionService bind >>
		ngCtrl.actionService = webvellaViewActionService;
		ngCtrl.pageTitleActions = [];
		ngCtrl.pageTitleDropdownActions = [];
		ngCtrl.createBottomActions = [];
		ngCtrl.pageBottomActions = [];
		ngCtrl.view.meta.actionItems.sort(sort_by('menu', { name: 'weight', primer: parseInt, reverse: false }));
		ngCtrl.view.meta.actionItems.forEach(function (actionItem) {
			switch (actionItem.menu) {
				case "page-title":
					ngCtrl.pageTitleActions.push(actionItem);
					break;
				case "page-title-dropdown":
					ngCtrl.pageTitleDropdownActions.push(actionItem);
					break;
				case "create-bottom":
					ngCtrl.createBottomActions.push(actionItem);
					break;
				case "page-bottom":
					ngCtrl.pageBottomActions.push(actionItem);
					break;
			}
		});
		//#endregion

		//#region << Run  webvellaViewActionService.postload >>
		if (webvellaViewActionService.postload === undefined || typeof (webvellaViewActionService.postload) != "function") {
			$log.warn("No webvellaViewActionService.postload function. Skipping");
		}
		else {
			var actionsOnLoadResult = webvellaViewActionService.postload(ngCtrl, $rootScope, $state);
			if (actionsOnLoadResult != true) {
				ngCtrl.validation.hasError = true;
				ngCtrl.validation.errorMessage = $sce.trustAsHtml(actionsOnLoadResult);
			}
		}
		//#endregion

	}

	//#region < Modal Controllers >

	//#region << Manage relation Modal >>
	//Test to unify all modals - Single select, multiple select, click to select
	ManageRelationFieldModalController.$inject = ['ngCtrl', '$uibModalInstance', '$log', '$q', '$stateParams', 'modalMode', 'resolvedLookupRecords',
        'selectedDataKind', 'selectedItem', 'selectedRelationType', 'webvellaCoreService', 'ngToast', '$timeout', '$state'];

	function ManageRelationFieldModalController(ngCtrl, $uibModalInstance, $log, $q, $stateParams, modalMode, resolvedLookupRecords,
        selectedDataKind, selectedItem, selectedRelationType, webvellaCoreService, ngToast, $timeout, $state) {

		var popupCtrl = this;
		popupCtrl.currentPage = 1;
		popupCtrl.parentData = fastCopy(ngCtrl);
		popupCtrl.selectedItem = fastCopy(selectedItem);
		popupCtrl.modalMode = fastCopy(modalMode);
		popupCtrl.hasWarning = false;
		popupCtrl.warningMessage = "";

		//Init
		popupCtrl.currentlyAttachedIds = fastCopy(popupCtrl.parentData.view.data["$field$" + popupCtrl.selectedItem.relationName + "$id"]); // temporary object in order to highlight
		popupCtrl.dbAttachedIds = fastCopy(popupCtrl.currentlyAttachedIds);
		popupCtrl.getRelationLabel = ngCtrl.getRelationLabel;
		popupCtrl.attachedRecordIdsDelta = [];
		popupCtrl.detachedRecordIdsDelta = [];


		//Get the default lookup list for the entity
		if (resolvedLookupRecords.success) {
			popupCtrl.relationLookupList = fastCopy(resolvedLookupRecords.object);
		}
		else {
			popupCtrl.hasWarning = true;
			popupCtrl.warningMessage = resolvedLookupRecords.message;
		}

		//#region << Search >>
		popupCtrl.checkForSearchEnter = function (e) {
			var code = (e.keyCode ? e.keyCode : e.which);
			if (code == 13) { //Enter keycode
				popupCtrl.submitSearchQuery();
			}
		}
		popupCtrl.submitSearchQuery = function () {
			function successCallback(response) {
				popupCtrl.relationLookupList = fastCopy(response.object);
			}
			function errorCallback(response) { }

			if (popupCtrl.searchQuery) {
				popupCtrl.searchQuery = popupCtrl.searchQuery.trim();
			}
			webvellaCoreService.getRecordsByListName(popupCtrl.relationLookupList.meta.name, popupCtrl.selectedItem.entityName, 1, null, successCallback, errorCallback);
		}
		//#endregion

		//#region << Paging >>
		popupCtrl.selectPage = function (page) {
			// Process
			function successCallback(response) {
				popupCtrl.relationLookupList = fastCopy(response.object);
				popupCtrl.currentPage = page;
			}

			function errorCallback(response) {

			}

			webvellaCoreService.getRecordsByListName(popupCtrl.relationLookupList.meta.name, popupCtrl.selectedItem.entityName, page, null, successCallback, errorCallback);
		}

		//#endregion

		//#region << Logic >>

		//Render field values
		popupCtrl.renderFieldValue = webvellaCoreService.renderFieldValue;

		popupCtrl.isSelectedRecord = function (recordId) {
			if (popupCtrl.currentlyAttachedIds) {
				return popupCtrl.currentlyAttachedIds.indexOf(recordId) > -1
			}
			else {
				return false;
			}
		}

		//Single record before save
		popupCtrl.selectSingleRecord = function (record) {
			var returnObject = {
				relationName: popupCtrl.selectedItem.relationName,
				dataKind: selectedDataKind,
				selectedRecordId: record.id
			};
			$uibModalInstance.close(returnObject);
		};

		// Multiple records before save
		popupCtrl.attachRecord = function (record) {
			//Add record to delta  if it is NOT part of the original list
			if (popupCtrl.dbAttachedIds.indexOf(record.id) == -1) {
				popupCtrl.attachedRecordIdsDelta.push(record.id);
			}

			//Check and remove from the detachDelta if it is there
			var elementIndex = popupCtrl.detachedRecordIdsDelta.indexOf(record.id);
			if (elementIndex > -1) {
				popupCtrl.detachedRecordIdsDelta.splice(elementIndex, 1);
			}
			//Update the currentlyAttachedIds for highlight
			elementIndex = popupCtrl.currentlyAttachedIds.indexOf(record.id);
			if (elementIndex == -1) {
				//this is the normal case
				popupCtrl.currentlyAttachedIds.push(record.id);
			}
			else {
				//if it is already in the highligted list there is probably some miscalculation from previous operation, but for now we will do nothing
			}

		}
		popupCtrl.detachRecord = function (record) {
			//Add record to detachDelta if it is part of the original list
			if (popupCtrl.dbAttachedIds.indexOf(record.id) > -1) {
				popupCtrl.detachedRecordIdsDelta.push(record.id);
			}
			//Check and remove from attachDelta if it is there
			var elementIndex = popupCtrl.attachedRecordIdsDelta.indexOf(record.id);
			if (elementIndex > -1) {
				popupCtrl.attachedRecordIdsDelta.splice(elementIndex, 1);
			}
			//Update the currentlyAttachedIds for highlight
			elementIndex = popupCtrl.currentlyAttachedIds.indexOf(record.id);
			if (elementIndex > -1) {
				//this is the normal case
				popupCtrl.currentlyAttachedIds.splice(elementIndex, 1);
			}
			else {
				//if it is already not in the highligted list there is probably some miscalculation from previous operation, but for now we will do nothing
			}
		}
		popupCtrl.saveRelationChanges = function () {
			var returnObject = {
				relationName: popupCtrl.selectedItem.relationName,
				dataKind: selectedDataKind,
				attachDelta: popupCtrl.attachedRecordIdsDelta,
				detachDelta: popupCtrl.detachedRecordIdsDelta
			};
			$uibModalInstance.close(returnObject);
			//category_id
		};

		//Instant save on selection, keep popup open
		popupCtrl.processingRecordId = "";
		popupCtrl.processOperation = "";
		popupCtrl.processInstantSelection = function (returnObject) {

			// Initialize
			popupCtrl.processingRecordId = returnObject.selectedRecordId;
			popupCtrl.processOperation = returnObject.operation;
			var displayedRecordId = $stateParams.recordId;
			var recordsToBeAttached = [];
			var recordsToBeDetached = [];
			if (returnObject.operation == "attach") {
				recordsToBeAttached.push(displayedRecordId);
			}
			else if (returnObject.operation == "detach") {
				recordsToBeDetached.push(displayedRecordId);
			}

			function successCallback(response) {
				var currentRecordId = fastCopy(popupCtrl.processingRecordId);
				var elementIndex = popupCtrl.currentlyAttachedIds.indexOf(currentRecordId);
				if (popupCtrl.processOperation == "attach" && elementIndex == -1) {
					popupCtrl.currentlyAttachedIds.push(currentRecordId);
					popupCtrl.processingRecordId = "";
				}
				else if (popupCtrl.processOperation == "detach" && elementIndex > -1) {
					popupCtrl.currentlyAttachedIds.splice(elementIndex, 1);
					popupCtrl.processingRecordId = "";
				}
				webvellaCoreService.GoToState($state.current.name, popupCtrl.parentData.stateParams);
				ngToast.create({
					className: 'success',
					content: '<span class="go-green">Success:</span> Change applied'
				});
			}

			function errorCallback(response) {
				popupCtrl.processingRecordId = "";
				var messageHtml = response.message;
				if (response.errors.length > 0) { //Validation errors
					messageHtml = "<ul>";
					for (var i = 0; i < response.errors.length; i++) {
						messageHtml += "<li>" + response.errors[i].message + "</li>";
					}
					messageHtml += "</ul>";
				}
				ngToast.create({
					className: 'error',
					content: '<span class="go-red">Error:</span> ' + messageHtml,
					timeout: 7000
				});

			}

			// ** Post relation change between the two records
			if (returnObject.dataKind == "target") {
				webvellaCoreService.updateRecordRelation(returnObject.relationName, returnObject.selectedRecordId, recordsToBeAttached, recordsToBeDetached, successCallback, errorCallback);
			}
			else {
				alert("the <<origin-target>> dataKind is still not implemented. Contact the system administrator");
			}
		}
		popupCtrl.instantAttachRecord = function (record) {
			var returnObject = {
				relationName: popupCtrl.selectedItem.relationName,
				dataKind: selectedDataKind,
				selectedRecordId: record.id,
				operation: "attach"
			};
			if (!popupCtrl.processingRecordId) {
				popupCtrl.processInstantSelection(returnObject);
			}
		};
		popupCtrl.instantDetachRecord = function (record) {
			var returnObject = {
				relationName: popupCtrl.selectedItem.relationName,
				dataKind: selectedDataKind,
				selectedRecordId: record.id,
				operation: "detach"

			};
			if (!popupCtrl.processingRecordId) {
				popupCtrl.processInstantSelection(returnObject);
			}
		};

		//#endregion


		popupCtrl.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};

		/// Aux
		//function successCallback(response) {
		//	ngToast.create({
		//		className: 'success',
		//		content: '<span class="go-green">Success:</span> ' + response.message
		//	});
		//	$uibModalInstance.close('success');
		//	popupCtrl.parentData.modalInstance.close('success');
		//	//webvellaCoreService.GoToState($state.current.name, {});
		//}

		//function errorCallback(response) {
		//	popupCtrl.hasError = true;
		//	popupCtrl.errorMessage = response.message;


		//}


		//#endregion
	};
	//#endregion 

	//#region << Select Tree >>
	SelectTreeNodesModalController.$inject = ['ngCtrl', '$uibModalInstance', '$rootScope', '$scope', '$log', '$q', '$stateParams', 'resolvedTree',
        'selectedItem', 'resolvedTreeRelation', 'selectedItemData', 'webvellaCoreService', 'ngToast', '$timeout', '$state', '$uibModal',
		'resolvedCurrentUserPermissions'];
	function SelectTreeNodesModalController(ngCtrl, $uibModalInstance, $rootScope, $scope, $log, $q, $stateParams, resolvedTree,
			selectedItem, resolvedTreeRelation, selectedItemData, webvellaCoreService, ngToast, $timeout, $state, $uibModal,
			resolvedCurrentUserPermissions) {
		var popupCtrl = this;

		//#region << Init >>
		popupCtrl.relation = fastCopy(resolvedTreeRelation);
		popupCtrl.currentEntity = fastCopy(ngCtrl.entity);
		popupCtrl.currentField = {};
		for (var i = 0; i < popupCtrl.currentEntity.fields.length; i++) {
			if (popupCtrl.currentEntity.fields[i].selectedTreeId == selectedItem.treeId) {
				popupCtrl.currentField = popupCtrl.currentEntity.fields[i];
			}
		}
		popupCtrl.tree = fastCopy(resolvedTree);
		popupCtrl.itemMeta = fastCopy(selectedItem);
		popupCtrl.addButtonLoadingClass = {};
		popupCtrl.attachHoverEffectClass = {};

		popupCtrl.userPermissionsForTreeEntity = {};
		for (var i = 0; i < resolvedCurrentUserPermissions.length; i++) {
			if (resolvedCurrentUserPermissions[i].entityId == selectedItem.entityId) {
				popupCtrl.userPermissionsForTreeEntity = fastCopy(resolvedCurrentUserPermissions[i]);
			}
		}

		//#region << Select the already selected nodes >>
		popupCtrl.selectedTreeRecords = [];
		for (var i = 0; i < selectedItemData.length; i++) {
			popupCtrl.selectedTreeRecords.push(selectedItemData[i].id);
		}


		//#region


		//#endregion 

		popupCtrl.close = function () {
			$uibModalInstance.close();
		};


		//#region << Read only tree >>

		//#region << Node collapse >>
		popupCtrl.collapsedTreeNodes = [];
		popupCtrl.toggleNodeCollapse = function (node) {
			var nodeIndex = popupCtrl.collapsedTreeNodes.indexOf(node.id);
			if (nodeIndex > -1) {
				popupCtrl.collapsedTreeNodes.splice(nodeIndex, 1);
			}
			else {
				popupCtrl.collapsedTreeNodes.push(node.id);
			}
		}

		popupCtrl.nodesToBeCollapsed = [];

		function iterateCollapse(current, depth) {
			var children = current.nodes;
			if (children.length > 0) {
				popupCtrl.collapsedTreeNodes.push(current.id);
			}
			for (var i = 0, len = children.length; i < len; i++) {
				iterateCollapse(children[i], depth + 1);
			}
		}

		popupCtrl.collapseAll = function () {
			popupCtrl.collapsedTreeNodes = [];
			for (var i = 0; i < popupCtrl.tree.data.length; i++) {
				iterateCollapse(popupCtrl.tree.data[i], 0);
			}
		}
		//Initially collapse all
		$timeout(function () {
			popupCtrl.collapseAll();
		}, 0);

		popupCtrl.expandAll = function () {
			popupCtrl.collapsedTreeNodes = [];
		}

		//#endregion

		//#region << Node selection >>

		popupCtrl.selectableNodeIds = [];

		var selectedNodesByBranch = {};

		function iterateCanBeSelected(current, depth, rootNode, isInitial) {
			var children = current.nodes;
			var shouldBeSelectable = true;
			//isInitial is added in order to auto collapse nodes that are more than 3 children
			if (isInitial && children.length > 3) {
				popupCtrl.collapsedTreeNodes.push(current.id);
			}
			//Case: selection type
			switch (popupCtrl.currentField.selectionType) {
				case "single-select":
					if (popupCtrl.selectedTreeRecords && popupCtrl.selectedTreeRecords.length > 0 && popupCtrl.selectedTreeRecords[0] != current.recordId) {
						shouldBeSelectable = false;
					}
					break;
				case "multi-select":
					break;
				case "single-branch-select":
					if (selectedNodesByBranch[rootNode.id] && selectedNodesByBranch[rootNode.id].length > 0 && selectedNodesByBranch[rootNode.id][0] != current.id) {
						shouldBeSelectable = false;
					}
					break;
			}

			switch (popupCtrl.currentField.selectionTarget) {
				case "all":
					break;
				case "leaves":
					//Check if the node is not selected
					var leaveCheckIndex = popupCtrl.selectedTreeRecords.indexOf(current.recordId);
					if (children.length > 0 && leaveCheckIndex == -1) {
						shouldBeSelectable = false;
					}
					break;
			}

			if (shouldBeSelectable) {
				popupCtrl.selectableNodeIds.push(current.id);
			}

			for (var i = 0, len = children.length; i < len; i++) {
				iterateCanBeSelected(children[i], depth + 1, rootNode, isInitial);
			}
		}

		popupCtrl.regenerateCanBeSelected = function (isInitial) {
			//isInitial is added in order to auto collapse nodes that are more than 3 children
			popupCtrl.selectableNodeIds = [];
			for (var i = 0; i < popupCtrl.tree.data.length; i++) {
				iterateCanBeSelected(popupCtrl.tree.data[i], 0, popupCtrl.tree.data[i], isInitial);
			}
		}

		popupCtrl.toggleNodeSelection = function (node) {
			var nodeIndex = popupCtrl.selectedTreeRecords.indexOf(node.recordId);
			var recordsToBeAttached = [];
			var recordsToBeDetached = [];
			function createRelationChangeSuccessCallback(response) {
				popupCtrl.selectedTreeRecords.push(node.recordId);
				//Add to the branch selected object
				var nodeRootBranchId = node.nodes[0];
				if (selectedNodesByBranch[nodeRootBranchId]) {
					selectedNodesByBranch[node.nodes[0]].push(node.id);
				}
				else {
					selectedNodesByBranch[node.nodes[0]] = [];
					selectedNodesByBranch[node.nodes[0]].push(node.id);
				}
				popupCtrl.regenerateCanBeSelected(false);
			}
			function removeRelationChangeSuccessCallback(response) {
				popupCtrl.selectedTreeRecords.splice(nodeIndex, 1);
				var nodeRootBranchId = node.nodes[0];

				if (selectedNodesByBranch[nodeRootBranchId]) {
					var selectedIndex = selectedNodesByBranch[nodeRootBranchId].indexOf(node.id)
					selectedNodesByBranch[node.nodes[0]].splice(selectedIndex, 1);
				}
				popupCtrl.regenerateCanBeSelected(false);
			}
			function applyRelationChangeErrorCallback(response) { }
			//Node should be unselected. Relations should be severed
			if (nodeIndex > -1) {
				recordsToBeDetached.push($stateParams.recordId);
				webvellaCoreService.updateRecordRelation(popupCtrl.relation.name, node.recordId, recordsToBeAttached, recordsToBeDetached, removeRelationChangeSuccessCallback, applyRelationChangeErrorCallback);
			}
				//Node should be selected. Relations should be created
			else {
				recordsToBeAttached.push($stateParams.recordId);
				webvellaCoreService.updateRecordRelation(popupCtrl.relation.name, node.recordId, recordsToBeAttached, recordsToBeDetached, createRelationChangeSuccessCallback, applyRelationChangeErrorCallback);
			}
		}

		popupCtrl.regenerateCanBeSelected(true);

		//#endregion

		//#region << Register toggle node events >>

		//This event is later used by the recursive directive that follows
		////READY hook listeners
		var toggleTreeNodeSelectedDestructor = $rootScope.$on("webvellaAdmin-toggleTreeNode-selected", function (event, data) {
			popupCtrl.toggleNodeSelection(data);
		})

		var toggleTreeNodeCollapsedDestructor = $rootScope.$on("webvellaAdmin-toggleTreeNode-collapsed", function (event, data) {
			popupCtrl.toggleNodeCollapse(data);
		})

		////DESCTRUCTOR - hook listeners remove on scope destroy. This avoids duplication, as rootScope is never destroyed and new controller load will duplicate the listener
		$scope.$on("$destroy", function () {
			toggleTreeNodeSelectedDestructor();
			toggleTreeNodeCollapsedDestructor();
		});



		//#endregion

		//#endregion 


	};
	//#endregion

	//#endregion


})();


