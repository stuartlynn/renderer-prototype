import { implicitCast } from './utils';
import { blend, animate } from '../functions';
import * as schema from '../../schema';

/**
 * Abstract expression class
 *
 * All expressions listed in  {@link carto.style.expressions} inherit from this class so any of them
 * they can be used where an Expression is required as long as the types match.
 *
 * This means that you can't a numeric expression where a color expression is expected.
 *
 * @memberof carto.style.expressions
 * @name Expression
 * @api
 */
export default class Expression {
    /**
     * @hideconstructor
     * @param {*} children
     * @param {*} inlineMaker
     * @param {*} preface
     */
    constructor(children) {
        this.childrenNames = Object.keys(children);
        Object.keys(children).map(name => this[name] = implicitCast(children[name]));
        this._getChildren().map(child => child.parent = this);
        this._metaBindings = [];
        this.preface = '';
    }

    _bind(metadata) {
        this._metaBindings.push(metadata);
        this._compile(metadata);
        return this;
    }

    _compile(metadata) {
        this._getChildren().map(child => child._compile(metadata));
    }

    _setGenericGLSL(inlineMaker, preface) {
        this.inlineMaker = inlineMaker;
        this.preface = (preface ? preface : '');
    }

    /**
     * Generate GLSL code
     * @param {*} uniformIDMaker    fn to get unique IDs
     * @param {*} getGLSLforProperty  fn to get property IDs and inform of used properties
     */
    _applyToShaderSource(uniformIDMaker, getGLSLforProperty) {
        const childSources = this.childrenNames.map(name => this[name]._applyToShaderSource(uniformIDMaker, getGLSLforProperty));
        let childInlines = {};
        childSources.map((source, index) => childInlines[this.childrenNames[index]] = source.inline);
        return {
            preface: childSources.map(s => s.preface).reduce((a, b) => a + b, '') + this.preface,
            inline: this.inlineMaker(childInlines, uniformIDMaker, getGLSLforProperty)
        };
    }

    /**
     * Inform about a successful shader compilation. One-time post-compilation WebGL calls should be done here.
     * @param {*} program
     */
    _postShaderCompile(program, gl) {
        this.childrenNames.forEach(name => this[name]._postShaderCompile(program, gl));
    }

    _getDrawMetadataRequirements() {
        // Depth First Search => reduce using union
        return this._getChildren().map(child => child._getDrawMetadataRequirements()).reduce(schema.union, schema.IDENTITY);
    }

    /**
     * Pre-rendering routine. Should establish the current timestamp in seconds since an arbitrary point in time as needed.
     * @param {number} timestamp
     */
    _setTimestamp(timestamp) {
        this.childrenNames.forEach(name => this[name]._setTimestamp(timestamp));
    }

    /**
     * Pre-rendering routine. Should establish related WebGL state as needed.
     * @param {*} l
     */
    _preDraw(...args) {
        this.childrenNames.forEach(name => this[name]._preDraw(...args));
    }

    /**
     * @jsapi
     * @returns true if the evaluation of the function at styling time won't be the same every time.
     */
    isAnimated() {
        return this._getChildren().some(child => child.isAnimated());
    }

    /**
     * Replace child *toReplace* by *replacer*
     * @param {*} toReplace
     * @param {*} replacer
     */
    replaceChild(toReplace, replacer) {
        const name = this.childrenNames.find(name => this[name] == toReplace);
        this[name] = replacer;
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    }

    notify() {
        this.parent.notify();
    }

    /**
     * Linear interpolation between this and finalValue with the specified duration
     * @jsapi
     * @param {Expression} final
     * @param {Expression} duration
     * @param {Expression} blendFunc
     */
    //TODO blendFunc = 'linear'
    blendTo(final, duration = 500) {
        final = implicitCast(final);
        const parent = this.parent;
        const blender = blend(this, final, animate(duration));
        this._metaBindings.map(m => blender._bind(m));
        parent.replaceChild(this, blender);
        blender.notify();
        return final;
    }

    blendFrom(final, duration = 500, interpolator = null) {
        final = implicitCast(final);
        const parent = this.parent;
        const blender = blend(final, this, animate(duration), interpolator);
        this._metaBindings.map(m => blender._bind(m));
        parent.replaceChild(this, blender);
        blender.notify();
    }

    /**
     * @returns a list with the expression children
     */
    _getChildren() {
        return this.childrenNames.map(name => this[name]);
    }

    _getMinimumNeededSchema() {
        // Depth First Search => reduce using union
        return this._getChildren().map(child => child._getMinimumNeededSchema()).reduce(schema.union, schema.IDENTITY);
    }
    // eslint-disable-next-line no-unused-vars
    eval(feature) {
        throw new Error('Unimplemented');
    }
}
