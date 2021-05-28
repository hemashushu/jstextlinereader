/**
 * 被选中的文本的详细状态信息
 */
class SelectionInfo {

    /**
     * - startLineIndex 和 endLineIndex 表示被选中的行（所谓被选中的行，是指光标
     *   选择范围所涉及的行）。
     * - startPositionOfSelectedLines 和 endPositionOfSelectedLines 表示
     *   选中的行的文字开始及结束位置
     * - selectionStartRelativeToStartLine 和 selectionEndRelativeToEndLine 表示
     *   选中的行当中，选中的文字的相对开始和相对结束位置。
     *
     * @param {*} startLineIndex 开始行的行索引（索引包括）
     * @param {*} endLineIndex 结束行的行索引（索引包括）
     * @param {*} startPositionOfSelectedLines 选中行的字符起始位置（相对整篇文本），（索引包括）
     * @param {*} endPositionOfSelectedLines 选中行的字符结束位置（相对整篇文本），（索引不包括）
     * @param {*} selectionStartRelativeToStartLine 光标的起始位置相对开始行的偏移值（索引包括）
     * @param {*} selectionEndRelativeToEndLine 光标的结束位置相对结束行的偏移值（索引不包括）
     */
    constructor(
        startLineIndex,
        endLineIndex,
        startPositionOfSelectedLines,
        endPositionOfSelectedLines,
        selectionStartRelativeToStartLine,
        selectionEndRelativeToEndLine
        ) {

        this.startLineIndex = startLineIndex;
        this.endLineIndex = endLineIndex;
        this.startPositionOfSelectedLines = startPositionOfSelectedLines;
        this.endPositionOfSelectedLines = endPositionOfSelectedLines;
        this.selectionStartRelativeToStartLine = selectionStartRelativeToStartLine;
        this.selectionEndRelativeToEndLine = selectionEndRelativeToEndLine;
    }
}

module.exports = SelectionInfo;