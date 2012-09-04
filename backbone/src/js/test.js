var app = app || {};

(function() {
	'use strict';

	var log = function(message) {
		if (window.console && window.console.log) {
			window.console.log(message);
		}
	};

	app.Node = Backbone.RelationalModel.extend({
		defaults: {
			name: 'html', // HTML node name, e.g. html, body, div, p, etc.
			target: 16, // Target pixel value
			decimalPlaces: 4 // Number of decimal places for ems
		},

		relations: [
			{
				type: Backbone.HasMany,
				key: 'children',
				relatedModel: 'app.Node', // Its related model is itself...
				collectionType: 'app.NodesCollection',
				reverseRelation: {
					type: Backbone.HasOne,
					key: 'parent'
				}
			}
		],

		initialize: function() {
			// * Root nodes will have no parent so we can
			// * bind events to listen for changes on the
			// * "settings" model in here...

			// Parent notifies its children when its target changes
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

	app.NodesCollection = Backbone.Collection.extend({
		model: app.Node
	});

	app.App = Backbone.View.extend({
		el: '.em-calc',

		initialize: function() {
			// Init a new node.
			var rootNode = new app.Node();
			
			// log(node.get('parent'));
			// log(node.get('children').length);

			// Add some child nodes to it.
			rootNode.get('children').add([
				new app.Node({
					name: 'div',
					target: 20
				}),
				new app.Node({
					name: 'span',
					target: 40
				})
			]);
		}
	});

	new app.App();

	/*
	app.Node = Backbone.RelationalModel.extend({
		defaults: {
			name: 'node',
			px: null,
			em: null
		},

		initialize: function() {
			this.bind('change:px', function() {
				window.console.log('Changed! ' + this.get('px'));

				// Need to run .calcEms() here!
				this.calcEms();
			});
		},

		calcEms: function() {
			var res,
				px = this.get('px'),
				context = this.get('parent').get('px');

			res = px / context;

			this.set('em', res);

			window.console.log('Ems: ' + res);
			return res;
		}
	});

	app.Set = Backbone.RelationalModel.extend({
		defaults: {
			px: 16
		},

		relations: [
			{
				type: Backbone.HasMany,
				key: 'children',
				relatedModel: 'app.Node',
				collectionType: 'app.NodesCollection',
				reverseRelation: {
					type: Backbone.HasOne,
					key: 'parent'
				}
			}
		],

		initialize: function() {
			var root = this;

			// this.bind('add:children', function(model, coll) {
			// 	// this.logChildSettings(model);
			// 
			// 	model.set('px', this.get('px'));
			// });

			this.bind('change:px', function() {
				// window.console.log('====================');

				// _.each(this.get('children').models, function(val) {
				// 	this.logChildSettings(val);
				// });
			});

			this.get('children').add(new app.Node({
				name: 'html'
			}));
		},

		logChildSettings: function(model) {
			window.console.log(model.get('name'));
			window.console.log(model.get('px'));
			window.console.log(model.get('parent').get('px'));
		}
	});

	app.NodesCollection = Backbone.Collection.extend({
		model: app.Node
	});

	app.SetView = Backbone.View.extend({
		tagName: 'ul',

		className: 'nodes-list',

		initialize: function() {
			// _.bindAll(this);

			this.model.get('children').bind('add', this.render);

			this.render();
		},

		render: function() {
			var root = this;

			this.model.get('children').each(function(model) {
				root.$el.append(new app.NodeView({
					model: model
				}).render().el);
			});

			this.$el.appendTo(this.model.get('$context'));

			return this;
		}
	});

	app.NodeView = Backbone.View.extend({
		tagName: 'li',

		className: 'node',

		tmpl: _.template($('#node-template').html()),

		events: {
			'click .add-sibling': 'addSibling',
			'click .add-child': 'addChild',
			'change .px': 'setPx'
		},

		initialize: function() {
			this.render();
		},

		render: function() {
			this.$el.html(this.tmpl(this.model.attributes));

			return this;
		},

		addSibling: function(event) {
			event.stopPropagation();

			var idx = this.model.get('parent').get('children').indexOf(this.model);

			// window.console.log(idx);
			// window.console.log(this.model.get('parent').get('children').length);

			// this.model.get('parent').get('children').add(new app.Node(), {
			// 	at: idx + 1
			// });
		},

		addChild: function(event) {
			event.stopPropagation();

			this.nodes_view = new app.SetView({
				model: new app.Set({
					$context: this.el
				})
			});

			// window.console.log('Add child.');
			// window.console.log(this.nodes_view.model.get('children').length);
		},

		setPx: function() {
			var px = this.$el.find('.px').val();

			this.model.set('px', px);
			this.updateEms();
		},

		updateEms: function() {
			var ems = this.model.get('em');

			this.$el.find('.ems').val(ems + 'em');
		}
	});

	app.App = Backbone.View.extend({
		el: '.em-calc',

		initialize: function() {
			// app.settings = new app.Settings();

			// new app.SettingsView({
			// 	model: app.settings
			// });

			new app.SetView({
				model: new app.Set({
					$context: this.el
				})
			});
		}
	});

	new app.App();*/
}());