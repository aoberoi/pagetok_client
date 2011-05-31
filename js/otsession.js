var PageTok = {
	openTok : {
		apiKey : 1127,
		sessionId : '153975e9d3ecce1d11baddd2c9d8d3c9d147df18',
		token : 'devtoken',
		session : '',
		publisher : '',
		subscribers : {},
		start : function () {
			TB.addEventListener("exception", this.exceptionHandler);
			
			if (TB.checkSystemRequirements() != TB.HAS_REQUIREMENTS) {
				alert("You don't have the minimum requirements to run this application."
					  + "Please upgrade to the latest version of Flash.");
			} else {
				this.session = TB.initSession(this.sessionId);	// Initialize session
				
				this.session.addEventListener('sessionConnected', this.sessionConnectedHandler);
				this.session.addEventListener('sessionDisconnected', this.sessionDisconnectedHandler);
				this.session.addEventListener('connectionCreated', this.connectionCreatedHandler);
				this.session.addEventListener('connectionDestroyed', this.connectionDestroyedHandler);
				this.session.addEventListener('streamCreated', this.streamCreatedHandler);
				this.session.addEventListener('streamDestroyed', this.streamDestroyedHandler);
			}
		},
		end : function() {
			TB.removeEventListener("exception", this.exceptionHandler);
			
			// Other event listeners go away on their own? BasicTutorial does not remove them
			
			this.session.disconnect();
		},
		connect : function() {
			this.session.connect(this.apiKey, this.token);
		},
		disconnect : function() {
			this.session.disconnect();
			hide('disconnectLink');
			hide('publishLink');
			hide('unpublishLink');
		},
		startPublishing : function() {
			if (!this.publisher) {
				var parentDiv = document.getElementById("myCamera");
				var publisherDiv = document.createElement('div'); // Create a div for the publisher to replace
				publisherDiv.setAttribute('id', 'opentok_publisher');
				parentDiv.appendChild(publisherDiv);
				this.publisher = this.session.publish(publisherDiv.id); // Pass the replacement div id to the publish method
				show('unpublishLink');
				hide('publishLink');
			}
		},
		stopPublishing : function() {
			if (this.publisher) {
				this.session.unpublish(publisher);
			}
			this.publisher = null;

			show('publishLink');
			hide('unpublishLink');
		},
		exceptionHandler : function(event) {
			alert("Exception: " + event.code + "::" + event.message);
		},
		sessionConnectedHandler : function(event) {
			// Subscribe to all streams currently in the Session
			for (var i = 0; i < event.streams.length; i++) {
				this.addStream(event.streams[i]);
			}
			show('disconnectLink');
			show('publishLink');
			hide('connectLink');
		},
		sessionDisconnectedHandler : function(event) {
			// This signals that the user was disconnected from the Session. Any subscribers and publishers
			// will automatically be removed. This default behaviour can be prevented using event.preventDefault()
			this.publisher = null;

			show('connectLink');
			hide('disconnectLink');
			hide('publishLink');
			hide('unpublishLink');
		},
		connectionCreatedHandler : function() {
			// This signals new connections have been created.
		},
		connectionDestroyedHandler : function() {
			// This signals that connections were destroyed
		},
		streamCreatedHandler : function(event) {
			// Subscribe to the newly created streams
			for (var i = 0; i < event.streams.length; i++) {
				this.addStream(event.streams[i]);
			}
		},
		streamDestroyedHandler : function(event) {
			// This signals that a stream was destroyed. Any Subscribers will automatically be removed.
			// This default behaviour can be prevented using event.preventDefault()
		},
		addStream : function(stream) {
			// Check if this is the stream that I am publishing, and if so do not publish.
			if (stream.connection.connectionId == this.session.connection.connectionId) {
				return;
			}
			var subscriberDiv = document.createElement('div'); // Create a div for the subscriber to replace
			subscriberDiv.setAttribute('id', stream.streamId); // Give the replacement div the id of the stream as its id.
			document.getElementById("subscribers").appendChild(subscriberDiv);
			this.subscribers[stream.streamId] = this.session.subscribe(stream, subscriberDiv.id);
		}
	},
	cache : {},
	isOpen : false,
	toggle : function() {
		if (this.isOpen) {
			console.log("turning off");
			this.close();
			this.isOpen = !this.isOpen;
		} else {
			console.log("turning on");
			this.open();
			this.isOpen = !this.isOpen;
		}
	},
	open : function() {
		// add sideBar to page
		if (typeof this.cache.sideBar == "undefined") {
			// build cache of sideBar
			this.cache.sideBar = $('<div>', { id: 'ot_session' });
			$('<h1>PageTok</h1>').appendTo(this.cache.sideBar);
			$('<div>', { id: "opentok_console" }).appendTo(this.cache.sideBar);
			var connectButton = $('<input>', { id: "connectLink", type: "button", value: "Connect"});
			var disconnectButton = $('<input>', { id: "disconnectLink", type: "button", value: "Leave"});
			var publishButton = $('<input>', { id: "publishLink", type: "button", value: "Start Publishing"});
			var unpublishButton = $('<input>', { id: "unpublishLink", type: "button", value: "Stop Publishing"});
			$('<div>', { id: "links" })
			.append(connectButton)
			.append(disconnectButton)
			.append(publishButton)
			.append(unpublishButton)
			.appendTo(this.cache.sideBar);
			$('<div>', { id: "myCamera", class: "publisherContainer" }).appendTo(this.cache.sideBar);
			$('<div>', { id: "subscribers" }).appendTo(this.cache.sideBar);
		}
		this.cache.sideBar.appendTo(document.body);
		
		// add event listeners
		// needed to capture 'this' in order to use handlers properly, might be a cleaner way
		var self = this;
		document.getElementById('connectLink').addEventListener('click',function() {
			self.openTok.connect();
		}, false);
		document.getElementById('disconnectLink').addEventListener('click', function() {
			self.openTok.disconnect();
		}, false);
		document.getElementById('publishLink').addEventListener('click', function() {
			self.openTok.startPublishing();
		}, false);
		document.getElementById('unpublishLink').addEventListener('click', function() {
			self.openTok.stopPublishing();
		}, false);
		
		show('connectLink');
		
		// join opentok session
		this.openTok.start();
	},
	close : function() {
		// leave opentok session
		this.openTok.end();
		
		// TODO: remove event listeners
		//document.getElementById('connectLink').removeEventListener('click', this.openTok.connect);
		//document.getElementById('disconnectLink').removeEventListener('click', this.openTok.disconnect);
		//document.getElementById('publishLink').removeEventListener('click', this.openTok.startPublishing);
		//document.getElementById('unpublishLink').removeEventListener('click', this.openTok.stopPublishing);
		
		// remove sideBar from page
		$('#ot_session').remove();
	}
};

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    switch(request.name) {
		case "toggle" : PageTok.toggle(); break;
	}
	sendResponse();
});

function show(id) {
	document.getElementById(id).style.display = 'block';
}

function hide(id) {
	document.getElementById(id).style.display = 'none';
}