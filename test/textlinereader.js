const assert = require('assert/strict');

const {ObjectUtils} = require('jsobjectutils');
const {TextSelection} = require('jstextselection');

const { SelectionInfo,
    TextLine,
    TextLineReader } = require('../index');

describe('TextLineReader Test', () => {
    it('Test getLineTextSelections()', () => {
        //  0 1 2 3 ¶ 4 5 6 7 ¶ 8 9 a b c  <-- text
        // 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 <-- pos

        let textContent1 = '0123\n4567\n89abc';
        let lineTextSelections1 = TextLineReader.getLineTextSelections(textContent1);
        assert.equal(3, lineTextSelections1.length);

        assert(ObjectUtils.objectEquals(lineTextSelections1[0], new TextSelection(0, 5)));
        assert(ObjectUtils.objectEquals(lineTextSelections1[1], new TextSelection(5, 10)));
        assert(ObjectUtils.objectEquals(lineTextSelections1[2], new TextSelection(10,15)));

        //  0 1 2 3 ¶ 4 5 6 ¶ ¶ 7 8 ¶ 9 0  <-- text
        // 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 <-- pos

        let text2 = '0123\n456\n\n78\n90';
        let lineTextSelections2 = TextLineReader.getLineTextSelections(text2);
        assert.equal(5, lineTextSelections2.length);

        assert(ObjectUtils.objectEquals(lineTextSelections2[0], new TextSelection(0, 5)));
        assert(ObjectUtils.objectEquals(lineTextSelections2[1], new TextSelection(5, 9)));
        assert(ObjectUtils.objectEquals(lineTextSelections2[2], new TextSelection(9, 10)));
        assert(ObjectUtils.objectEquals(lineTextSelections2[3], new TextSelection(10, 13)));
        assert(ObjectUtils.objectEquals(lineTextSelections2[4], new TextSelection(13, 15)));

        //  ¶ 0 1 2 3 ¶ ¶ 4 5 6 ¶ ¶ 7 8 ¶ ¶  <-- text
        // 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 <-- pos

        let text3 = '\n0123\n\n456\n\n78\n\n';
        let lineTextSelections3 = TextLineReader.getLineTextSelections(text3);
        assert.equal(7, lineTextSelections3.length);

        assert(ObjectUtils.objectEquals(lineTextSelections3[0], new TextSelection(0, 1)));
        assert(ObjectUtils.objectEquals(lineTextSelections3[1], new TextSelection(1, 6)));
        assert(ObjectUtils.objectEquals(lineTextSelections3[2], new TextSelection(6, 7)));
        assert(ObjectUtils.objectEquals(lineTextSelections3[3], new TextSelection(7, 11)));
        assert(ObjectUtils.objectEquals(lineTextSelections3[4], new TextSelection(11, 12)));
        assert(ObjectUtils.objectEquals(lineTextSelections3[5], new TextSelection(12, 15)));
        assert(ObjectUtils.objectEquals(lineTextSelections3[6], new TextSelection(15, 16)));
    });

    it('Test getSelectionInfo()', () => {
        //          0 1 2 3 ¶ 6 7 8 9 ¶ a b c d e     <-- text
        //         0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5    <-- pos
        // sel start --^ ^-- sel end                  <-- text selection 1
        // sel start --^         ^-- sel end          <-- text selection 2
        // sel start --^             ^-- sel end      <-- text selection 3
        // sel start --^               ^-- sel end    <-- text selection 4
        //         sel start --^   ^-- sel end        <-- text selection 5
        //         sel start --^         ^-- sel end  <-- text selection 6

        let textContent1 = '0123\n6789\nabcde';
        let lineTextSelections1 = TextLineReader.getLineTextSelections(textContent1);

        let selectionInfo1 = TextLineReader.getSelectionInfo(lineTextSelections1,
            new TextSelection(2, 3));
        assert(ObjectUtils.objectEquals(selectionInfo1, new SelectionInfo(0,0,0,5,2,3)));

        let selectionInfo2 = TextLineReader.getSelectionInfo(lineTextSelections1,
            new TextSelection(2, 7));
        assert(ObjectUtils.objectEquals(selectionInfo2, new SelectionInfo(0,1,0,10,2,2)));

        let selectionInfo3 = TextLineReader.getSelectionInfo(lineTextSelections1,
            new TextSelection(2, 9));
        assert(ObjectUtils.objectEquals(selectionInfo3, new SelectionInfo(0,1,0,10,2,4)));

        let selectionInfo4 = TextLineReader.getSelectionInfo(lineTextSelections1,
            new TextSelection(2, 10));
        assert(ObjectUtils.objectEquals(selectionInfo4, new SelectionInfo(0,1,0,10,2,5)));

        let selectionInfo5 = TextLineReader.getSelectionInfo(lineTextSelections1,
            new TextSelection(6, 8));
        assert(ObjectUtils.objectEquals(selectionInfo5, new SelectionInfo(1,1,5,10,1,3)));

        let selectionInfo6 = TextLineReader.getSelectionInfo(lineTextSelections1,
            new TextSelection(6, 11));
        assert(ObjectUtils.objectEquals(selectionInfo6, new SelectionInfo(1,2,5,15,1,1)));
    });

    it('Test getSelectionInfo() - edge', () => {
        //          0 1 2 3 ¶ 6 7 8 9 ¶ a b c d e     <-- text
        //         0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5    <-- pos
        //                 ^-- start ^-- end          <-- text selection 1
        //                 ^-- start   ^-- end        <-- text selection 2
        //           start --^       ^-- end          <-- text selection 3
        //           start --^         ^-- end        <-- text selection 4
        //         ^-- sel start       end --^        <-- text selection 5
        //             ^-- sel start       end --^    <-- text selection 6
        //         ^-- sel start           end --^    <-- text selection 7

        let textContent1 = '0123\n6789\nabcde';
        let lineTextSelections1 = TextLineReader.getLineTextSelections(textContent1);

        let selectionInfo1 = TextLineReader.getSelectionInfo(lineTextSelections1,
            new TextSelection(4, 9));
        assert(ObjectUtils.objectEquals(selectionInfo1, new SelectionInfo(0,1,0,10,4,4)));

        let selectionInfo2 = TextLineReader.getSelectionInfo(lineTextSelections1,
            new TextSelection(4, 10));
        assert(ObjectUtils.objectEquals(selectionInfo2, new SelectionInfo(0,1,0,10,4,5)));

        let selectionInfo3 = TextLineReader.getSelectionInfo(lineTextSelections1,
            new TextSelection(5, 9));
        assert(ObjectUtils.objectEquals(selectionInfo3, new SelectionInfo(1,1,5,10,0,4)));

        let selectionInfo4 = TextLineReader.getSelectionInfo(lineTextSelections1,
            new TextSelection(5, 10));
        assert(ObjectUtils.objectEquals(selectionInfo4, new SelectionInfo(1,1,5,10,0,5)));

        let selectionInfo5 = TextLineReader.getSelectionInfo(lineTextSelections1,
            new TextSelection(0, 13));
        assert(ObjectUtils.objectEquals(selectionInfo5, new SelectionInfo(0,2,0,15,0,3)));

        let selectionInfo6 = TextLineReader.getSelectionInfo(lineTextSelections1,
            new TextSelection(2, 15));
        assert(ObjectUtils.objectEquals(selectionInfo6, new SelectionInfo(0,2,0,15,2,5)));

        let selectionInfo7 = TextLineReader.getSelectionInfo(lineTextSelections1,
            new TextSelection(0, 15));
        assert(ObjectUtils.objectEquals(selectionInfo7, new SelectionInfo(0,2,0,15,0,5)));
    });

    it('Test getSelectionInfo() - cursor collapsed', ()=>{
        //          0 1 2 3 ¶ 6 7 8 9 ¶ a b c d e     <-- text
        //         0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5    <-- pos
        //         ^-- sel start,end                  <-- text selection 1
        //             ^-- 2                          <-- text selection 2
        //                 ^-- 4                      <-- text selection 3
        //                   ^-- 5                    <-- text selection 4
        //                       ^-- 7                <-- text selection 5
        //                       sel start,end --^    <-- text selection 6
        //

        let textContent1 = '0123\n6789\nabcde';
        let lineTextSelections1 = TextLineReader.getLineTextSelections(textContent1);

        let selectionInfo1 = TextLineReader.getSelectionInfo(lineTextSelections1,
            new TextSelection(0));
        assert(ObjectUtils.objectEquals(selectionInfo1, new SelectionInfo(0,0,0,5,0,0)));

        let selectionInfo2 = TextLineReader.getSelectionInfo(lineTextSelections1,
            new TextSelection(2));
        assert(ObjectUtils.objectEquals(selectionInfo2, new SelectionInfo(0,0,0,5,2,2)));

        let selectionInfo3 = TextLineReader.getSelectionInfo(lineTextSelections1,
            new TextSelection(4));
        assert(ObjectUtils.objectEquals(selectionInfo3, new SelectionInfo(0,0,0,5,4,4)));

        let selectionInfo4 = TextLineReader.getSelectionInfo(lineTextSelections1,
            new TextSelection(5));
        assert(ObjectUtils.objectEquals(selectionInfo4, new SelectionInfo(1,1,5,10,0,0)));

        let selectionInfo5 = TextLineReader.getSelectionInfo(lineTextSelections1,
            new TextSelection(7));
        assert(ObjectUtils.objectEquals(selectionInfo5, new SelectionInfo(1,1,5,10,2,2)));

        let selectionInfo6 = TextLineReader.getSelectionInfo(lineTextSelections1,
            new TextSelection(15));
        assert(ObjectUtils.objectEquals(selectionInfo6, new SelectionInfo(2,2,10,15,5,5)));
    });

    it('Test getTextLineByTextSelection()/getTextLineByIndex()', ()=>{
        //          0 1 2 3 ¶ 6 7 8 9 ¶ a b c d e     <-- text
        //         0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5    <-- pos

        let textContent1 = '0123\n6789\nabcde';
        let lineTextSelections1 = TextLineReader.getLineTextSelections(textContent1);

        let textLine1 = TextLineReader.getTextLineByTextSelection(textContent1, lineTextSelections1[0]);
        assert(ObjectUtils.equals(textLine1, new TextLine(0, '0123\n')));
        assert.equal(textLine1.textContent, '0123');
        assert(textLine1.isContainsNewLineSymbol);

        let textLine2 = TextLineReader.getTextLineByTextSelection(textContent1, lineTextSelections1[2]);
        assert(ObjectUtils.equals(textLine2, new TextLine(10, 'abcde')));
        assert.equal(textLine2.textContent, 'abcde');
        assert(!textLine2.isContainsNewLineSymbol);

        let textLine3 = TextLineReader.getTextLineByIndex(textContent1, lineTextSelections1, 0);
        assert(ObjectUtils.equals(textLine3, textLine1));

        let textLine4 = TextLineReader.getTextLineByIndex(textContent1, lineTextSelections1, 2);
        assert(ObjectUtils.equals(textLine4, textLine2));
    });

    it('Test instance properties and functions', ()=>{
        //          0 1 2 3 ¶ 6 7 8 9 ¶ a b c d e     <-- text
        //         0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5    <-- pos
        // sel start --^         ^-- sel end          <-- text selection 1
        //         sel start --^   ^-- sel end        <-- text selection 2

        let textContent1 = '0123\n6789\nabcde';
        let textLineReader1 = new TextLineReader(textContent1, new TextSelection(2, 7));
        assert.equal(textLineReader1.lineCount, 3);
        assert(textLineReader1.selectedLineIndex === undefined);
        assert(ObjectUtils.arrayEquals(Array.from(textLineReader1.selectedLineIndexes), [0, 1]));
        assert(textLineReader1.isMultipleLines);
        assert(!textLineReader1.isCollapsed);

        assert(ObjectUtils.objectEquals(textLineReader1.getTextLine(0), new TextLine(0, '0123\n')));
        assert(ObjectUtils.arrayEquals(textLineReader1.getAllTextLines(), [
            new TextLine(0, '0123\n'),
            new TextLine(5, '6789\n'),
            new TextLine(10, 'abcde'),
        ]));

        assert(ObjectUtils.arrayEquals(textLineReader1.getSelectedTextLines(), [
            new TextLine(0, '0123\n'),
            new TextLine(5, '6789\n')
        ]));

        let textLineReader2 = new TextLineReader(textContent1, new TextSelection(6, 8));
        assert.equal(textLineReader2.lineCount, 3);
        assert(ObjectUtils.arrayEquals(Array.from(textLineReader2.selectedLineIndexes), [1]));
        assert.equal(textLineReader2.selectedLineIndex, 1);
        assert(!textLineReader2.isMultipleLines);
        assert(!textLineReader2.isCollapsed);

        assert(ObjectUtils.objectEquals(textLineReader2.getSelectedTextLine(),
            new TextLine(5, '6789\n')));

        let lineIterator = textLineReader2.readTextLine();
        assert(lineIterator !== undefined && lineIterator !== null);

        assert(ObjectUtils.objectEquals(lineIterator.nextTextLine(),
            new TextLine(5, '6789\n')));

        assert(ObjectUtils.objectEquals(lineIterator.nextTextLine(),
            new TextLine(10, 'abcde')));

        assert(lineIterator.nextTextLine() === null);
    });

    it('Test empty text', ()=>{
        let textLineReader1 = new TextLineReader('', new TextSelection(0));

        assert.equal(textLineReader1.lineTextSelections.length, 1);
        assert(ObjectUtils.objectEquals(textLineReader1.lineTextSelections[0],
            new TextSelection(0)));

        assert.equal(textLineReader1.lineCount, 1);
        assert(ObjectUtils.arrayEquals(Array.from(textLineReader1.selectedLineIndexes), [0]));
        assert.equal(textLineReader1.selectedLineIndex, 0);
        assert(!textLineReader1.isMultipleLines);
        assert(textLineReader1.isCollapsed);

        assert(ObjectUtils.objectEquals(
            textLineReader1.selectionInfo,
            new SelectionInfo(0,0,0,0,0,0)));

        assert(ObjectUtils.objectEquals(textLineReader1.getTextLine(0),
            new TextLine(0, '')));
        assert(ObjectUtils.arrayEquals(textLineReader1.getAllTextLines(), [
            new TextLine(0, '')
        ]));

        assert(ObjectUtils.objectEquals(textLineReader1.getSelectedTextLine(),
            new TextLine(0, '')));
        assert(ObjectUtils.arrayEquals(textLineReader1.getSelectedTextLines(), [
            new TextLine(0, '')
        ]));
    });
});