(function($, d, w) {
	var log = function(message) {
		if (w.console && w.console.log) {
			w.console.log(message);
		}
	};
	
	// Node model.
	var Node = Backbone.Model.extend({
			defaults: {
				name: "node",
			},
			
			initialize: function() {
				log("Created new Node model: '" + this.get("name") + "'");
			}
		});
	
	var NodeView = Backbone.View.extend({
		model: ,
		
		
	});
	
	var Nodes = Backbone.Collection.extend({
		model: 
	});

})(window.jQuery, document, window);