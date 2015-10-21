/*
Copyright 2013 Michael Countis

MIT License: http://opensource.org/licenses/MIT
*/

(function(){
	"use strict";

	window.googletag = window.googletag || {};
	window.googletag.cmd = window.googletag.cmd || [];
	
	googletag.cmd.push(function(){
		
		if(googletag.hasOwnProperty("on") || googletag.hasOwnProperty("off") || googletag.hasOwnProperty("trigger") || googletag.hasOwnProperty("events"))
			return;
		
		var 	old_log = googletag.debug_log.log,
			events = [],
			addEvent = function(name,id,match){
				events.push({
					"name":name,
					"id":id,
					"match":match
				});
			};

		addEvent("gpt-google_js_loaded",                    8, /Google service JS loaded/ig);
		addEvent("gpt-gpt_fetch",                           46, /Fetching GPT implementation/ig);
		addEvent("gpt-gpt_fetched",                         48, /GPT implementation fetched\./ig);
		addEvent("gpt-page_load_complete",                  1, /Page load complete/ig);
		addEvent("gpt-queue_start",                         31, /^Invoked queued function/ig);

		addEvent("gpt-service_add_slot",                    40, /Associated ([\w]*) service with slot ([\/\w]*)/ig);
		addEvent("gpt-service_add_targeting",               88, /Setting targeting attribute ([\w]*) with value ([\w\W]*) for service ([\w]*)/ig);
		addEvent("gpt-service_collapse_containers_enable",  78, /Enabling collapsing of containers when there is no ad content/ig);
		addEvent("gpt-service_create",                      35, /Created service: ([\w]*)/ig);
		addEvent("gpt-service_single_request_mode_enable",  63, /Using single request mode to fetch ads/ig);

		addEvent("gpt-slot_create",                         2, /Created slot: ([\/\w]*)/ig);
		addEvent("gpt-slot_add_targeting",                  17, /Setting targeting attribute ([\w]*) with value ([\w\W]*) for slot ([\/\w]*)/ig);
		addEvent("gpt-slot_fill",                           50, /Calling fillslot/ig);
		addEvent("gpt-slot_fetch",                          3, /Fetching ad for slot ([\/\w]*)/ig);
		addEvent("gpt-slot_receiving",                      4, /Receiving ad for slot ([\/\w]*)/ig);
		addEvent("gpt-slot_render_delay",                   53, /Delaying rendering of ad slot ([\/\w]*) pending loading of the GPT implementation/ig);
		addEvent("gpt-slot_rendering",                      5, /^Rendering ad for slot ([\/\w]*)/ig);
		addEvent("gpt-slot_rendered",                       6, /Completed rendering ad for slot ([\/\w]*)/ig);

		googletag.events = googletag.events || {};

		googletag.on = function(events,op_arg0/*data*/,op_arg1/*callback*/){
			if(!op_arg0)
				return this;

			events = events.split(" ");

			var	data = op_arg1 ? op_arg0 : undefined,
				callback = op_arg1 || op_arg0,
				ei = 0,e = '';
			
			callback.data = data;

			for(e = events[ei = 0]; ei < events.length; e = events[++ei])
				(this.events[e] = this.events[e] || []).push(callback);

			return this;
		};


		googletag.off = function(events,handler){
			events = events.split(" ");
			var	ei = 0,e = "",
				fi = 0,f = function(){};
			
			for(e = events[ei]; ei < events.length; e = events[++ei]){
				if(!this.events.hasOwnProperty(e))
					continue;

				if(!handler){
					delete this.events[e];
					continue;
				}

				fi = this.events[e].length - 1;
				for(f = this.events[e][fi]; fi >= 0; f = this.events[e][--fi])
					if(f == handler)
						this.events[e].splice(fi,1);
				if(this.events[e].length === 0)
					delete this.events[e];
			}

			return this;
		};


		googletag.trigger = function(event,parameters){

			if(!this.events[event] || this.events[event].length === 0)
				return this;
			
			var	parameters = parameters || [],
				fi = 0,f = this.events[event][fi];
			
			for(fi,f;fi < this.events[event].length;f = this.events[event][++fi])
				if(f.apply(this,[{data:f.data}].concat(parameters)) === false)
					break;

			return this;
		};


		googletag.debug_log.log = function(level,message,service,slot,reference){
			if (message && message.getMessageId && typeof (message.getMessageId()) == 'number') {
				var	args = Array.prototype.slice.call(arguments),
					e = 0;
				for(e; e < events.length; e++)
					if(events[e].id === message.getMessageId())
						googletag.trigger(events[e].name,args);
			}
			return old_log.apply(this,arguments);
		};


	});
})();
;(function() {
		
	var dfpEvents = ["gpt-google_js_loaded", "gpt-gpt_fetch", "gpt-gpt_fetched", "gpt-page_load_complete", "gpt-queue_start", "gpt-service_add_slot", "gpt-service_add_targeting", "gpt-service_collapse_containers_enable", "gpt-service_create", "gpt-service_single_request_mode_enable", "gpt-slot_create", "gpt-slot_add_targeting", "gpt-slot_fill", "gpt-slot_fetch", "gpt-slot_receiving", "gpt-slot_render_delay", "gpt-slot_rendering", "gpt-slot_rendered"];
		
		window.dfpEventCache = {};
		window.googletag = window.googletag || {};
		window.googletag.cmd = window.googletag.cmd || [];

	googletag.cmd.push(function() {
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
	});
})();