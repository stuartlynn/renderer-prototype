import Expression from './expression';
import { checkNumber } from './utils';


/**
 *
 * Wraps a number.
 *
 * @param {number} x - A number to be warped in a numeric expression
 * @return {carto.style.expressions.Expression} numeric expression
 *
 * @example <caption>Creating a number expression.</caption>
 * const s = carto.style.expressions;
 * const style = new carto.Style({
 *  width: s.number(15);  // Elements will have width 15
 * });
 *
 * @memberof carto.style.expressions
 * @name number
 * @function
 * @api
 */
export default class Float extends Expression {
    /**
     * @jsapi
     * @param {*} x
     */
    constructor(x) {
        checkNumber('float', 'x', 0, x);
        super({});
        this.expr = x;
        this.type = 'float';
    }

    _applyToShaderSource(uniformIDMaker) {
        this._uniformID = uniformIDMaker();
        return {
            preface: `uniform float float${this._uniformID};\n`,
            inline: `float${this._uniformID}`
        };
    }

    _postShaderCompile(program, gl) {
        this._uniformLocation = gl.getUniformLocation(program, `float${this._uniformID}`);
    }

    _preDraw(drawMetadata, gl) {
        gl.uniform1f(this._uniformLocation, this.expr);
    }

    isAnimated() {
        return false;
    }

    eval() {
        return this.expr;
    }
}
