(function() {
	var log = function(message) {
			if (window.console && window.console.log) {
				window.console.log(message);
			}
		},
		
		// Setup app.
		EmCalc = Ember.Application.create({
			rootElement: "#em-calc",
			ready: function() {
				EmCalc.NodesController.createNode();
			}
		});
	
	
	/*
		Models
		--------------------------
	*/
	
	EmCalc.defaults = Ember.Object.create({
		basePx: 16,
		decimalPlaces: 4
	});
	
	EmCalc.Node = Ember.Object.extend({
		name: "node",
		context: 16,
		px: 16,
		em: 1,
		emStr: function() {
			return this.get("em") + "em";
		}.property("em"),
		calcEms: function(context, target) {
			var result;
			
			context = context || this.get("context");
			target = target || this.get("px");
			
			if ($.isNumeric(target)) {
				result = target / context;
				
				this.set("em", result);
				
				return result;
			}
		}.observes("px", "context")
	});
	
	
	/*
		Controllers
		--------------------------
	*/
	
	EmCalc.NodesController = Ember.ArrayController.create({
		content: [],
		createNode: function() {
			var self = this,
				node = EmCalc.Node.create({
					name: "node"
				});
			
			self.pushObject(node);
		}
	});
	
	
	/*
		Views
		--------------------------
	*/
	
	EmCalc.NodeView = Ember.View.extend({
		templateName: "node-view"
	});
	
	
	
	/*
		Testing
		--------------------------
	*/
	
	var body_element = EmCalc.Node.create({
		name: "body"
	});
	
	log(body_element.get("name"));
	log(body_element.get("px"));
	log(body_element.get("em"));
	log(body_element.get("emStr"));
	
	body_element.set("px", 24);
	
	log(body_element.get("name"));
	log(body_element.get("px"));
	log(body_element.get("em"));
	log(body_element.get("emStr"));
	
	body_element.set("context", 12);
	
	log(body_element.get("name"));
	log(body_element.get("px"));
	log(body_element.get("em"));
	log(body_element.get("emStr"));
	
	// Expose.
	window.EmCalc = EmCalc;
}());