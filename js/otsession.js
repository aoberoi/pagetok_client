//var otSessionBox = $('<div id="ot_session"><p>test test</p></div>').appendTo(document.body);

var PageTok = {
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
		if (typeof this.cache.sideBar == "undefined") {
			// build cache of sideBar
			this.cache.sideBar = $('<div>', { id: 'ot_session' });
			var testingParagraph = $('<p>this is a test</p>')
			.appendTo(this.cache.sideBar);
		}
		this.cache.sideBar.appendTo(document.body);
	},
	close : function() {
		$('#ot_session').remove();
	}
};

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    switch(request.name) {
		case "toggle" : PageTok.toggle(); break;
	}
	sendResponse();
});