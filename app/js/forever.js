$(document).ready(function() {

	// --------------------------------------------
	// Build OAuth URL and update links on homepage
	var OAuth_Sqtag_URL = CloudOS_Get_OAuth_URL();
	$('a.oauth-sqtag-url').attr('href', OAuth_Sqtag_URL);

	page('/', view_home);
	page('/friends', view_friends);
	page('/finder', view_finder);
	page('/invite/:token', view_invite);
	page('/profile', view_profile);
	page('/friend/:token', view_friend);
	page('/logout', view_logout);
	page('/test', view_test);
	page('*', view_notfound);
	page();

	var currentView = 'home';

	// --------------------------------------------
	// Check authentication
	CloudOS_Retrieve_Session();

	if (CloudOS_Authenticated_Session()) {
		Navbar_Show_Auth()
	} else {
		Navbar_Show_Anon()
	}

	// --------------------------------------------
	// Check query parameters
	var query = window.location.search.substring(1);
	console.debug("QUERY: ", query);
	if (query != "") {
		var inviteToken = getQueryVariable('invite');
		var oauthCode = getQueryVariable('code');
		if (inviteToken){
			page('/invite/' + inviteToken);
		} else if (oauthCode) {
				// getOAuthAccessToken(oauthCode);
			CloudOS_Get_OAuth_Access_Token(oauthCode);
		} else {
			console.debug('Unrecognized query string: ', query);
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
    console.log('Query variable %s not found', variable);
	}

	// --------------------------------------------
	function Navbar_Show_Anon() {
		$('li.nav-anon').show();
		$('li.nav-auth').hide();
	}
	function Navbar_Show_Auth() {
		$('li.nav-auth').show();
		$('li.nav-anon').hide();
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
		show_view('home');
		set_screen_title('');
		currentView = 'home';
	};

	// --------------------------------------------
	// View: friends
	function view_friends() {
		show_view('friends');
		set_screen_title('Friends');
		$('#modalSpinner').show();
		currentView = 'friends';
	};

	// --------------------------------------------
	// View: friend finder
	function view_finder() {
		$('#modalSpinner').show();
		getForeverInvitations();
		show_view('finder');
		set_screen_title('Finder');
		currentView = 'finder';
	};

	// --------------------------------------------
	// View: invitations
	function view_invite(ctx) {
		var token = ctx.params.token;
		console.debug('Invite Token: ', token);
		CloudOS_Get_Friend_Profile(token,
			function(json) {
				console.dir(json);
			}
		);
		show_view('invite');
		currentView = 'invite';
	};

	// --------------------------------------------
	// View: profile
	function view_profile() {
		show_view('profile');
		getMyProfile();
		set_screen_title('Profile');
		currentView = 'profile';
	};

	// --------------------------------------------
	// View: friend
	function view_friend(ctx) {
		var token = ctx.params.token;
		console.debug('Invite Token: ', token);
		show_view('friend');
		set_screen_title('Friend');
		currentView = 'friend';
	};

	// --------------------------------------------
	// View: logout
	function view_logout() {
		CloudOS_Remove_Session();
		Navbar_Show_Anon();
		page('/');
	};

	// --------------------------------------------
	// View: Test
	function view_test() {
		show_view('test');
		set_screen_title('test');
		currentView = 'test';

		// Hello world test
		CloudOS_Raise_Event('cloudos', 'libtest', { "Name": "Ed Orcutt" },
			function(json) {
				console.dir(json)
			});

		// Create Channel
//		CloudOS_Create_Channel(
//			function(json) {
//				console.dir(json);
//				console.debug("TOP LEVEL Channel: ", json.token)
//			}
//		);

		CloudOS_Destroy_Channel("139e5a4dd3ab3d53f26a6d7c73c0e928",
			function(json) {
				console.debug("CloudOS_Destroy_Channel Callback");
				console.dir(json);
			}
		);

		var OAuth_URL = CloudOS_Get_OAuth_URL();
		console.debug("OAuth_URL: ", OAuth_URL);
	};

	// --------------------------------------------
	// View: 404
	function view_notfound() {
		show_view('404');
		set_screen_title('404');
		currentView = '404';
	};

	// ========================================================================
	// myProfile Management

	// --------------------------------------------
	function getMyProfile() {
		$('#modalSpinner').show();
		CloudOS_Get_MyProfile(function(json) {
			console.dir(json);
			$('#modalSpinner').hide();
			$('#myProfileName').val(json.myProfileName);
			$('#myProfileEmail').val(json.myProfileEmail);
			$('#myProfilePhone').val(json.myProfilePhone);
			$('#myProfileDescription').text(json.myProfileDescription);
			$('#myProfileNotes').text(json.myProfileNotes);
			$('#myProfilePhoto').val(json.myProfilePhoto);
			$('#myProfilePhoto-preview').attr('src', json.myProfilePhoto);
		});
	}

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
		CloudOS_Update_MyProfile(eventAttributes,
			function(json) {
				$('#modalSpinner').hide();
				$('#alert-profile-success').show('fast').delay(7000).hide('fast')
		})
  })

	// ========================================================================
	// Friend Finder

	// --------------------------------------------
	// GET list of Forever Invitations

	function getForeverInvitations() {
		CloudOS_PDS_List("foreverInvite",
		  function(json) {
				// console.dir(json);
				$('#table-finder').html('');
				if (json) {
					jQuery.each(json, function(token, val) {
						var newRow = '<tr><td>' +
									val.name +
									'<button class="btn btn-mini btn-danger btn-finder-action btn-finder-action-revoke pull-right" data-token="'+
									val.token + '">Revoke</button>' +
									'<button class="btn btn-mini btn-primary btn-finder-action pull-right">Resend</button>' +
									'</td></tr>';
						$('#table-finder').prepend(newRow);
					})
				}
				$('#modalSpinner').hide();
			}
		);
	}

	$('form.form-finder').submit(function(event) {

		event.preventDefault();
		$('#modalSpinner').show();

		CloudOS_Create_Channel(
			function(json) {
				var ename = $('#inviteName').val();
				var email = $('#inviteEmail').val();
				var eventAttributes = {
						"token" : json.token,
						"name"  : ename,
						"email" : email
				};
				console.dir(eventAttributes);
				console.dir(json);

				CloudOS_PDS_Add("foreverInvite", json.token, eventAttributes,
				  function(json) {
						console.dir(json);
						// Clear invitation form
						$('#inviteName').val('');
						$('#inviteEmail').val('');

						// Add new invitation to table
						var newRow = '<tr><td>' +
											 json.name +
											 '<button class="btn btn-mini btn-danger btn-finder-action pull-right" data-token="'+
												 json.token + '">Revoke</button>' +
											 '<button class="btn btn-mini btn-primary btn-finder-action pull-right">Resend</button>' +
											 '</td></tr>';
						$('#table-finder').prepend(newRow);
						$('#modalSpinner').hide();
				})

				// --------------------------------------------
				// send invitation email
				var subject = "Kynetx Forever Invitation";
				var body = "You have been invited to Forever " +
							"http://devcloud.krlcode.com/?invite=" + json.token;
				CloudOS_Send_Email(ename, email, subject, body,
				  function(json) {
						console.dir(json);
					})
			}
		);
	})

	// --------------------------------------------
	// Finder Revoke Invitation
	$('#table-finder').on('click','button.btn-finder-action-revoke',
		function(event){
			var token = $(this).attr('data-token');
			console.debug("revoke token: ", token);

			// Remove row from GUI
			$(this).parent().parent().remove();

			CloudOS_PDS_Delete("foreverInvite", token,
				  function(json) {
						console.dir(json);
					}
			);

			CloudOS_Destroy_Channel(token,
				  function(json) {
						console.dir(json);
					}
			);

			return false;
		}
	)

});
