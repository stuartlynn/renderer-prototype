import Expression from './expression';
import { checkString } from './utils';

/**
 * @description Wrapper around category names
 * @param {string} categoryName
 * @returns {carto.style.expressions.Expression} category expression with the category name provided
 *
 * @memberof carto.style.expressions
 * @name category
 * @function
 * @api
 */
export default class Category extends Expression {
    constructor(categoryName) {
        checkString('category', 'categoryName', 0, categoryName);
        super({});
        this.expr = categoryName;
        this.type = 'category';
    }
    _compile(metadata) {
        this._metadata = metadata;
    }
    _applyToShaderSource(uniformIDMaker) {
        this._uniformID = uniformIDMaker();
        return {
            preface: `uniform float cat${this._uniformID};\n`,
            inline: `cat${this._uniformID}`
        };
    }
    _postShaderCompile(program, gl) {
        this._uniformLocation = gl.getUniformLocation(program, `cat${this._uniformID}`);
    }
    _preDraw(drawMetadata, gl) {
        const id = this._metadata.categoryIDs[this.expr];
        gl.uniform1f(this._uniformLocation, id);
    }
    eval() {
        return this._metadata.categoryIDs[this.expr];
    }
    isAnimated() {
        return false;
    }
}
