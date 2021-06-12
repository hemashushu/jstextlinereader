const { IllegalArgumentException, UnsupportedOperationException } = require('jsexception');
const { TextSelection } = require('jstextselection');

const SelectionInfo = require('./selectioninfo');
const TextLine = require('./textline');

/**
 *
 * 用于按行读取文本内容的模块
 *
 * ## TextLineReader 提供的属性:
 *
 * - lineTextSelections: [Selection, ...] // 每一行的起始和结束位置
 * - lineCount: int // 行数
 *
 * - selectedLineIndexes: [int, ...] // 被选中的行的索引，如果选择范围（textSelection）超出文本，则为空数组
 * - isMultipleLines: boolean // 是否选中了多行文本
 * - isCollapsed: boolean // 光标是否折叠了，即 textSelection 的 start 是否和 end 的值相等。
 * - selectionInfo: SelectionInfo // 文本被选中的情况，如果文本内容为空字符串，或者选择（textSelection）范围
 *   超出文本，则它的值为 undefined.
 *
 *   SelectionInfo 提供的属性：
 *   - startLineIndex: int // 开始行的行索引（索引包括）
 *   - endLineIndex: int // 结束行的行索引（索引包括）
 *   - startPositionOfSelectedLines: int // 选中行的字符起始位置（相对整篇文本），（索引包括）
 *   - endPositionOfSelectedLinesint: int // 选中行的字符结束位置（相对整篇文本），（索引不包括）
 *   - selectionStartRelativeToStartLine: int // 光标的起始位置相对开始行的偏移值（索引包括）
 *   - selectionEndRelativeToEndLine: int // 光标的结束位置相对结束行的偏移值（索引不包括）
 *
 *   各个属性的作用：
 *   - startLineIndex 和 endLineIndex 表示被选中的行（所谓被选中的行，是指光标
 *     选择范围所涉及的行）。
 *   - startPositionOfSelectedLines 和 endPositionOfSelectedLines 表示
 *     选中的行的文字开始及结束位置
 *   - selectionStartRelativeToStartLine 和 selectionEndRelativeToEndLine 表示
 *     选中的行当中，选中的文字的相对开始和相对结束位置。
 *
 * ## 实例的方法
 *
 * - getTextLine(idx)：获取 TextLine
 * - getAllTextLines()：获取全文 TextLine
 * - getSelectedTextLines()：获取选中的 TextLine
 * - getCurrentTextLine()：获取 TextLine
 * - readTextLine()：读取当前光标所在的 TextLine，并指向下一行
 *
 * ## 静态方法
 * getLineTextSelections(textContent): 获取每一行的范围（TextSelection）
 * getSelectionInfo(lineTextSelections, textSelection)：获取选中信息，即 SelectionInfo 对象
 * getTextLineByIndex(textContent, lineTextSelections, idx)：获取 TextLine
 * getTextLineByTextSelection(textContent, lineTextSelection)：获取 TextLine
 */
class TextLineReader {

    constructor(textContent, textSelection = new TextSelection(0)) {
        this.textContent = textContent;
        this.textSelection = textSelection;

        this.lineTextSelections = TextLineReader.getLineTextSelections(textContent);
        this.lineCount = this.lineTextSelections.length;

        this.selectionInfo = TextLineReader.getSelectionInfo(this.lineTextSelections, textSelection);
        this.selectedLineIndexes = [];

        if (this.selectionInfo !== undefined) {
            for (let idx = this.selectionInfo.startLineIndex;
                idx <= this.selectionInfo.endLineIndex;
                idx++) {
                this.selectedLineIndexes.push(idx);
            }
        }

        this.isMultipleLines = (this.selectedLineIndexes.length > 1);
        this.isCollapsed = TextSelection.isCollapsed(this.textSelection);
    }

