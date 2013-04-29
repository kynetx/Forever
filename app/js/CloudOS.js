;(function(){

	// ------------------------------------------------------------------------
	// Personal Cloud Hostname
	var CloudOS_Host = "kibdev.kobj.net";
		window.CloudOS_Host = CloudOS_Host;

	var CloudOS_App_Key = "67591932-AD30-11E2-AF99-7B86E71C24E1";
		window.CloudOS_App_Key = CloudOS_App_Key;

	var CloudOS_Callback_URL = "http://devcloud.krlcode.com/";
		window.CloudOS_Callback_URL = CloudOS_Callback_URL;

	var CloudOS_Session_Token = "none";
		window.CloudOS_Session_Token = CloudOS_Session_Token;

	// ------------------------------------------------------------------------
	// Raise Sky Event
	function CloudOS_Raise_Event(eventDomain, eventType, eventAttributes, eventParameters, postFunction) {
		var eid = Math.floor(Math.random()*9999999);
		var esl = 'https://' + window.CloudOS_Host + '/sky/event/' +
			CloudOS_Session_Token + '/' +  eid + '/' +
			eventDomain + '/' + eventType +
			'?' + eventParameters;

		console.debug('CloudOS_Session_Token: ', window.CloudOS_Session_Token);
		$.post(esl, eventAttributes, function(json) {postFunction(json)}, "json")
	}
	window.CloudOS_Raise_Event = CloudOS_Raise_Event;

	// ------------------------------------------------------------------------
	// Call Sky Cloud

	function CloudOS_Sky_Cloud (Module, FuncName, getSuccess) {
		var esl = 'https://' + window.CloudOS_Host + '/sky/cloud/' +
					Module + '/' + FuncName;

		$.ajax({
				type: 'GET',
				url: esl,
				async: false,
				dataType: 'json',
				headers: {'Kobj-Session' : CloudOS_Session_Token},
				success: function(json) { getSuccess(json) },
				error: function(e) {
						$('#modalSpinner').hide();
						console.log(e.message);
				}
		})
	}
	window.CloudOS_Sky_Cloud = CloudOS_Sky_Cloud;

	// ------------------------------------------------------------------------
	function CloudOS_Create_Channel(postFunction) {
		CloudOS_Raise_Event('cloudos', 'api_Create_Channel', { }, "",
			function(json) { postFunction(json) }
		);
	}
	window.CloudOS_Create_Channel = CloudOS_Create_Channel;

	// ------------------------------------------------------------------------
	function CloudOS_Destroy_Channel(myToken, postFunction) {
		CloudOS_Raise_Event('cloudos', 'api_Destroy_Channel',
			{ "token" : myToken }, "",
			function(json) { postFunction(json) }
		);
	}
	window.CloudOS_Destroy_Channel = CloudOS_Destroy_Channel;

	// ========================================================================
	// Profile Management

	function CloudOS_Get_MyProfile (getSuccess) {
		CloudOS_Sky_Cloud("pds", "get_all_me",
			function(json) { getSuccess(json) })
	}
	window.CloudOS_Get_MyProfile = CloudOS_Get_MyProfile;

	function CloudOS_Update_MyProfile (eventAttributes, postFunction) {
		var eventParameters = "_rids=a169x727&element=profileUpdate.post";
		CloudOS_Raise_Event('web', 'submit', eventAttributes, eventParameters,
			function(json) { postFunction(json) }
		);
	}
	window.CloudOS_Update_MyProfile = CloudOS_Update_MyProfile;

	// ========================================================================
	// OAuth functions

	// ------------------------------------------------------------------------
	function CloudOS_Get_OAuth_URL() {
		var client_state = Math.floor(Math.random()*9999999);
		var url = 'https://' + CloudOS_Host +
			'/oauth/authorize?response_type=code' +
			'&redirect_uri=' + encodeURIComponent(CloudOS_Callback_URL) +
			'&client_id=' + CloudOS_App_Key +
			'&state=' + client_state;

		return(url)
	}
	window.CloudOS_Get_OAuth_URL = CloudOS_Get_OAuth_URL;

	// ------------------------------------------------------------------------
	function CloudOS_Get_OAuth_Access_Token (code) {
		var url = 'https://' + CloudOS_Host +	'/oauth/access_token';
		var data = {
				"grant_type"   : "authorization_code",
				"redirect_uri" : CloudOS_Callback_URL,
				"client_id"    : CloudOS_App_Key,
				"code"         : code
		};

		$.post(url,data,
			function(json) {
				console.dir(json);
				CloudOS_Save_Session(json.OAUTH_ECI);
				$('li.nav-auth').show();
				$('li.nav-anon').hide();
			}, "json")
	}
	window.CloudOS_Get_OAuth_Access_Token = CloudOS_Get_OAuth_Access_Token;

	// ========================================================================
	// Session Management

	// ------------------------------------------------------------------------
	function CloudOS_Retrieve_Session () {
		var SessionCookie = kookie_retrieve();

		if (SessionCookie != "undefined") {
			CloudOS_Session_Token = SessionCookie;
			console.debug('CloudOS_Session_Token: ', CloudOS_Session_Token);
		} else {
			CloudOS_Session_Token = "none";
		}
	}
	window.CloudOS_Retrieve_Session = CloudOS_Retrieve_Session;

	// ------------------------------------------------------------------------
	function CloudOS_Save_Session (Session_ECI) {
		CloudOS_Session_Token = Session_ECI;
		kookie_create(Session_ECI);
	}
	window.CloudOS_Save_Session = CloudOS_Save_Session;

	// ------------------------------------------------------------------------
	function CloudOS_Remove_Session () {
		CloudOS_Session_Token = "none";
		kookie_delete();
	}
	window.CloudOS_Remove_Session = CloudOS_Remove_Session;

	// ------------------------------------------------------------------------
	function CloudOS_Authenticated_Session () {
		return(CloudOS_Session_Token != "none")
	}
	window.CloudOS_Authenticated_Session = CloudOS_Authenticated_Session;

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
