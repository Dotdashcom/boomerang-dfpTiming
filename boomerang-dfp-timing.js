/**
\file boomerang-dfp-timing.js
*/

(function(w) {

var d = w.document;

BOOMR = BOOMR || {};
BOOMR.plugins = BOOMR.plugins || {};

var impl = {
	complete: false,
	dfpEvents: [
		"gpt-google_js_loaded",
		"gpt-gpt_fetch",
		"gpt-gpt_fetched",
		"gpt-page_load_complete",
		"gpt-queue_start",
		"gpt-service_add_slot",
		"gpt-service_add_targeting",
		"gpt-service_collapse_containers_enable",
		"gpt-service_create",
		"gpt-service_single_request_mode_enable",
		"gpt-slot_create",
		"gpt-slot_add_targeting",
		"gpt-slot_fill",
		"gpt-slot_fetch",
		"gpt-slot_receiving",
		"gpt-slot_render_delay",
		"gpt-slot_rendering",
		"gpt-slot_rendered"
	],
	dfpSlots: [],
	refreshSlots: {},
	dfpData: [],
	dfpEventMap: {
		8 : "gpt-google_js_loaded",
		46: "gpt-gpt_fetch",
		48: "gpt-gpt_fetched",
		1 : "gpt-page_load_complete",
		31: "gpt-queue_start",
		40: "gpt-service_add_slot",
		88: "gpt-service_add_targeting",
		78: "gpt-service_collapse_containers_enable",
		35: "gpt-service_create",
		63: "gpt-service_single_request_mode_enable",
		2 : "gpt-slot_create",
		17: "gpt-slot_add_targeting",
		50: "gpt-slot_fill",
		3 : "gpt-slot_fetch",
		4 : "gpt-slot_receiving",
		53: "gpt-slot_render_delay",
		5 : "gpt-slot_rendering",
		6 : "gpt-slot_rendered"
	},
	attachEvents: function() {
		var w = BOOMR.window,
			gtag = w.googletag;

		if (this.complete) {
			return this;
		}

		gtag.cmd.push(function() {
			gtag.on(impl.dfpEvents.join(" "), function(e,level,message,service,slot,reference) {
				var messageName = impl.dfpEventMap[message.getMessageId()],
					timestamp = (new Date()).getTime(),
					slotId = slot? slot.getSlotId().getId() : "undefined";
					if (slotId != "undefined") {
						if (impl.dfpSlots[slotId] && impl.dfpSlots[slotId]["is_rendered"]) {
							// Slot has fully rendered, any timing information for this slot is based on a refresh
							var refreshObj = {};
							if (!impl.refreshSlots[slotId]) {
								refreshObj[messageName] = timestamp;
								impl.refreshSlots[slotId] = [];
								impl.refreshSlots[slotId].push(refreshObj);
								return;
							}

							// Loop backwards through array associated with this slotId to see if the event has been triggered already
							for (var i = impl.refreshSlots[slotId].length - 1; i >= 0; i--) {
								if (impl.refreshSlots[slotId][i]["gpt-slot_rendered"]) {
									refreshObj[messageName] = timestamp;
									impl.refreshSlots[slotId].push(refreshObj);
									break;
								} else if (impl.refreshSlots[slotId][i][messageName]) {
									continue;
								} else {
									impl.refreshSlots[slotId][i][messageName] = timestamp;
									break;
								}
							}
						} else {
							
							if (!impl.dfpSlots[slotId]) {
								impl.dfpSlots[slotId] = {};
							}

							if (messageName == "gpt-slot_rendered") {
								impl.dfpSlots[slotId]["is_rendered"] = true;
							}

							impl.dfpSlots[slotId][messageName] = timestamp;
						}
					} else if (messageName == "gpt-slot_fill") {
						// Exclude this event from timing record, as it has no useful slot information
						return;
					} else {
						impl.dfpData[messageName] = timestamp;
					}
			});
		});

	},

	done: function() {
		// If firing with timeout and on subscribe, only fire off beacon once
		if (this.complete) {
			return this;
		}
			var data = {
				"dfpSlotTiming": [],
				"dfpGeneralTiming": []
				},
				dfpTimingObj = {};
				
		for (var key in impl.dfpSlots) {
			if (impl.dfpSlots.hasOwnProperty(key)) {
				var tempInnerObj = {};
				for (var k in impl.dfpSlots[key]) {
					if (impl.dfpSlots[key].hasOwnProperty(k) && k != "is_rendered") {
						var keyName = k.toString();
						tempInnerObj[keyName] = impl.dfpSlots[key][k];
					}
				}
				tempInnerObj["slot_id"] = key;
				data.dfpSlotTiming.push(tempInnerObj);

				// Check for any refresh data for this slot
				if (impl.refreshSlots[key]) {
					var tempRefreshObj = {};
					for (var i = 0; i < impl.refreshSlots[key].length; i++) {
						tempRefreshObj = {};
						for (var msgName in impl.refreshSlots[key][i]) {
							if (impl.refreshSlots[key][i].hasOwnProperty(msgName)) {
								tempRefreshObj[msgName] = impl.refreshSlots[key][i][msgName];
							}
						}
						tempRefreshObj["slot_id"] = key;
						data.dfpSlotTiming.push(tempRefreshObj);
					}
				}
			}
		}
		
		
		for (var key in impl.dfpData) {
			if (impl.dfpData.hasOwnProperty(key)) {
				dfpTimingObj[key] = impl.dfpData[key];
			}
		}
		data.dfpGeneralTiming.push(dfpTimingObj);
		
		BOOMR.addVar(data);
		impl.complete = true;
		BOOMR.sendBeacon();
	}
};

BOOMR.plugins.DFPTiming = {
	init: function(config) {
		BOOMR.utils.pluginConfig(impl, config, "DFPTiming", []);

		// Send beacon at page unload
		BOOMR.subscribe("before_unload", impl.done, null, impl);
		
		// If sending timeout value to config, call done() when timeout expires
		if (config.DFPTiming.timeout) {
			setTimeout(function() {
				impl.done();
			}, config.DFPTiming.timeout);
		}

		// If sending event list in config, reset event list to config value
		if (config.DFPTiming.events && config.DFPTiming.events.length > 0) {
			impl.dfpEvents = config.DFPTiming.events;
		}

		if (!impl.initialized) {
			// Add googletag event listeners to record timing
			impl.attachEvents();
		}

		impl.initialized = true;

		return this;
	},

	is_complete: function() {
		return impl.complete;
	}
};

}(window));

