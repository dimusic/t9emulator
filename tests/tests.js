var dict = [
    'тест',
    'тестирование',
    'при',
    'привет',
    'признак'
];
var t9 = new T9Trie(dict);

QUnit.test("generate tree", function(assert) {
    var validTree = {"т":{"е":{"с":{"т":{"$":true,"и":{"р":{"о":{"в":{"а":{"н":{"и":{"е":{"$":true}}}}}}}}}}}},"п":{"р":{"и":{"$":true,"в":{"е":{"т":{"$":true}}},"з":{"н":{"а":{"к":{"$":true}}}}}}}};
    assert.deepEqual(t9.tree, validTree, 'Doesn\'t return valid tree');
});

QUnit.test("t9 predict", function(assert) {
    var predictions = t9.predict('564', true);
    assert.deepEqual(predictions, ['при']);
    predictions = t9.predict('6366', true);
    assert.deepEqual(predictions, ['тест']);
});

QUnit.test("autocomplete predict", function(assert) {
    var predictions = t9.predict('5642', false);
    assert.deepEqual(predictions, ['привет']);
    predictions = t9.predict('6366', false);
    assert.deepEqual(predictions, ['тест', 'тестирование']);
});