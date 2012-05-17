describe("Em conversion", function() {
	var n = new Node();
	
	it("Converts pxs to ems", function() {
		n.calcEms(12, 16);
		
		expect(n.get("em")).toBe(0.75);
	});
	
	it("Converts pxs to ems", function() {
		n.calcEms(24, 12);
		
		expect(n.get("em")).toBe(0.5);
	});
});

describe("Add new node", function() {
	var nsv = new NodesView();
	
	it("Creates the first node in a set", function() {
		var len = nsv.collection.length;
		
		expect(len).toBe(1);
	});
});