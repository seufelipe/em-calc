(function($, Backbone, window, document, undefined) {
	var app = app || {};

	var log = function(message) {
		if (window.console && window.console.log) {
			window.console.log(message);
		}
	};

	// Node model.
	var Node = Backbone.Model.extend({
		defaults: {
			name: 'node',
			px: '',
			em: 1,
			context: 16
		},

		initialize: function() {
			this.bind('change:px', function() {
				var px = this.get('px');

				// Re-calc the ems once the pixels have been changed.
				this.calcEms(px, 16); // Hardcoded the context at "16" for now.
			});
		},

		calcEms: function(target, context) {
			if ($.isNumeric(target)) { // Don't bother if target's not a number.
				var result = target / context;

				this.set({
					'px': target,
					'em': result
				});
			}
		}
	});

	// Nodes collection.
	var Nodes = Backbone.Collection.extend({
		initialize: function() {
			this.add(new Node());
		}
	});

	// Node view.
	var NodeView = Backbone.View.extend({
		tagName: 'li',

		className: 'node',

		tmpl: _.template($('#node-template').html()),

		events: {
			'dblclick .name': 'toggleNodeName',
			'blur input.node-name': 'updateNodeName',
			'change .px': 'updatePx',
			'click .add-sibling': 'addSibling',
			'click .add-child': 'addChild',
			'click .delete': 'delete'
		},

		initialize: function() {
			this.render();
		},

		render: function() {
			this.$el.html(this.tmpl(this.model.attributes));

			return this;
		},

		toggleNodeName: function() {
			var $el = this.$el,
				$name = $el.find('.name'),
				$node_name = $el.find('input.node-name');
		
			if ($name.is(':visible')) {
				$name.hide();
				$node_name.show().select();
			} else {
				$name.show();
				$node_name.hide();
			}
		},

		updateNodeName: function() {
			var val = this.$el.find('input.node-name').val(),
				$name = this.$el.find('.name');
		
			this.model.set('name', val);
			$name.text(val);
		
			this.toggleNodeName();
		},
	
		updatePx: function() {
			var $px_field = this.$el.find('input.px'),
				val = parseInt($px_field.val(), 10);

			// Update px field with the parsed integer
			// to remove any non-numeric characters.
			$px_field.val(val);

			this.model.set('px', val);

			this.updateEm();
		},

		updateEm: function() {
			this.$el.find('input.ems').val(this.model.get('em') + 'em');
		},

		// Add new sibling node.
		addSibling: function() {
			// Get the current node's index.
			var idx = app.nodesView.collection.indexOf(this.model);

			// Add a new one after it.
			app.nodesView.collection.add(new Node(), {
				at: idx + 1
			});
		},

		// A new child node list.
		addChild: function() {
			log('Add child');

			// this.subNodeList = new NodesView({
			// 	context: this.$el
			// });
			// 
			// log(this.subNodeList.context);
		},

		// Delete a node.
		delete: function() {
			var collection = app.nodesView.collection;

			if (collection.length > 1) { // Don't remove if only one node remains.
				collection.remove(this.model);
			}
		}
	});

	// Node collection view.
	var NodesView = Backbone.View.extend({
		tagName: 'ul',

		className: 'node-list',

		context: '.list',

		initialize: function() {
			// Bind methods to this.
			_.bindAll(this);

			// Create nodes collection.
			this.collection = new Nodes();

			// Re-render on add or remove.
			this.collection.bind('add', this.render);
			this.collection.bind('remove', this.render);

			this.render();
		},

		render: function() {
			var that = this;

			this.$el.html('');

			this.collection.each(function(node) {
				that.$el.append(new NodeView({
					model: node
				}).render().el);
			});

			this.$el.appendTo(this.context);

			return this;
		}
	});

	// App.
	var AppModel = Backbone.Model.extend({
		defaults: {
			basePx: 16,
			decimalPlaces: 2
		}
	});
	
	var AppView = Backbone.View.extend({
			model: new AppModel(),

			el: $('.em-calc'),

			tmpl: _.template($('#settings-template').html()),

			initialize: function() {
				this.$settings = this.$('.settings-list');

				this.$el.on('click', 'input.ems', function(e) {
					this.select();
				});

				this.render();
			},

			render: function() {
				this.$settings.html(this.tmpl(this.model.attributes));

				return this;
			}
		});

	app.appView = new AppView();
	app.nodesView = new NodesView();
}(jQuery, Backbone, window, document));