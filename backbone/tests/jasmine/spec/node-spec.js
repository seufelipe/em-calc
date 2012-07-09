describe("Em conversion", function() {
	var n = new Node();
	
	it("Converts pxs to ems", function() {
		n.calcEms(12, 16);
		
		expect(n.get("em")).toBe(0.75);
	});
});

// describe("Set node name", function() {
// 	it("Changes the node name", function() {
// 		var n = new NodeView({
// 			model: new Node()
// 		});
// 		
// 		n.updateNodeName("Name");
// 		
// 		expect(n.get("name")).toBe("Name");
// 	});
// });

describe("Add new node", function() {
	var nsv = new NodesView();
	
	it("Creates the first node in a set", function() {
		var len = nsv.collection.length;
		
		expect(len).toBe(1);
	});
});

// describe("Remove a node", function() {
// 	var nsv = new NodesView();
// 	
// 	it("Remove a node from a set", function() {
// 		var len = nsv.collection.length;
// 		
// 		expect(len).toBe(1);
// 	});
// });