describe('Parent add/remove child nodes', function() {
	var parentNode = new app.Models.Node(),
		children = parentNode.get('children');

	it('Should accept addition of child nodes', function() {
		children.add(new app.Models.Node());

		expect(children.length).toBe(1);

		children.add([
			new app.Models.Node(),
			new app.Models.Node()
		]);

		expect(children.length).toBe(3);
	});

	it('Should accept removal of child nodes', function() {
		var model = children.models[0];

		children.remove(model);

		expect(children.length).toBe(2);
	});
});