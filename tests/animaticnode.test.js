/*
    Animatic node base functionality test cases.
*/

import Animatic from '../src/animatic.js';


// check detection of function handler
test('check non-detection of non-function handler', () => {
    let node = new Animatic.AnimaticNode({
        handler: {bla: 10}
    });

    expect(node._isFunctionHandler).toBe(false);
});

test('check detection of function handler', () => {
    let node = new Animatic.AnimaticNode({
        handler: function(){}
    });

    expect(node._isFunctionHandler).toBe(true);
});

// check uniqueness ID generation
test('check uniqueness ID generation', () => {

    // make sure to reset the counter
    Animatic.AnimaticNode._idCounter = 0;

    let ids = [
        new Animatic.AnimaticNode({handler: function(){}}).id,
        new Animatic.AnimaticNode({handler: function(){}}).id,
        new Animatic.AnimaticNode({handler: function(){}}).id,
        new Animatic.AnimaticNode({handler: function(){}}).id,
    ];

    let idSet = new Set(ids);

    expect(ids.length).toBe(4);
    expect(ids).toEqual([0, 1, 2, 3]);
});

// check initial animation status
test('check initial animation status', () => {
    let node = new Animatic.AnimaticNode({handler: function(){}});
    expect(node.status).toBe(Animatic.AnimationStatus.PAUSED);
});

// check over-assignment of orchestra
test('check over-assignment with the same orchestra', () => {
    const o1 = new Object();
    let node = new Animatic.AnimaticNode({handler: function(){}});
    node.orchestra = o1;  // initial
    node.orchestra = o1;  // reassign
});

test('check over-assignment with a different orchestra', () => {
    const o1 = new Object();
    const o2 = new Object();

    let node = new Animatic.AnimaticNode({handler: function(){}});
    node.orchestra = o1;  // initial
    expect(() => {
        node.orchestra = o2;  // reassign different
    }).toThrow();
});

// check connection of two nodes
test('check connection of stray nodes', () => {
    const node1 = new Animatic.AnimaticNode({handler: function(){}});
    const node2 = new Animatic.AnimaticNode({handler: function(){}});

    expect(() => {
        // connect stray node1 forwarding to node2
        node1.to(node2);
    }).toThrow();

});

test('check connection of two nodes', () => {
    const dummyOrchestra = {
        _nodes: new Map()
    }
    const node1 = new Animatic.AnimaticNode({handler: function(){}});
    const node2 = new Animatic.AnimaticNode({handler: function(){}});

    // prepare node1 with orchestra
    node1.orchestra = dummyOrchestra;

    // connect node1 forwarding to node2
    node1.to(node2);

    expect(node1.orchestra).toEqual(node2.orchestra);
});

// check connection of two nodes if animation started already
test('check connection of two nodes if animation started already', () => {
    const dummyOrchestra = {
        animationStarted: true,
        _nodes: new Map()
    }
    const node1 = new Animatic.AnimaticNode({handler: function(){}});
    const node2 = new Animatic.AnimaticNode({handler: function(){}});

    // prepare node1 with orchestra
    node1.orchestra = dummyOrchestra;

    expect(() => {
        // connect stray node1 forwarding to node2
        node1.to(node2);
    }).toThrow();
});

// check forward call with function handler
test.skip('check forward call with function handler', () => {

});

// check forward call with adapter handler
test.skip('check forward call with adapter handler', () => {

});

// check forward call with null handler
test.skip('check forward call with null handler', () => {

});

// check pause call with function handler
test.skip('check pause call with function handler', () => {

});

// check pause call with adapter handler
test.skip('check pause call with adapter handler', () => {

});

// check pause call with null handler
test.skip('check pause call with null handler', () => {

});

// check backward call with function handler
test.skip('check backward call with function handler', () => {

});

// check backward call with adapter handler
test.skip('check backward call with adapter handler', () => {

});

// check backward call with null handler
test.skip('check backward call with null handler', () => {

});

// check reset call with function handler
test.skip('check reset call with function handler', () => {

});

// check reset call with adapter handler
test.skip('check reset call with adapter handler', () => {

});

// check reset call with null handler
test.skip('check reset call with null handler', () => {

});

// check previousCount and nextCount on multiple previous connections
test.skip('check previousCount and nextCount on multiple previous connections', () => {

});

// check previousCountdown evolution
test.skip('check previousCountdown evolution', () => {

});

// check nextCountdown evolution
test.skip('check nextCountdown evolution', () => {

});

// check forwarding to the next node
test.skip('check forwarding to the next node', () => {

});

// check backwarding to the previous node
test.skip('check backwarding to the previous node', () => {

});

// check forwarding without an orchestra
test.skip('check forwarding without an orchestra', () => {

});

// check backwarding without an orchestra
test.skip('check backwarding without an orchestra', () => {

});
