/**
\file boomerangDfpTiming.js
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

	readCachedEvents: function() {
		var w = BOOMR.window,
			eventCache = w.dfpEventCache || {},
			messageName;

			for (var key in eventCache) {
				if (eventCache.hasOwnProperty(key)) {
					messageName = impl.dfpEventMap[key];
					for (var l = 0; l < eventCache[key].length; l++) {
						var timestamp = eventCache[key][l]["timestamp"],
							slot = eventCache[key][l]["slot"]
							slotId = slot? slot.getSlotId().getId() : "undefined";
						impl.recordEvent(messageName, timestamp, slotId);
					}
				}
			}

			impl.done();

	},

	// Process event and store in appropriate data slot
	recordEvent: function(messageName, timestamp, slotId) {
		if (slotId != "undefined") {
			if (impl.dfpSlots[slotId] && impl.dfpSlots[slotId][messageName]) {
				// Already recorded this message to the original slot rendering; this is now should be recorded as a refreshed item
				var refreshObj = {};
				if (!impl.refreshSlots[slotId]) {
					refreshObj[messageName] = timestamp;
					impl.refreshSlots[slotId] = [];
					impl.refreshSlots[slotId].push(refreshObj);
					return;
				}

				// Loop through array associated with this slotId to see if the event has been recorded already
				for (var i = 0; i < impl.refreshSlots[slotId].length; i++) {
					// Event has been recorded in this refresh already
					if (impl.refreshSlots[slotId][i][messageName]) {
						// If there are more refresh items, continue
						if (impl.refreshSlots[slotId][i+1]) {
							continue;
						} else {
							// Create new refresh object and break out of loop
							refreshObj[messageName] = timestamp;
							impl.refreshSlots[slotId].push(refreshObj);
							break;
						}
					} else {
						// Event has not been recorded yet, add
						impl.refreshSlots[slotId][i][messageName] = timestamp;
					}
				}
			} else {
				
				if (!impl.dfpSlots[slotId]) {
					impl.dfpSlots[slotId] = {};
				}

				impl.dfpSlots[slotId][messageName] = timestamp;
			}
		} else if (messageName == "gpt-slot_fill") {
			// Exclude this event from timing record, as it has no useful slot information
			return;
		} else {
			impl.dfpData[messageName] = timestamp;
		}
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
					if (impl.dfpSlots[key].hasOwnProperty(k)) {
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
		BOOMR.subscribe("before_unload", impl.readCachedEvents, null, impl);
		
		// If sending timeout value to config, call done() when timeout expires
		if (config.DFPTiming.timeout) {
			setTimeout(function() {
				impl.readCachedEvents();
			}, config.DFPTiming.timeout);
		}

		// If sending event list in config, reset event list to config value
		if (config.DFPTiming.events && config.DFPTiming.events.length > 0) {
			impl.dfpEvents = config.DFPTiming.events;
		}

		return this;
	},

	is_complete: function() {
		return impl.complete;
	}
};

}(window));

