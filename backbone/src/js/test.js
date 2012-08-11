var log = function(message) {
	if (window.console && window.console.log) {
		window.console.log(message);
	}
};

var Mod = Backbone.Model.extend({
	defaults: {
		text: "New model"
	}
});

var ModView = Backbone.Model.extend({
	tagName: "li",
	render: function() {
		$(this.el).html(this.model.get("text"));

		return this;
	}
});

var Lists = Backbone.Collection.extend({
	initialize: function() {
		log("New list initialized");
	}
});

var List = Backbone.Collection.extend({
	initialize: function() {
		this.add(new Mod());
	}
});

var all_lists = new Lists();