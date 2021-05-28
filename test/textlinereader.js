const assert = require('assert/strict');

const { SelectionInfo,
    TextLine,
    TextLineReader } = require('../index');

describe('TextLineReader Test', () => {
    it('Test getLineTextSelections()', () => {
        let text1 = '0123\n6789\nabcde';
        let textSelections = TextLineReader.getLineTextSelections(text1);

        assert.equal(3, textSelections.length);

        assert.equal(0, textSelections[0].start);
        assert.equal(5, textSelections[0].end);

        assert.equal(5, textSelections[1].start);
        assert.equal(10, textSelections[1].end);

        assert.equal(10, textSelections[2].start);
        assert.equal(15, textSelections[2].end);
    });

    // TODO::
});