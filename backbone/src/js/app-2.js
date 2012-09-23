var app = app || {};

(function(app, Backbone, window, document) {
	'use strict';

	// Quick log func for debugging
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
			relatedModel: 'app.Node', // Its related model is itself... ???
			collectionType: 'app.NodesCollection',
			reverseRelation: {
				type: Backbone.HasOne,
				key: 'parent'
			}
		}],

		initialize: function() {
			// Any changes to the target px
			// should trigger a re-calc of ems
			this.bind('change:target', function() {
				this.setEm();
			});

			// Parents notify their children when they have changed
			/*this.bind('change:target', function() {
				var children = this.get('children');

				if (children && children.length) {
					// Notify all children
					_.each(children.models, function(child) {
						child.setEm();
					});
				}
			});*/
		},

		// Calculate em and set it
		setEm: function() {
			var res,
				target = this.get('target'),
				context = this.get('parent').get('target');

			res = target / context;

			this.set('em', res);
			// log(this.get('em'));

			// Also return "res" just incase
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
			'change input.target': 'updateTarget',
			'focus input.em': 'selectEm',
			'click .add-sibling': 'addSibling',
			'click .add-child': 'addChild',
			'click .delete': 'removeChild'
		},

		initialize: function() {
			_.bindAll(this);

			this.render();

			this.parent = this.model.get('parent');
			this.siblings = this.parent.get('children');

			this.model.bind('change:em', this.updateEmField);
		},

		render: function() {
			// Insert the template
			this.$el.html(this.tmpl(this.model.attributes));

			// Set some jQuery references here. Can't set these up in
			// initialize because the template won't have been rendered
			this.$name = this.$el.find('.name');
			this.$nodeNameField = this.$el.find('input.node-name');
			this.$targetField = this.$el.find('input.target');
			this.$emField = this.$el.find('input.em');

			return this;
		},

		toggleNameVisibility: function(event) {
			event.stopPropagation();

			if (this.$name.is(':visible')) {
				// Name is visible so hide it, show the edit
				// name field and select its value
				this.$el.find('.name').hide();
				this.$nodeNameField.show().select();
			} else {
				// Otherwise, hide the field and show
				// the name as text
				this.$nodeNameField.hide();
				this.$name.show();
			}
		},

		updateNodeName: function(event) {
			var val = this.$nodeNameField.val();

			event.stopPropagation();

			this.model.set('name', val);
			this.$name.text(val);

			this.toggleNameVisibility(event);
		},

		updateTarget: function() {
			var target = parseInt(this.$targetField.val(), 10);

			this.model.set('target', target);
		},

		selectEm: function() {
			this.$emField.select();
		},

		updateEmField: function() {
			var em = this.model.get('em');

			this.$el.find('.em').val(em + 'em');
		},

		addSibling: function(event) {
			var idx = this.siblings.indexOf(this.model);

			event.stopPropagation();

			this.siblings.add(new app.Node(), {
				at: idx + 1
			});
		},

		addChild: function(event) {
			var set = new app.Node({
					name: 'root',
					contextEl: this.el
				});

			event.stopPropagation();

			new app.NodeSetView({
				model: set
			});

			set.get('children').add(new app.Node({
				name: 'div'
			}));
		},

		removeChild: function(event) {
			event.stopPropagation();

			this.siblings.remove(this.model);

			this.$el.remove();
		}
	});

	app.NodeSetView = Backbone.View.extend({
		tagName: 'ul',

		className: 'set',

		initialize: function() {
			_.bindAll(this);

			this.$contextEl = this.model.get('contextEl');
			// Render new node when added.
			this.model.bind('add:children', this.renderNode);

			this.render();
		},

		render: function() {
			this.$el.appendTo(this.$contextEl);
		},

		renderNode: function(model) {
			var idx = this.model.get('children').indexOf(model),
				node = new app.NodeView({
					model: model
				}).render().el;

			if (idx === 0) {
				this.$el.append(node);
			} else {
				$(node).insertAfter(this.$el.find('li:eq(' + (idx - 1) + ')'));
			}
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
					name: 'html'
				})
			);
		}
	});

	new app.App();
}(app, Backbone, window, document));