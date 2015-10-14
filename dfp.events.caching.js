(function() {
		
	var dfpEvents = ["gpt-google_js_loaded", "gpt-gpt_fetch", "gpt-gpt_fetched", "gpt-page_load_complete", "gpt-queue_start", "gpt-service_add_slot", "gpt-service_add_targeting", "gpt-service_collapse_containers_enable", "gpt-service_create", "gpt-service_single_request_mode_enable", "gpt-slot_create", "gpt-slot_add_targeting", "gpt-slot_fill", "gpt-slot_fetch", "gpt-slot_receiving", "gpt-slot_render_delay", "gpt-slot_rendering", "gpt-slot_rendered"];
		
		window.dfpEventCache = {};
		window.googletag = window.googletag || {};
		window.googletag.cmd = window.googletag.cmd || [];

	googletag.on(dfpEvents.join(" "), function(e,level,message,service,slot,reference) {
		var timestamp = (new Date()).getTime(),
			messageId = message.getMessageId()
			eventObj = {
				e: e,
				level: level,
				message: message,
				service: service,
				slot: slot,
				reference: reference,
				timestamp: timestamp
			};

			if (!dfpEventCache[messageId]) {
				dfpEventCache[messageId] = [];
			}
			dfpEventCache[messageId].push(eventObj);
	});

})();