    /**
     * 获取文本的每一行的起始和结束位置（即 TextSelection 对象）的数组
     *
     * 如果行末包含换行符（\n），则结束位置为换行符之后的位置。比如：
     *  0 1 2 3 ¶ 4 5 6  <-- text
     * 0 1 2 3 4 5 6 7 8 <-- position
     *
     * 则第一个 TextSelection 的值是 {0, 5} （5 为换行符后的位置）
     * 第二个 TextSelection 的值是 {5, 8}
     *
     * @param {*} textContent 返回 TextSelection 数组 [TextSelection, ...]
     *     如果文本内容为空字符串（''），则返回空数组。
     */
    static getLineTextSelections(textContent) {
        if (textContent === undefined ||
            textContent === null) {
            throw new IllegalArgumentException('The text content can not be undefined or null.');
        }

        if (textContent === '') {
            return [];
        }

        // getLineTextSelections 能够正确处理 Chromium/Electron 的 contenteditable 编辑框的
        // 一个 tail-new-line 显示 bug，即整篇文本最后的一个换行符不会显示出来，比如:
        //
        // '01↩34↩67↩' 只会显示为 3 行文本，跟 '01↩34↩67' 显示效果一模一样。
        //
        // 为了让最后的换行符有显示出来，往往需要在整篇文本的末尾再添加一个换行符，形成
        // '01↩34↩67↩↩'。
        //
        // 使用 getLineTextSelections 方法解析如上文本时，能得到如下结果：
        // [{0,3},{3,6},{6,9},{9,10}]
        //
        // 具体过程是：
        // '0 1 ↩ 3 4 ↩ 6 7 ↩ ↩'  <-- 文本，为了便于表示，在每个字符之间添加了一个空格，实际文本不存在空格
        // 0 1 2 3 4 5 6 7 8 9 0  <-- 光标/位置
        // |  0  |  1  |  2  |3|  <-- 解析结果，一个 TextSelection 数组，一共 4 项
        //
        // 如果末尾只有一个换行符：
        // '01↩34↩67↩'
        //
        // 则解析的结果如下：
        //
        // '0 1 ↩ 3 4 ↩ 6 7 ↩ '  <-- 文本
        // 0 1 2 3 4 5 6 7 8 9   <-- 光标/位置
        // |  0  |  1  |  2  |   <-- 解析结果，一个 TextSelection 数组，一共 3 项
        //
        // [{0,3},{3,6},{6,9}]
        //
        // 这也是符号我们的预期的。当解析的文本末尾没有换行符时：
        // '01↩34↩67'
        //
        // '0 1 ↩ 3 4 ↩ 6 7'  <-- 文本
        // 0 1 2 3 4 5 6 7 8  <-- 光标/位置
        // |  0  |  1  | 2 |  <-- 解析结果，一个 TextSelection 数组，一共 3 项
        //
        // [{0,3},{3,6},{6,8}]
        //
        // 同样也是符合预期。

        let lineTextSelections = [];
        let startPosition = 0;
        let endPosition;

        while ((endPosition = textContent.indexOf('\n', startPosition)) !== -1) {
            let lineTextSelection = new TextSelection(startPosition, endPosition + 1);
            lineTextSelections.push(lineTextSelection);
            startPosition = endPosition + 1;
        }

        // 最后一行
        if (startPosition < textContent.length) {
            let lineTextSelection = new TextSelection(startPosition, textContent.length);
            lineTextSelections.push(lineTextSelection);
        }

        return lineTextSelections;
    }

    /**
     * 获取被选中的文本的详细状态信息，即 SelectionInfo 对象。
     *
     * @param {*} lineTextSelections
     * @param {*} textSelection 返回 SelectionInfo。
     *     - 如果 lineTextSelections 为空数组，即原始文本内容为空
     *       字符串，则返回 undefined。
     *     - 如果 textSelection 超出文本（长度）范围，也同样会
     *       返回 undefined.
     */
    static getSelectionInfo(lineTextSelections, textSelection) {
        if (lineTextSelections.length === 0) {
            return;
        }

        let textContentLength = lineTextSelections[lineTextSelections.length - 1].end;

        // 开始行的行索引（索引包括）
        let startLineIndex;

        // 结束行的行索引（索引包括）
        let endLineIndex;

        // 光标的起始位置相对开始行的偏移值（索引包括）
        let selectionStartRelativeToStartLine;

        // 光标的结束位置相对结束行的偏移值（索引不包括）
        let selectionEndRelativeToEndLine;

        // 计算被选中的开始行的行索引

        for (let idx = 0; idx < lineTextSelections.length; idx++) {
            let lineTextSelection = lineTextSelections[idx];

            // 行末尾的换行符被视为行的一部分，比如有 2 个元素的 lineTextSelections：
            // [(0,4), (4,7)]
            //
            // [0]a[1]b[2]c[3]↩[4] << line 1
            // [4]x[5]y[6]z[7]     << line 2
            //
            // 如果 textSelection.start 为 3，则开始行应该是 line1
            // 如果 textSelection.start 为 4，则开始行应该是 line2

            if (textSelection.start >= lineTextSelection.start &&
                textSelection.start < lineTextSelection.end) { // 此处不能 <=，原因见上述
                startLineIndex = idx;
                selectionStartRelativeToStartLine = textSelection.start - lineTextSelection.start;
                break;
            }
        }

        if (startLineIndex === undefined) {
            // textSelection.start 有可能刚好坐落在整篇文本的末尾
            if (textSelection.start === textContentLength) {
                startLineIndex = lineTextSelections.length - 1;
                selectionStartRelativeToStartLine = textSelection.start -
                    lineTextSelections[startLineIndex].start;
            } else {

                // textSelection.start 超出了文本（长度）范围
                return;
            }
        }

        // 计算被选中的结束行的行索引

        for (let idx = startLineIndex; idx < lineTextSelections.length; idx++) {
            let lineTextSelection = lineTextSelections[idx];

            // 行末尾的换行符被视为行的一部分，比如有 2 个元素的 lineTextSelections：
            // [(0,4), (4,7)]
            //
            // [0]a[1]b[2]c[3]↩[4] << line 1
            // [4]x[5]y[6]z[7]     << line 2
            //
            // - 如果 textSelection.end 为 4（行长度），则结束行应该是 line1（所在行），但：
            // - 如果 textSelection.start 和 textSelection.end 同时为 4，
            //   （因为此时开始行的行索引为 line2），则结束行应该是 line2
            // - 如果 textSelection.end 为 5，则结束行应该是 line2

            if (textSelection.end >= lineTextSelection.start && // 此处要 >=，原因见上述
                textSelection.end <= lineTextSelection.end) {   // 此处要 <=，原因见上述
                endLineIndex = idx;
                selectionEndRelativeToEndLine = textSelection.end - lineTextSelection.start;
                break;
            }
        }

        if (endLineIndex === undefined) {
            // textSelection.end 超出了文本（长度）范围
            return;
        }

        let startPositionOfSelectedLines = lineTextSelections[startLineIndex].start;
        let endPositionOfSelectedLines = lineTextSelections[endLineIndex].end;

        return new SelectionInfo(
            startLineIndex,
            endLineIndex,
            startPositionOfSelectedLines,
            endPositionOfSelectedLines,
            selectionStartRelativeToStartLine,
            selectionEndRelativeToEndLine
        );
    }

