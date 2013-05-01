;(function(){
  window.CloudOS = {};

	// ------------------------------------------------------------------------
	// Personal Cloud Hostname
	CloudOS.Host = "cs.kobj.net";

	CloudOS.App_Key = "E3D243D4-B28B-11E2-A01C-1615FE2E5C38";

	CloudOS.Callback_URL = "http://forevr.us/";

	CloudOS.Session_Token = "none";

	// ------------------------------------------------------------------------
	// Raise Sky Event
	CloudOS.Raise_Event = function(eventDomain, eventType, eventAttributes, eventParameters, postFunction) {
		var eid = Math.floor(Math.random()*9999999);
		var esl = 'https://' + CloudOS.Host + '/sky/event/' +
			CloudOS.Session_Token + '/' +  eid + '/' +
			eventDomain + '/' + eventType +
			'?' + eventParameters;

		console.debug('CloudOS.Session_Token: ', CloudOS.Session_Token);
		$.post(esl, eventAttributes, postFunction, "json")
	};

	// ------------------------------------------------------------------------
	// Call Sky Cloud

	CloudOS.Sky_Cloud = function(Module, FuncName, callParmaters, getSuccess) {
		var esl = 'https://' + CloudOS.Host + '/sky/cloud/' +
					Module + '/' + FuncName + '?' + callParmaters;

		$.ajax({
				type: 'GET',
				url: esl,
				async: false,
				dataType: 'json',
				headers: {'Kobj-Session' : CloudOS.Session_Token},
				success: getSuccess,
//				error: function(e) {
//						$('#modalSpinner').hide();
//						console.log(e.message);
//				}
		})
	};

	// ------------------------------------------------------------------------
	CloudOS.Create_Channel = function(postFunction) {
		CloudOS.Raise_Event('cloudos', 'api_Create_Channel', { }, "", postFunction);
	};

	// ------------------------------------------------------------------------
	CloudOS.Destroy_Channel = function(myToken, postFunction) {
		CloudOS.Raise_Event('cloudos', 'api_Destroy_Channel',
			{ "token" : myToken }, "", postFunction);
	};

	// ========================================================================
	// Profile Management

	CloudOS.Get_MyProfile  = function(getSuccess) {
		CloudOS.Sky_Cloud("pds", "get_all_me", "", getSuccess);
	};

	CloudOS.Update_MyProfile  = function(eventAttributes, postFunction) {
		var eventParameters = "_rids=a169x727&element=profileUpdate.post";
		CloudOS.Raise_Event('web', 'submit', eventAttributes, eventParameters, postFunction);
	};

	CloudOS.Get_Friend_Profile  = function(friendToken, getSuccess) {
		var callParmaters = "myToken=" + friendToken;
		CloudOS.Sky_Cloud("a169x727", "getFriendProfile", callParmaters, getSuccess);
	};

	// ========================================================================
	// PDS Management

	// ------------------------------------------------------------------------
	CloudOS.PDS_Add  = function(namespace, pdsKey, pdsValue, postFunction) {
		var eventAttributes = {
			"namespace" : namespace,
			"pdsKey"    : pdsKey,
			"pdsValue"  : JSON.stringify(pdsValue)
		};

		CloudOS.Raise_Event('cloudos', 'api_pds_add', eventAttributes, "", postFunction);
	};

	// ------------------------------------------------------------------------
	CloudOS.PDS_Delete  = function(namespace, pdsKey, postFunction) {
		var eventAttributes = {
			"namespace" : namespace,
			"pdsKey"    : pdsKey
		};

		CloudOS.Raise_Event('cloudos', 'api_pds_delete', eventAttributes, "", postFunction);
	};

	// ------------------------------------------------------------------------
	CloudOS.PDS_Update  = function() {
	};

	// ------------------------------------------------------------------------
	CloudOS.PDS_List  = function(namespace, getSuccess) {
		var callParmeters = "namespace=" + namespace;
		CloudOS.Sky_Cloud("pds", "get_items", callParmeters, getSuccess);
	};

	// ------------------------------------------------------------------------
	CloudOS.Send_Email  = function(ename, email, subject, body, postFunction) {
		var eventAttributes = {
			"ename"   : ename,
			"email"   : email,
			"subject" : subject,
			"body"    : body
		};
		CloudOS.Raise_Event('cloudos', 'api_send_email', eventAttributes, "", postFunction);
	};

	// ========================================================================
	// Subscription Management

	// ------------------------------------------------------------------------
	CloudOS.Subscribe  = function(namespace, name, relationship, token, subAttributes, postFunction) {
		var eventAttributes = {
			"namespace"     : namespace,
			"channelName"   : name,
			"relationship"  : relationship,
			"targetChannel" : token,
			"subAttrs"      : subAttributes
		};
		CloudOS.Raise_Event('cloudos', 'api_subscribe', eventAttributes, "", postFunction);
	};

	// ------------------------------------------------------------------------
	CloudOS.Subscription_List  = function(callParmaters, getSuccess) {
		CloudOS.Sky_Cloud("cloudos", "subscriptionList", callParmaters, getSuccess);
	};

	// ========================================================================
	// OAuth functions

	// ------------------------------------------------------------------------
	CloudOS.Get_OAuth_URL = function() {
		var client_state = Math.floor(Math.random()*9999999);
		var url = 'https://' + CloudOS.Host +
			'/oauth/authorize?response_type=code' +
			'&redirect_uri=' + encodeURIComponent(CloudOS.Callback_URL) +
			'&client_id=' + CloudOS.App_Key +
			'&state=' + client_state;

		return(url)
	};

	// ------------------------------------------------------------------------
	CloudOS.Get_OAuth_Access_Token  = function(code) {
		var url = 'https://' + CloudOS.Host +	'/oauth/access_token';
		var data = {
				"grant_type"   : "authorization_code",
				"redirect_uri" : CloudOS.Callback_URL,
				"client_id"    : CloudOS.App_Key,
				"code"         : code
		};

		$.post(url,data,
			function(json) {
				console.dir(json);
				CloudOS.Save_Session(json.OAUTH_ECI);
				//$('li.nav-auth').show();
				//$('li.nav-anon').hide();
				//getMyProfile()
			}, "json")
	};

	// ========================================================================
	// Session Management

	// ------------------------------------------------------------------------
	CloudOS.Retrieve_Session  = function() {
		var SessionCookie = kookie_retrieve();

		if (SessionCookie != "undefined") {
			CloudOS.Session_Token = SessionCookie;
			console.debug('CloudOS.Session_Token: ', CloudOS.Session_Token);
		} else {
			CloudOS.Session_Token = "none";
		}
	};

	// ------------------------------------------------------------------------
	CloudOS.Save_Session  = function(Session_ECI) {
		CloudOS.Session_Token = Session_ECI;
		kookie_create(Session_ECI);
	};

	// ------------------------------------------------------------------------
	CloudOS.Remove_Session  = function() {
		CloudOS.Session_Token = "none";
		kookie_delete();
	};

	// ------------------------------------------------------------------------
	CloudOS.Authenticated_Session  = function() {
		return(CloudOS.Session_Token != "none")
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
    // console.debug('(create): ', kookie);
	}

	// --------------------------------------------
	function kookie_delete() {
    var kookie = SkyTokenName+"=foo; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/";
    document.cookie = kookie;
    // console.debug('(destroy): ', kookie);
	}

	// --------------------------------------------
	function kookie_retrieve() {
    var TokenValue = 'undefined';
		var TokenName  = '__SkySessionToken';
    var allKookies = document.cookie.split('; ');
    for (var i=0;i<allKookies.length;i++) {
      var kookiePair = allKookies[i].split('=');
			// console.debug("Kookie Name: ", kookiePair[0]);
			// console.debug("Token  Name: ", TokenName);
      if (kookiePair[0] == TokenName) {
        TokenValue = kookiePair[1];
      };
    }
    // console.debug("(retrieve) TokenValue: ", TokenValue);
		return TokenValue;
	}

})();
