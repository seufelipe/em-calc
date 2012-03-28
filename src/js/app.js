(function($, d, w) {
	var log = function(message) {
		if (w.console && w.console.log) {
			w.console.log(message);
		}
	};
	
	// Node model.
	var NodeModel = Backbone.Model.extend({
			defaults: {
				name: "node",
				pxVal: 12,
				emVal: 1,
				context: 16
			},
		
			initialize: function() {
				this.bind("change:pxVal", function() {
					var px = this.get("pxVal");
				
					log("'pxVal' changed to: " + px);
				
					// Re-calc the ems once the pixels have been changed.
					this.calcEms(px, 16); // Hardcoded the context at "16" for now.
				});
			
				this.bind("change:emVal", function() {
					log("'emVal' changed to: " + this.get("emVal") + "em");
				});
			},
		
			calcEms: function(target, context) {
				if ($.isNumeric(target)) { // Don't bother if target's not a number.
					var result = target / context;
				
					this.set({
						"pxVal": target,
						"emVal": result
					});
				}
			}
		}),
		node_model = new NodeModel;
	
	// Node view.
	var NodeView = Backbone.View.extend({
			model: node_model,
		
			tagName: "li",
		
			className: "node",
		
			tmpl: _.template($("#node-template").html()),
		
			events: {
				"change .px": "updatePxVal",
				"dblclick .node-name": "updateNodeName"
			},
		
			initialize: function() {
				this.render();
			},
		
			render: function() {
				$(this.el).html(this.tmpl(this.model.attributes));
			
				$("#node-list").append($(this.el));
			
				return this;
			},
		
			updateNodeName: function() {
				$(this.el).find(".name").hide().end().find("input.node-name").show();
			},
		
			updatePxVal: function() {
				var $px_field = $(this.el).find("input.px"),
					val = parseInt($px_field.val(), 10);
			
				// Update px field with the parsed integer
				// to remove any non-numeric characters.
				$px_field.val(val);
			
				this.model.set("pxVal", val);
			
				this.updateEmVal();
			},
		
			updateEmVal: function() {
				$(this.el).find("input.ems").val(this.model.get("emVal") + "em");
			}
		}),
		node_view = new NodeView;
	
	// Node collection.
	var NodeCollection = Backbone.Collection.extend({
			model: node_model
		}),
		node_collection = new NodeCollection;
	
	// App.
	var AppView = Backbone.View.extend({
			el: $("#em-calc"),
		
			initialize: function() {
				$(this.el).on("click", "input.ems", function(e) {
					this.select();
				});
			}
		}),
		app_view = new AppView;
})(jQuery, document, window);