    /**
     *
     * @param {*} textContent
     * @param {*} lineTextSelections
     * @param {*} idx
     * @returns 返回 TextLine
     */
    static getTextLineByIndex(textContent, lineTextSelections, idx) {
        let lineTextSelection = lineTextSelections[idx];
        return TextLineReader.getTextLineByTextSelection(textContent, lineTextSelection);
    }

    /**
     *
     * @param {*} textContent
     * @param {*} lineTextSelection
     * @returns 返回 TextLine
     */
    static getTextLineByTextSelection(textContent, lineTextSelection) {
        let text = textContent.substring(lineTextSelection.start, lineTextSelection.end);
        return new TextLine(lineTextSelection.start, text);
    }

    /**
     *
     * @param {*} idx
     * @returns 返回 TextLine
     */
    getTextLine(idx) {
        return TextLineReader.getTextLineByIndex(this.textContent, this.lineTextSelections, idx);
    }

    /**
     *
     * @returns 返回 [TextLine,...]
     */
    getAllTextLines() {
        let textLines = [];

        for (let idx = 0; idx < this.lineCount; idx++) {
            textLines.push(this.getTextLine(idx));
        }

        return textLines;
    }

    /**
     *
     * @returns 返回 [TextLine,...]
     */
    getSelectedTextLines() {
        let selectedTextLines = [];

        for (let idx of this.selectedLineIndexes) {
            selectedTextLines.push(this.getTextLine(idx));
        }

        return selectedTextLines;
    }

    /**
     * 获取当前选中行的信息
     *
     * - 只有所选文本的行数为单行时才允许这个操作。
     *
     * @returns 返回 TextLine, 如果到达了选中文本的最后一行，则返回 null。
     */
    getCurrentTextLine() {
        if (this.isMultipleLines) {
            throw new UnsupportedOperationException('The text selection contains multiple lines.');
        }

        if (this.selectedLineIndexes.length === 0) {
            // 文本内容为空，或者选择范围超出文本。
            return null;
        }

        let idx = this.selectedLineIndexes[0];
        if (idx === this.lineTextSelections.length) {
            // 到达了选中文本的最后一行
            return null;
        }

        return this.getTextLine(idx);
    }

    /**
     * 读取当前选中行的信息，并将选中的行的索引值递增。
     *
     * - 只有所选文本的行数为单行时才允许这个操作。
     * - 会改变所选中的行的索引值，即这个方法有副作用。
     *
     * @returns 返回 TextLine，如果已经到文本的末尾，则返回 null。
     */
    readTextLine() {
        if (this.isMultipleLines) {
            throw new UnsupportedOperationException('The text selection contains multiple lines.');
        }

        if (this.selectedLineIndexes.length === 0) {
            // 文本内容为空，或者选择范围超出文本。
            return null;
        }

        let idx = this.selectedLineIndexes[0];

        if (idx === this.lineTextSelections.length) {
            // 到达了选中文本的最后一行
            return null;
        }

        let textLine = this.getTextLine(idx);

        idx++;
        this.selectedLineIndexes[0] = idx;

        return textLine;
    }
}

module.exports = TextLineReader;
