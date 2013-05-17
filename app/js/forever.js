$(document).ready(function() {

	// --------------------------------------------
	// Build OAuth URL and update links on homepage
	var OAuth_Sqtag_URL = CloudOS.getOAuthURL("login");
	$('a.oauth-sqtag-url').attr('href', OAuth_Sqtag_URL);

	// --------------------------------------------
	// Click handler for Add Link on Homepage
	$('#navAddLink').click(function() {
		$('#modalAddLink').modal();
	});

	// add parser through the tablesorter addParser method
	$.tablesorter.addParser({
		// set a unique id
		id: 'lastname',
		is: function(s, table, cell) {
			// return false so this parser is not auto detected
			return true;
		},
		format: function(s, table, cell, cellIndex) {
			var matches = s.toLowerCase().match(/([a-z,.'-]+)$/i); // Get the last name
			if(typeof(matches) === "object" && matches != null && matches.length > 0){
				return matches[0];
			} else {
				return "zzzzzzzzzzz"; // Make the no-names last.
			}
		},
		// set type, either numeric or text
		type: 'text'
	});

	page('/', view_home);
	page('/login*', view_login);
	page('/signup*', view_signup);
	page('/about', view_about);
	page('/friends', view_friends);
	page('/finder', view_finder);
	page('/invite/:token', view_invite);
	page('/profile', view_profile);
	page('/friend/:token', view_friend);
	page('/message/:token', view_message);
	page('/logout', view_logout);
	page('*', view_notfound);
	page();

	var currentView = 'home';

	// --------------------------------------------
	// Check authentication
	CloudOS.retrieveSession();

	if (CloudOS.authenticatedSession()) {
		Navbar_Show_Auth()
		show_view('home-auth')
	} else {
		Navbar_Show_Anon()
		show_view('home');
	}

	// --------------------------------------------
	// Check query parameters
	var query = window.location.search.substring(1);
	// console.debug("QUERY: ", query);
	if (query != "") {
		if (query === "friends")
			page("/friends")
		else if (query.match(/login\&.+$/))
			page("/"+query)
		else if (query.match(/signup\&.+$/))
			page("/"+query)
		else if (query === "about")
			page("/about")
		else if (query === "finder")
			page("/finder")
		else if (query === "profile")
			page("/profile")
		else if (query.match(/friend\/.+$/))
			page("/"+query)
		else if (query.match(/message\/.+$/))
			page("/"+query)
		else if (query.match(/invite\=.+$/)) {
		  var inviteToken = getQueryVariable('invite')
			page("/invite/"+inviteToken)
		} else {
			// console.debug('Unrecognized query string: ', query);
		}
	}

	function getQueryVariable(variable) {
		var query = window.location.search.substring(1);
		var vars = query.split('&');
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split('=');
			if (decodeURIComponent(pair[0]) == variable) {
				return decodeURIComponent(pair[1]);
			}
		}
	}

	// --------------------------------------------
	function Navbar_Show_Anon() {
		$('li.nav-anon').show();
		$('li.nav-auth').hide();
	}
	function Navbar_Show_Auth() {
		$('li.nav-auth').show();
		$('li.nav-anon').hide();
		CloudOS.getMyProfile(function(json) {
			var myProfileNotes = json.myProfileNotes;
			var myProfileDescription = json.myProfileDescription;

			if (myProfileNotes === 'null') {myProfileNotes = ''}
			if (myProfileDescription === 'null') {myProfileDescription = ''}

			$('#modalSpinner').hide();
			$('#myProfileName').val(json.myProfileName);
			$('#myProfileEmail').val(json.myProfileEmail);
			$('#myProfilePhone').val(json.myProfilePhone);
			$('#myProfileDescription').text(myProfileDescription);
			$('#myProfileNotes').text(myProfileNotes);
			$('#myProfilePhoto').val(json.myProfilePhoto);
			$('#myProfilePhoto-preview').attr('src', json.myProfilePhoto);
		});
	}

	// --------------------------------------------
	// Style the profile photo uploader button

	$(":file.image").filestyle({
		textField: false,
		buttonText: "Choose image",
		icon: true
	});


	// --------------------------------------------
	// Show View
	function show_view(viewName) {
		// Show the specified view, hide all others
		$('div.view').hide();
		$('#view-'+viewName).show();
		// Set specified navigation item to active
		$('li.nav-item').removeClass('active');
		$('#nav-'+viewName).addClass('active');
	}

	// --------------------------------------------
	// Set Screen Title
	function set_screen_title(screenName) {
		$('a.brand').text('Forever ' + screenName);
	}
	// --------------------------------------------
	// View: home
	function view_home() {
		if (CloudOS.authenticatedSession()) {
			show_view('home-auth')
		} else {
			show_view('home');
		}
		//set_screen_title('');
		currentView = 'home';
	};

	// --------------------------------------------
	// View: login
	function view_login() {
		var oauthCode = getQueryVariable('code');
		// console.debug("view_login");

		CloudOS.getOAuthAccessToken(oauthCode, function(){
			if (CloudOS.authenticatedSession()) {
				Navbar_Show_Auth();
				show_view('home-auth');
				$('#modalSpinner').hide();
			} else {
				Navbar_Show_Anon();
				show_view('home');
			}
		});
	};

	// --------------------------------------------
	// View: signup
	function view_signup() {
		var oauthCode = getQueryVariable('code');
		var token = getQueryVariable('token');
		// console.debug("view_signup");
		// console.debug("code: ", oauthCode);
		// console.debug("token: ", token);

		CloudOS.getOAuthAccessToken(oauthCode, function(){
			if (CloudOS.authenticatedSession()) {
				Navbar_Show_Auth();
				acceptInvitation(token);
			} else {
				Navbar_Show_Anon()
				show_view('home');
			}
		});
	};

	// --------------------------------------------
	// View: about
	function view_about() {
		show_view('about');
		$('#modalSpinner').hide();
		currentView = 'about';
	};

	// --------------------------------------------
	// View: friends
	function view_friends() {
		$('#modalSpinner').show();
		getFriendsList();
	};

	// --------------------------------------------
	// View: friend finder
	function view_finder() {
		$('#modalSpinner').show();
		initInvitationForm();
		getForeverInvitations();
	};

	// --------------------------------------------
	// View: invitations
	function view_invite(ctx) {
		var token = ctx.params.token;
		getFriendProfile(token);
	};

	// --------------------------------------------
	// View: profile
	function view_profile() {
		$('#modalSpinner').show();

		CloudOS.getMyProfile(function(json) {
			var myProfileNotes = json.myProfileNotes;
			var myProfileDescription = json.myProfileDescription;

			if (myProfileNotes === 'null') {myProfileNotes = ''}
			if (myProfileDescription === 'null') {myProfileDescription = ''}

			$('#myProfileName').val(json.myProfileName);
			$('#myProfileEmail').val(json.myProfileEmail);
			$('#myProfilePhone').val(json.myProfilePhone);
			$('#myProfileDescription').text(myProfileDescription);
			$('#myProfileNotes').text(myProfileNotes);
			$('#myProfilePhoto').val(json.myProfilePhoto);
			$('#myProfilePhoto-preview').attr('src', json.myProfilePhoto);

			show_view('profile');
			currentView = 'profile';
			$('#modalSpinner').hide();
		});
	};

	// --------------------------------------------
	// View: friend
	function view_friend(ctx) {
		var token = ctx.params.token;
		$('#modalSpinner').show();
		showFriendProfile(token);
	};

	// --------------------------------------------
	// View: message
	function view_message(ctx) {
		var token = ctx.params.token;
		showFriendMessage(token);
	};

	// --------------------------------------------
	// View: logout
	function view_logout() {
		CloudOS.removeSession();
		Navbar_Show_Anon();
		page('/');
	};

	// --------------------------------------------
	// View: 404
	function view_notfound() {
		show_view('404');
		currentView = '404';
	};

	// ========================================================================
	// myProfile Management

	// --------------------------------------------
	function updatePhotoPreview(input) {
		//console.debug("file: ", input.files[0]);
		//console.debug("elID: ", $K(input).attr("elid"));
		//console.debug("input: ", input);

		if (input.files && input.files[0]) {
			var reader = new FileReader();
			var eleID  = $(input).attr("elid");

			reader.onload = function (e) {
				$('#' + eleID + '-preview')
					.attr('src', e.target.result);
				$('#' + eleID)
					.val(e.target.result);
			};
			reader.readAsDataURL(input.files[0]);
		}
	}
	window.updatePhotoPreview = updatePhotoPreview;

	// --------------------------------------------
	// Update myProfile

	$('form.form-profile').submit(function(event) {
		var eventAttributes = $(this).serialize();

		event.preventDefault();
		$('#modalSpinner').show();
		CloudOS.updateMyProfile(eventAttributes,
			function(json) {
				$('#modalSpinner').hide();
				$('#alert-profile-success').show('fast').delay(7000).hide('fast')
			});
	});

	// ========================================================================
	// Friend Finder

	// --------------------------------------------
	// https://s3.amazonaws.com/k-mycloud/a169x672/unknown.png

	function initInvitationForm() {
			var myName   = $('#myProfileName').val();
			var myPhoto  = $('#myProfilePhoto').val();

			// console.debug("myName: ", myName);
			// console.debug("myPhoto: ", myPhoto);

			if (myName === '' || myPhoto === 'https://s3.amazonaws.com/k-mycloud/a169x672/unknown.png') {
				$("form.form-finder span.help-block").show();
				$("form.form-finder input").prop('disabled', true);
				$("form.form-finder button").prop('disabled', true);
			} else {
				$("form.form-finder span.help-block").hide();
				$("form.form-finder input").prop('disabled', false);
				$("form.form-finder button").prop('disabled', false);
			}
	}

	// --------------------------------------------
	// GET list of Forever Invitations

	function getForeverInvitations() {
		CloudOS.PDSList("foreverInvite",
		  function(json) {
				// console.dir(json);
				$('#table-finder').html('');
				if (json) {
					jQuery.each(json, function(token, val) {
						var newRow = '<tr><td>' +
									val.name +
									'<button class="btn btn-mini btn-danger btn-finder-action btn-finder-action-revoke pull-right" data-token="'+
									val.token + '">Revoke</button>' +
									'<button class="btn btn-mini btn-primary btn-finder-action btn-finder-action-resend pull-right" data-token="'+
									val.token + '" data-name="'+val.name+'" data-email="'+val.email+'">Resend</button>' +
									'</td></tr>';
						$('#table-finder').prepend(newRow);
					});
				}
				show_view('finder');
				currentView = 'finder';
				$('#modalSpinner').hide();
			}
		);
	}

	$('form.form-finder').submit(function(event) {

		event.preventDefault();
		$('#modalSpinner').show();

		CloudOS.createChannel(
			function(json) {
				var ename = $('#inviteName').val();
				var email = $('#inviteEmail').val();
				var eventAttributes = {
						"token" : json.token,
						"name"  : ename,
						"email" : email
				};
				// console.dir(eventAttributes);
				// console.dir(json);

				CloudOS.PDSAdd("foreverInvite", json.token, eventAttributes,
				  function(json) {
						// console.dir(json);
						// Clear invitation form
						$('#inviteName').val('');
						$('#inviteEmail').val('');

						// Add new invitation to table
						var newRow = '<tr><td>' +
											 json.name +
											 '<button class="btn btn-mini btn-danger btn-finder-action btn-finder-action-revoke pull-right" data-token="'+
												 json.token + '">Revoke</button>' +
											 '<button class="btn btn-mini btn-primary btn-finder-action btn-finder-action-resend pull-right" data-token="'+
												 json.token + '" data-name="'+json.name+'" data-email="'+json.email+'">Resend</button>' +
											 '</td></tr>';
						$('#table-finder').prepend(newRow);
						$('#modalSpinner').hide();
				})

				sendForeverInvitation(ename, email, json.token)
			}
		);
	})

	// --------------------------------------------
	function sendForeverInvitation(name, email, token) {
		var subject = "Kynetx Forever Invitation";
		var myName   = $('#myProfileName').val();
		var body = myName + " has invited you to Forever, an evergreen addressbook based on Personal Clouds. Follow the link below to accept the invitation.\n\n" +
							"http://forevr.us/?invite=" + token;

		CloudOS.sendEmail(name, email, subject, body,
			function(json) {
				// console.dir(json);
				$('#alert-finder-success').show('fast').delay(7000).hide('fast')
			})
	}

	// --------------------------------------------
	// Finder Resend Invitation
	$('#table-finder').on('click','button.btn-finder-action-resend',
		function(event){
			var token = $(this).attr('data-token');
			var name = $(this).attr('data-name');
			var email = $(this).attr('data-email');
			// console.debug("resend token: ", token);

			sendForeverInvitation(name, email, token)
		}
	)

	// --------------------------------------------
	// Finder Revoke Invitation
	$('#table-finder').on('click','button.btn-finder-action-revoke',
		function(event){
			var token = $(this).attr('data-token');
			// console.debug("revoke token: ", token);

			// Remove row from GUI
			$(this).parent().parent().remove();

			CloudOS.PDSDelete("foreverInvite", token,
				  function(json) {
						console.dir(json);
					}
			);

			CloudOS.destroyChannel(token,
				  function(json) {
						console.dir(json);
					}
			);

			return false;
		}
	)

	// ========================================================================
	// Invitation Management

	function getFriendProfile(token) {
		CloudOS.getFriendProfile(token,
			function(json) {
				if (json.status) {
					var iname = json.myProfileName;
					var OAuth_URL = CloudOS.getOAuthURL("signup/"+token);

					if (CloudOS.authenticatedSession()) {
							$('#btn-invitation-accept').show();
							$('#link-invitation-accept').hide();
					} else {
							$('#link-invitation-accept').show();
							$('#btn-invitation-accept').hide();
					}

					$('#btn-invitation-accept').attr('data-token', token);
					$('#btn-invitation-accept').attr('data-name', iname);
					$('#link-invitation-accept').attr('href', OAuth_URL);
					$('#btn-invitation-accept').attr('data-photo', json.myProfilePhoto);
					$('#hostess-photo').attr('src', json.myProfilePhoto);
					$('#hostess-name').text(json.myProfileName);
					$('#hostess-email').text(json.myProfileEmail);
					$('#hostess-phone').text(json.myProfilePhone);

					if (json.myProfileName) {
						$('#hostess-name').show();
					} else {
						$('#hostess-name').hide();
					}

					if (json.myProfilePhone) {
						$('#hostess-phone').show();
					} else {
						$('#hostess-phone').hide();
					}

					if (json.myProfileEmail) {
						$('#hostess-email').show();
					} else {
						$('#hostess-email').hide();
					}

					show_view('invite');
					currentView = 'invite';
				} else {
					show_view('invite-expired');
					currentView = 'invite-expired';
				}
				$('#modalSpinner').hide();
			}
		);
	}

	// --------------------------------------------
	function acceptInvitation(token) {
		CloudOS.getFriendProfile(token, function(json) {
			$('#btn-invitation-accept').attr('data-token', token);
			$('#btn-invitation-accept').attr('data-name', json.myProfileName);
			$('#btn-invitation-accept').attr('data-photo', json.myProfilePhoto);

			CloudOS.createChannel(function(json) {
				var ourName  = $('#btn-invitation-accept').attr('data-name');
				var ourToken = $('#btn-invitation-accept').attr('data-token');
				var ourPhoto = $('#btn-invitation-accept').attr('data-photo');
				var myName   = $('#myProfileName').val();
				var myPhoto  = $('#myProfilePhoto').val();
				var myToken  = json.token;
				var attrs  = {
					"names"  : myName+":"+ourName,
					"tokens" : myToken+":"+ourToken,
					"photos" : myPhoto+";"+ourPhoto,
					"pdsKey" : ourToken
				};
				CloudOS.subscribe("Forever", "Forever Friend", "friend-friend",
					ourToken, JSON.stringify(attrs),
					function(json) {
						setTimeout(function(){page('/friends')}, 2000);
					}
				);
			});
		});

		return false;
	}

	// --------------------------------------------
	// Accept Forever Invitation
	$('#btn-invitation-accept').on('click', function(event){
		$('#modalSpinner').show();
		CloudOS.createChannel(function(json) {
			var ourName  = $('#btn-invitation-accept').attr('data-name');
			var ourToken = $('#btn-invitation-accept').attr('data-token');
			var ourPhoto = $('#btn-invitation-accept').attr('data-photo');
			var myName   = $('#myProfileName').val();
			var myPhoto  = $('#myProfilePhoto').val();
			var myToken  = json.token;

			var attrs  = {
				"names"  : myName+":"+ourName,
				"tokens" : myToken+":"+ourToken,
				"photos" : myPhoto+";"+ourPhoto,
				"pdsKey" : ourToken
			};

			CloudOS.subscribe("Forever", "Forever Friend", "friend-friend",
				ourToken, JSON.stringify(attrs),
				function(json) {
					setTimeout(function(){
						page('/friends');
					}, 3000);
				});
		});

		return false;
	});

	// ========================================================================
	// Friends Management

	function getFriendsList() {
		CloudOS.subscriptionList("namespace=Forever&relationship=friend", 
			function(json) {
			  // console.dir(json);
				$('#table-friends').html('');
				jQuery.each(json, function() {
					var subAttrs = jQuery.parseJSON(this.subAttrs);
					// console.dir(subAttrs);
					if (typeof subAttrs.tokens != "undefined") {
							var unames = subAttrs.names.split(':');
							var tokens = subAttrs.tokens.split(':');
							var fname  = unames[0];
							var dtoken = tokens[0];
							var myName   = $('#myProfileName').val();
							if (myName === unames[0]) {
									fname  = unames[1];
									dtoken = tokens[1];
							}
							var newRow = '<tr data-token="' + dtoken + '"><td>' +
									fname +
									'<i class="icon-chevron-right pull-right"></i>' +
									'</td></tr>';
							$('#table-friends').prepend(newRow);
					}
				});

				show_view('friends');
				currentView = 'friends';

				$("#view-friends table").tablesorter({
					sortList: [[0,0]], // Sort by name ascendingly
					theme: "bootstrap"
				});

				$("#view-friends table").trigger("update");

				$('#modalSpinner').hide();
			}
		);
	}

	// --------------------------------------------
	// Click on Friend Row

	$('#table-friends').on('click', 'tr',
		function(event){
			var token = $(this).attr('data-token');
			// alert(token);
			page('/friend/'+token)

			return false;
		}
	)

	// --------------------------------------------
	// Click handler for Send Message to a Friend
	$('#btn-friend-message').on('click',
		function(event){
			var token = $(this).attr('data-token');
			// console.debug("send message token: ", token);
			page('/message/'+token)

			return false;
		}
	)

	// --------------------------------------------
	function showFriendProfile(token) {
		$('#friend-photo').attr('src', 'img/default.png');
		$('#friend-name').text('');
		$('#friend-email').text('');
		$('#friend-phone').text('');

		$('#btn-friend-message').attr('data-token', '');
		$('#btn-friend-tel').attr('href', 'tel:');
		$('#btn-friend-sms').attr('href', 'sms:');
		$('#btn-friend-email').attr('href', 'mailto:');

		CloudOS.getFriendProfile(token,
			function(json) {
				// console.dir(json);
				if (json.status) {

					$('#friend-photo').attr('src', json.myProfilePhoto);
					$('#friend-name').text(json.myProfileName);
					$('#friend-email').text(json.myProfileEmail);
					$('#friend-phone').text(json.myProfilePhone);

					$('#btn-friend-message').attr('data-token', token);
					$('#btn-friend-tel').attr('href', 'tel:'+json.myProfilePhone);
					$('#btn-friend-sms').attr('href', 'sms:'+json.myProfilePhone);
					$('#btn-friend-email').attr('href', 'mailto:'+json.myProfileEmail);

					$('#btn-friend-message').show();

					if (json.myProfilePhone) {
						$('#friend-phone').show();
						$('#btn-friend-tel').show();
						$('#btn-friend-sms').show();
					} else {
						$('#friend-phone').hide();
						$('#btn-friend-tel').hide();
						$('#btn-friend-sms').hide();
					}

					if (json.myProfileEmail) {
						$('#friend-email').show();
						$('#btn-friend-email').show();
					} else {
						$('#friend-email').hide();
						$('#btn-friend-email').hide();
					}

				} else {
						$('#modalSpinner').hide();
						$('#friend-name').text('Profile Unavailable');
						$('#btn-friend-tel').hide();
						$('#btn-friend-sms').hide();
						$('#btn-friend-email').hide();
						$('#btn-friend-message').hide();
				}

				show_view('friend');
				$('#modalSpinner').hide();
				currentView = 'friend';
			}
		);
	}

	// --------------------------------------------
	function showFriendMessage(token) {
		$('#friend-name').text('');

		$('#messageToken').val('');
		$('#messageName').val('');
		$('#messageSubject').val('');
		$('#messageBody').val('');

		CloudOS.getFriendProfile(token,
			function(json) {
				// console.dir(json);
				if (json.status) {
					$('#messageToken').val(token);
					$('#messageName').val(json.myProfileName);

					show_view('message');
					currentView = 'message';
					$('#modalSpinner').hide();
				}
			}
		);
	}

	// --------------------------------------------
	// Message submit handler

	$('form.form-message').submit(function(event) {
		var token   = $('#messageToken').val();
		var subject = $('#messageSubject').val();
		var body    = $('#messageBody').val();
		var myName   = $('#myProfileName').val();
		var theSubject = myName + ": " + subject;

		//console.debug("token: ", token);
		//console.debug("subject: ", subject);
		//console.debug("body: ", body);

		event.preventDefault();
		$('#modalSpinner').show();

		CloudOS.sendNotification("Forever", theSubject, body, 2, token,
			function(json) {
				$('#modalSpinner').hide();
				$('#alert-message-success').show('fast').delay(7000).hide('fast')
		})
	})

});
