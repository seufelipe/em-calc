var app = app || {};

(function() {
	'use strict';

	var log = function(message) {
		if (window.console && window.console.log) {
			window.console.log(message);
		}
	};

	// --- Models ---

	app.Node = Backbone.RelationalModel.extend({
		defaults: {
			name: 'div', // HTML node name, e.g. html, body, div, p, etc.
			target: null, // Target pixel value
			decimalPlaces: 3, // Number of decimal places for ems
			contextEl: '.list'
		},

		relations: [{
			type: Backbone.HasMany,
			key: 'children',
			relatedModel: 'app.Node', // Its related model is itself...
			collectionType: 'app.NodesCollection',
			reverseRelation: {
				type: Backbone.HasOne,
				key: 'parent'
			}
		}],

		initialize: function() {
			// Parents notify their children when they have changed
			this.bind('change:target', function() {
				var children = this.get('children');

				if (children && children.length) {
					// Notify all children
					_.each(children.models, function(child) {
						child.setEm();
					});
				}
			});
		},

		setEm: function() {
			var res,
				target = this.get('target'),
				context = this.get('parent').get('target');

			res = target / context;

			this.set('em', res);
			log(this.get('em'));

			return res;
		},

		setDecimalPlaces: function() {
			var em = this.get('em'),
				decimalPlaces = this.get('decimalPlaces');

			if (em) {
				this.set('em', em.toFixed(decimalPlaces));
			}
		}
	});

	// --- Collections ---

	app.NodesCollection = Backbone.Collection.extend({
		model: app.Node
	});

	// --- Views ---

	app.SettingsView = Backbone.View.extend({
		el: '.settings',

		tmpl: _.template($('#settings-tmpl').html()),

		events: {
			'change #base-px': 'setBasePx',
			'change #decimal-places': 'setDecimalPlaces'
		},

		initialize: function() {
			this.render();

			this.basePxField = this.$el.find('#base-px');
			this.decimalPlacesField = this.$el.find('#decimal-places');
		},

		render: function() {
			this.$el.append(this.tmpl(this.model.attributes));

			return this;
		},

		setBasePx: function() {
			var val = this.basePxField.val();

			this.model.set('target', val);
		},

		setDecimalPlaces: function() {
			var val = this.decimalPlacesField.val();

			this.model.set('decimalPlaces', val);
		}
	});

	app.NodeView = Backbone.View.extend({
		tagName: 'li',

		className: 'node',

		tmpl: _.template($('#node-tmpl').html()),

		events: {
			'dblclick .name': 'toggleNameVisibility',
			'blur input.node-name': 'updateNodeName',
			'click .add-sibling': 'addSibling',
			'click .add-child': 'addChild',
			'click .delete': 'removeChild'
		},

		initialize: function() {
			this.render();
		},

		render: function() {
			this.$el.html(this.tmpl(this.model.attributes));

			this.$name = this.$el.find('.name');
			this.$nodeNameField = this.$el.find('input.node-name');

			return this;
		},

		toggleNameVisibility: function(event) {
			event.stopPropagation();

			if (this.$name.is(':visible')) {
				this.$el.find('.name').hide();
				this.$nodeNameField.show().select();
			} else {
				this.$name.show();
				this.$nodeNameField.hide();
			}
		},

		updateNodeName: function(event) {
			var val = this.$nodeNameField.val();

			event.stopPropagation();

			this.model.set('name', val);
			this.$name.text(val);

			this.toggleNameVisibility(event);
		},

		addSibling: function(event) {
			var model = this.model,
				set = model.get('parent').get('children'),
				idx = set.indexOf(model);

			event.stopPropagation();

			set.add(new app.Node(), {
				at: idx + 1
			});
		},

		addChild: function(event) {
			var set = new app.Node({
					name: 'root',
					contextEl: this.el
				});

			event.stopPropagation();

			set.get('children').add(new app.Node({
				name: 'div'
			}));

			new app.NodeSetView({
				model: set
			});
		},

		removeChild: function(event) {
			var model = this.model,
				set = model.get('parent').get('children');

			event.stopPropagation();

			set.remove(model);

			this.$el.remove();
		}
	});

	app.NodeSetView = Backbone.View.extend({
		tagName: 'ul',

		className: 'set',

		initialize: function() {
			_.bindAll(this);

			this.contextEl = this.model.get('contextEl');
			this.render();

			// Re-render on add or remove.
			this.model.bind('add:children', this.render);
		},

		render: function() {
			var self = this,
				children = this.model.get('children').models;

			this.$el.html('');

			_.each(children, function(childModel) {
				self.$el.append(new app.NodeView({
					model: childModel
				}).render().el);
			});

			this.$el.appendTo(this.contextEl);
		}
	});

	app.App = Backbone.View.extend({
		el: '.em-calc',

		initialize: function() {
			this.$nodeList = this.$el.find('.list');

			// Init a new node.
			var rootNode = new app.Node({
				name: 'root',
				target: 16,
				contextEl: this.$nodeList
			});

			app.settings = new app.SettingsView({
				model: rootNode
			});
			
			app.nodeNodeSetView = new app.NodeSetView({
				model: rootNode
			});

			// Add some child nodes to it.
			rootNode.get('children').add(
				new app.Node({
					name: 'html',
					target: 20
				})
			);
		}
	});

	new app.App();
}());