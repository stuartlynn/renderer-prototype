import Expression from './expression';
import { float } from '../functions';
import { checkNumber, checkInstance, checkType } from './utils';
import Property from './property';

let quantilesUID = 0;

function genQuantiles(global) {
    return class Quantiles extends Expression {
        constructor(input, buckets) {
            checkInstance('quantiles', 'input', 0, Property, input);
            checkNumber('quantiles', 'buckets', 1, buckets);

            let children = {
                input
            };
            let breakpoints = [];
            for (let i = 0; i < buckets - 1; i++) {
                children[`arg${i}`] = float(i * 10);
                breakpoints.push(children[`arg${i}`]);
            }
            super(children);
            this.quantilesUID = quantilesUID++;
            this.numCategories = buckets;
            this.buckets = buckets;
            this.breakpoints = breakpoints;
            this.type = 'category';
        }
        _compile(metadata) {
            super._compile(metadata);
            checkType('quantiles', 'input', 0, 'float', this.input);
            if (global) {
                const copy = metadata.sample.map(s => s[this.input.name]);
                copy.sort((x, y) => x - y);
                this.breakpoints.map((breakpoint, index) => {
                    const p = (index + 1) / this.buckets;
                    breakpoint.expr = copy[Math.floor(p * copy.length)];
                });
            }
        }
        _getDrawMetadataRequirements() {
            return { columns: [this.input.name] };
        }
        _applyToShaderSource(uniformIDMaker, getGLSLforProperty) {
            const childSources = this.childrenNames.map(name => this[name]._applyToShaderSource(uniformIDMaker, getGLSLforProperty));
            let childInlines = {};
            childSources.map((source, index) => childInlines[this.childrenNames[index]] = source.inline);
            const funcName = `quantiles${this.quantilesUID}`;
            const elif = (_, index) =>
                `${index > 0 ? 'else' : ''} if (x<(${childInlines[`arg${index}`]})){
            return ${index.toFixed(2)};
        }`;
            const funcBody = this.breakpoints.map(elif).join('');
            const preface = `float ${funcName}(float x){
        ${funcBody}
        return ${this.breakpoints.length.toFixed(1)};
    }`;
            return {
                preface: childSources.map(s => s.preface).reduce((a, b) => a + b, '') + preface,
                inline: `${funcName}(${childInlines.input})`
            };
        }
        eval(feature) {
            const input = this.input.eval(feature);
            const q = this.breakpoints.findIndex(br => input <= br);
            return q;
        }
        _preDraw(drawMetadata, gl) {
            const column = drawMetadata.columns.find(c => c.name == this.input.name);
            let i = 0;
            const total = column.accumHistogram[column.histogramBuckets - 1];
            const r = Math.random();
            let brs = [];

            // TODO OPT: this could be faster with binary search
            if (!global) {
                this.breakpoints.map((breakpoint, index) => {
                    for (i; i < column.histogramBuckets; i++) {
                        if (column.accumHistogram[i] >= (index + 1) / this.buckets * total) {
                            break;
                        }
                    }
                    const percentileValue = i / column.histogramBuckets * (column.max - column.min) + column.min;
                    brs.push(percentileValue);
                    breakpoint.expr = percentileValue;
                });
            }
            if (r > 0.99) {
                console.log(this.breakpoints.map(br => br.expr));
            }
            super._preDraw(drawMetadata, gl);
        }
        getBreakpointList() {
            return this.breakpoints.map(br => br.expr);
        }
    };
}

export const Quantiles = genQuantiles(false);
export const GlobalQuantiles = genQuantiles(true);
