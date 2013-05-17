;(function(){
  window.CloudOS = {};

	// ------------------------------------------------------------------------
	// Personal Cloud Hostname
	CloudOS.host = "cs.kobj.net";

	CloudOS.appKey = "E3D243D4-B28B-11E2-A01C-1615FE2E5C38";

	CloudOS.callbackURL = "http://forevr.us/";

	CloudOS.sessionToken = "none";

	// ------------------------------------------------------------------------
	// Raise Sky Event
	CloudOS.raiseEvent = function(eventDomain, eventType, eventAttributes, eventParameters, postFunction) {
		var eid = Math.floor(Math.random()*9999999);
		var esl = 'https://' + CloudOS.host + '/sky/event/' +
			CloudOS.sessionToken + '/' +  eid + '/' +
			eventDomain + '/' + eventType +
			'?_rids=a169x727&' + eventParameters;

		$.ajax({
				type: 'POST',
				url: esl,
				data: eventAttributes,
				dataType: 'json',
				headers: {'Kobj-Session' : CloudOS.sessionToken},
				success: postFunction,
		})
	};

	// ------------------------------------------------------------------------
	// Call Sky Cloud

	CloudOS.skyCloud = function(Module, FuncName, callParmaters, getSuccess) {
		var esl = 'https://' + CloudOS.host + '/sky/cloud/' +
					Module + '/' + FuncName + '?' + callParmaters;

		$.ajax({
				type: 'GET',
				url: esl,
				dataType: 'json',
				headers: {'Kobj-Session' : CloudOS.sessionToken},
				success: getSuccess,
//				error: function(e) {
//						$('#modalSpinner').hide();
//						console.log(e.message);
//				}
		})
	};

	// ------------------------------------------------------------------------
	CloudOS.createChannel = function(postFunction) {
		CloudOS.raiseEvent('cloudos', 'api_Create_Channel', { }, "", postFunction);
	};

	// ------------------------------------------------------------------------
	CloudOS.destroyChannel = function(myToken, postFunction) {
		CloudOS.raiseEvent('cloudos', 'api_Destroy_Channel',
			{ "token" : myToken }, "", postFunction);
	};

	// ========================================================================
	// Profile Management

	CloudOS.getMyProfile  = function(getSuccess) {
		CloudOS.skyCloud("pds", "get_all_me", "", getSuccess);
	};

	CloudOS.updateMyProfile  = function(eventAttributes, postFunction) {
		var eventParameters = "element=profileUpdate.post";
		CloudOS.raiseEvent('web', 'submit', eventAttributes, eventParameters, postFunction);
	};

	CloudOS.getFriendProfile  = function(friendToken, getSuccess) {
		var callParmaters = "myToken=" + friendToken;
		CloudOS.skyCloud("a169x727", "getFriendProfile", callParmaters, getSuccess);
	};

	// ========================================================================
	// PDS Management

	// ------------------------------------------------------------------------
	CloudOS.PDSAdd  = function(namespace, pdsKey, pdsValue, postFunction) {
		var eventAttributes = {
			"namespace" : namespace,
			"pdsKey"    : pdsKey,
			"pdsValue"  : JSON.stringify(pdsValue)
		};

		CloudOS.raiseEvent('cloudos', 'api_pds_add', eventAttributes, "", postFunction);
	};

	// ------------------------------------------------------------------------
	CloudOS.PDSDelete  = function(namespace, pdsKey, postFunction) {
		var eventAttributes = {
			"namespace" : namespace,
			"pdsKey"    : pdsKey
		};

		CloudOS.raiseEvent('cloudos', 'api_pds_delete', eventAttributes, "", postFunction);
	};

	// ------------------------------------------------------------------------
	CloudOS.PDSUpdate  = function() {
	};

	// ------------------------------------------------------------------------
	CloudOS.PDSList  = function(namespace, getSuccess) {
		var callParmeters = "namespace=" + namespace;
		CloudOS.skyCloud("pds", "get_items", callParmeters, getSuccess);
	};

	// ------------------------------------------------------------------------
	CloudOS.sendEmail  = function(ename, email, subject, body, postFunction) {
		var eventAttributes = {
			"ename"   : ename,
			"email"   : email,
			"subject" : subject,
			"body"    : body
		};
		CloudOS.raiseEvent('cloudos', 'api_send_email', eventAttributes, "", postFunction);
	};

  // ------------------------------------------------------------------------
  CloudOS.sendNotification = function(application, subject, body, priority, token, postFunction) {
		var eventAttributes = {
			"application" : application,
			"subject"     : subject,
			"body"        : body,
			"priority"    : priority,
			"token"       : token
		};
		CloudOS.raiseEvent('cloudos', 'api_send_notification', eventAttributes, "", postFunction);
	};

	// ========================================================================
	// Subscription Management

	// ------------------------------------------------------------------------
	CloudOS.subscribe  = function(namespace, name, relationship, token, subAttributes, postFunction) {
		var eventAttributes = {
			"namespace"     : namespace,
			"channelName"   : name,
			"relationship"  : relationship,
			"targetChannel" : token,
			"subAttrs"      : subAttributes
		};
		CloudOS.raiseEvent('cloudos', 'api_subscribe', eventAttributes, "", postFunction);
	};

	// ------------------------------------------------------------------------
	CloudOS.subscriptionList  = function(callParmeters, getSuccess) {
		CloudOS.skyCloud("cloudos", "subscriptionList", callParmeters, getSuccess);
	};

	// ========================================================================
	// OAuth functions

	// ------------------------------------------------------------------------
	CloudOS.getOAuthURL = function(fragment) {
		var client_state = Math.floor(Math.random()*9999999);
		var url = 'https://' + CloudOS.host +
			'/oauth/authorize?response_type=code' +
			'&redirect_uri=' + encodeURIComponent(CloudOS.callbackURL + fragment) +
			'&client_id=' + CloudOS.appKey +
			'&state=' + client_state;

		return(url)
	};

	// ------------------------------------------------------------------------
	CloudOS.getOAuthAccessToken  = function(code, callback) {
    if(typeof(callback) !== 'function'){
      callback = function(){};
    }
		var url = 'https://' + CloudOS.host +	'/oauth/access_token';
		var data = {
				"grant_type"   : "authorization_code",
				"redirect_uri" : CloudOS.callbackURL,
				"client_id"    : CloudOS.appKey,
				"code"         : code
		};

		$.ajax({
			type: 'POST',
				url: url,
				data: data,
				dataType: 'json',
				success: function(json) {
					CloudOS.saveSession(json.OAUTH_ECI);
          callback(json);
				},
			})
	}

	// ========================================================================
	// Session Management

	// ------------------------------------------------------------------------
	CloudOS.retrieveSession  = function() {
		var SessionCookie = kookie_retrieve();

		if (SessionCookie != "undefined") {
			CloudOS.sessionToken = SessionCookie;
		} else {
			CloudOS.sessionToken = "none";
		}
	};

	// ------------------------------------------------------------------------
	CloudOS.saveSession  = function(Session_ECI) {
		CloudOS.sessionToken = Session_ECI;
		kookie_create(Session_ECI);
	};

	// ------------------------------------------------------------------------
	CloudOS.removeSession  = function() {
		CloudOS.sessionToken = "none";
		kookie_delete();
	};

	// ------------------------------------------------------------------------
	CloudOS.authenticatedSession  = function() {
		return(CloudOS.sessionToken !== "none")
	};

	var SkyTokenName = '__SkySessionToken';
	var SkyTokenExpire = 7;

	// --------------------------------------------
	function kookie_create(SkySessionToken) {
		if (SkyTokenExpire) {
			var date = new Date();
			date.setTime(date.getTime()+(SkyTokenExpire*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		var kookie = SkyTokenName+"="+SkySessionToken+expires+"; path=/";
		document.cookie = kookie;
	}

	// --------------------------------------------
	function kookie_delete() {
		var kookie = SkyTokenName+"=foo; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/";
		document.cookie = kookie;
	}

	// --------------------------------------------
	function kookie_retrieve() {
		var TokenValue = 'undefined';
		var TokenName  = '__SkySessionToken';
		var allKookies = document.cookie.split('; ');
		for (var i=0;i<allKookies.length;i++) {
			var kookiePair = allKookies[i].split('=');
			if (kookiePair[0] == TokenName) {
				TokenValue = kookiePair[1];
			};
		}
		return TokenValue;
	}

})();
