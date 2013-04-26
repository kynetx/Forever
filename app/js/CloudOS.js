;(function(){

	// ------------------------------------------------------------------------
	// Personal Cloud Hostname
	var CloudOS_Host = "kibdev.kobj.net";
		window.CloudOS_Host = CloudOS_Host;
	var CloudOS_Session_Token = "none";
		window.CloudOS_Session_Token = CloudOS_Session_Token;

	// ------------------------------------------------------------------------
	// Raise Sky Event
	function CloudOS_Raise_Event(eventDomain, eventType, eventAttributes, postFunction) {
		var eid = Math.floor(Math.random()*9999999);
		var esl = 'https://' + window.CloudOS_Host + '/sky/event/' +
			window.CloudOS_Session_Token + '/' +  eid + '/' +
			eventDomain + '/' + eventType;

		console.debug('CloudOS_Session_Token: ', window.CloudOS_Session_Token);
		$.post(esl, eventAttributes, function(json) {postFunction(json)}, "json")
	}
	window.CloudOS_Raise_Event = CloudOS_Raise_Event;

	// ------------------------------------------------------------------------
	function CloudOS_Create_Channel(postFunction) {
		CloudOS_Raise_Event('cloudos', 'api_Create_Channel', { },
			function(json) { postFunction(json) }
		);
	}
	window.CloudOS_Create_Channel = CloudOS_Create_Channel;

	// ------------------------------------------------------------------------
	function CloudOS_Destroy_Channel(myToken, postFunction) {
		CloudOS_Raise_Event('cloudos', 'api_Destroy_Channel',
			{ "token" : myToken },
			function(json) { postFunction(json) }
		);
	}
	window.CloudOS_Destroy_Channel = CloudOS_Destroy_Channel;

})();
