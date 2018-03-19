import Expression from './expression';
import * as schema from '../../schema';
import Property from './property';
import { checkInstance, checkType } from './utils';

// Aggregation ops
export const Max = genAggregationOp('max', 'float');
export const Min = genAggregationOp('min', 'float');
export const Avg = genAggregationOp('avg', 'float');
export const Sum = genAggregationOp('sum', 'float');
export const Mode = genAggregationOp('mode', 'category');

function genAggregationOp(aggName, aggType) {
    return class AggregationOperation extends Expression {
        constructor(property) {
            checkInstance(aggName, 'property', 0, Property, property);
            super({ property: property });
            this._aggName = aggName;
            this.type = aggType;
        }
        get name() {
            return this.property.name;
        }
        get numCategories() {
            return this.property.numCategories;
        }
        //Override super methods, we don't want to let the property use the raw column, we must use the agg suffixed one
        _compile(metadata) {
            super._compile(metadata);
            checkType(aggName, 'property', 0, aggType, this.property);
        }
        _applyToShaderSource(uniformIDMaker, propertyTIDMaker) {
            return {
                preface: '',
                inline: `p${propertyTIDMaker(schema.column.aggColumn(this.property.name, aggName))}`
            };
        }
        eval(feature) {
            return feature[schema.column.aggColumn(this.property.name, aggName)];
        }
        _postShaderCompile() { }
        _getMinimumNeededSchema() {
            return {
                columns: [
                    schema.column.aggColumn(this.property.name, aggName)
                ]
            };
        }
    };
}
