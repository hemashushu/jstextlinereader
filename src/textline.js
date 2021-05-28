/**
 * 一行文本
 */
class TextLine {
    /**
     *
     * @param {*} offset 0 或正整数，行首相对整篇文本的开始位置
     *     也就是当前行第 1 个字符在整篇文本当中的偏移值
     *
     * @param {*} fullText 行文本的全部内容，如果当前行
     *     末尾有换行符的话，则包含换行符。
     */
	constructor(offset, fullText) {
		this.offset = offset;
		this.fullText = fullText;
    }

    /**
     * 获取当期行的正文，即不包括末尾的换行符
     */
    get textContent() {
        if (this.isContainsNewLineSymbol === true) {
            return this.fullText.substring(0, this.fullText.length - 1);
        }else {
            return this.fullText;
        }
    }

    /**
     * 判断当前行是否包含末尾的换行符
     */
    get isContainsNewLineSymbol() {
        return this.fullText.endsWith('\n');
    }
}

module.exports = TextLine;