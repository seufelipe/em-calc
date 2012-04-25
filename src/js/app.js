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
				px: "",
				em: 1,
				context: 16
			},
		
			initialize: function() {
				this.bind("change:px", function() {
					var px = this.get("px");
				
					log("'px' changed to: " + px);
				
					// Re-calc the ems once the pixels have been changed.
					this.calcEms(px, 16); // Hardcoded the context at "16" for now.
				});
			
				this.bind("change:em", function() {
					log("'em' changed to: " + this.get("em") + "em");
				});
				
				this.bind("change:name", function() {
					log("'name' changed to: " + this.get("name"));
				});
			},
			
			validate: function(attributes) {
				if (/\D/g.test(attributes.px)) {
					return "Please enter a number.";
				}
			},
			
			calcEms: function(target, context) {
				if ($.isNumeric(target)) { // Don't bother if target's not a number.
					var result = target / context;
				
					this.set({
						"px": target,
						"em": result
					});
				}
			}
		}),
		node = new Node;
	
	// Nodes collection.
	var Nodes = Backbone.Collection.extend({
		model: node,
		
		initialize: function() {
			this.add(node);
		}
	});
	
	// Node view.
	var NodeView = Backbone.View.extend({
			model: node,
		
			tagName: "li",
		
			className: "node",
		
			tmpl: _.template($("#node-template").html()),
		
			events: {
				"dblclick .name": "toggleNodeName",
				"blur input.node-name": "updateNodeName",
				"change .px": "updatePx",
				"click .js-add-node": "addNew",
				"click .js-add-sub-node": "addSub"
			},
		
			initialize: function() {
				this.render();
			},
		
			render: function() {
				$(this.el).html(this.tmpl(this.model.attributes));
				
				return this;
			},
		
			toggleNodeName: function() {
				var $el = this.$el,
					$name = $el.find(".name"),
					$nodeName = $el.find("input.node-name");
				
				if ($name.is(":visible")) {
					$name.hide();
					$nodeName.show().select();
				}
				else {
					$name.show();
					$nodeName.hide();
				}
			},
			
			updateNodeName: function() {
				var val = this.$el.find("input.node-name").val(),
					$name = this.$el.find(".name");
				
				this.model.set("name", val);
				$name.text(val);
				
				this.toggleNodeName();
			},
		
			updatePx: function() {
				var $pxField = $(this.el).find("input.px"),
					val = parseInt($pxField.val(), 10);
				
				// Update px field with the parsed integer
				// to remove any non-numeric characters.
				$pxField.val(val);
				
				this.model.set("px", val);
				
				this.updateEm();
			},
		
			updateEm: function() {
				$(this.el).find("input.ems").val(this.model.get("em") + "em");
			},
			
			addNew: function() {
				log("Add one");
			},
			
			addSub: function() {
				log("Add sub");
			},
			
			delete: function() {
				
			}
		})
		//, node_view = new NodeView;
	
	// Node collection.
	var NodesView = Backbone.View.extend({
		tagName: "ul",
		
		className: "node-list",
		
		context: "#em-calc",
		
		initialize: function() {
			this.collection = new Nodes();
			this.collection.bind("add", this.render);
			
			this.render();
		},
		
		render: function() {
			this.$el.append(new NodeView({model: node}).render().el);
			this.$el.appendTo(this.context);
			
			return this;
		}
	});
	
	// App.
	var AppView = Backbone.View.extend({
			el: $("#em-calc"),
			
			initialize: function() {
				this.$el.on("click", "input.ems", function(e) {
					this.select();
				});
			}
		});
	
	var nodesView = new NodesView(),
		appView = new AppView;
})(window.jQuery, document, window);