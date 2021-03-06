import Expression from './expression';
import { checkString } from './utils';

/**
 *
 * Evaluates the value of a column for every row in the dataset.
 *
 * For example think about a dataset containing 3 cities: Barcelona, Paris and London.
 * The `prop('name')` will return the name of the current city for every point in the dataset.
 *
 * @param {string} name - The property in the dataset that is going to be evaluated
 * @return {carto.style.expressions.property}
 *
 * @example <caption>Display only cities with name different from "London"</caption>
 * const s = carto.style.expressions;
 * const style = new carto.Style({
 *  filter: s.neq(s.prop('name'), 'london'),
 * });
 *
 * @memberof carto.style.expressions
 * @name prop
 * @function
 * @api
 */
export default class Property extends Expression {
    /**
     * @jsapi
     * @param {*} name Property/column name
     */
    constructor(name) {
        checkString('property', 'name', 0, name);
        if (name == '') {
            throw new Error('property(): invalid parameter, zero-length string');
        }
        super({});
        this.name = name;
    }
    _compile(meta) {
        const metaColumn = meta.columns.find(c => c.name == this.name);
        if (!metaColumn) {
            throw new Error(`Property '${this.name}' does not exist`);
        }
        this.type = metaColumn.type;
        if (this.type == 'category') {
            this.numCategories = metaColumn.categoryNames.length;
        }
        super._setGenericGLSL((childInlines, uniformIDMaker, getGLSLforProperty) => getGLSLforProperty(this.name));
    }
    _getMinimumNeededSchema() {
        return {
            columns: [
                this.name
            ]
        };
    }
    eval(feature) {
        return feature[this.name];
    }
}
