import * as util from '../util';
import BaseWindshaft from './base-windshaft';
import CartoValidationError from '../error-handling/carto-validation-error';


export default class SQL extends BaseWindshaft {

    /**
     * A SQL defines the data that will be displayed in a layer.
     * 
     * Imagine you have a table named `european_cities` and you only want to download data from european cities with population > 100000
     * 
     * ```javascript
     * new carto.source.SQL(`SELECT * FROM european_cities WHERE country like 'europe' AND population > 10000`, {
     *   apiKey: 'YOUR_API_KEY_HERE',
     *   user: 'YOUR_USERNAME_HERE'
     * });
     * ````
     * 
     * This only downloads the data you need from the server reducing data usage. 
     * 
     * If you need all the data see {@link carto.source.Dataset|carto.source.Dataset}
     * 
     * Since tables in the server are protected you must provide valid credentials in order to get access to the data.
     * This can be done {@link carto.setDefaultAuth|setting the default auth} in the carto object or providing an `auth` 
     * object with your username and apiKey.
     * 
     * If your server is not hosted by CARTO you must add a third parameter that includes the serverURL.
     *
     * @param {string} query - A SQL query containing a SELECT statement
     * @param {object} auth
     * @param {string} auth.apiKey - API key used to authenticate against CARTO
     * @param {string} auth.user - Name of the user
     * @param {object} config
     * @param {string} [config.serverURL='https://{user}.carto.com'] - URL of the CARTO Maps API server
     *
     * @example
     * new carto.source.SQL('SELECT * FROM european_cities', {
     *   apiKey: 'YOUR_API_KEY_HERE',
     *   user: 'YOUR_USERNAME_HERE'
     * });
     *
     * @fires CartoError
     *
     * @constructor SQL
     * @extends carto.source.Base
     * @memberof carto.source
     * @api
     */
    constructor(query, auth, config) {
        super();
        this._checkQuery(query);
        this._query = query;
        this.initialize(auth, config);
    }

    _checkQuery(query) {
        if (util.isUndefined(query)) {
            throw new CartoValidationError('source', 'queryRequired');
        }
        if (!util.isString(query)) {
            throw new CartoValidationError('source', 'queryStringRequired');
        }
        if (query === '') {
            throw new CartoValidationError('source', 'nonValidQuery');
        }
        var sqlRegex = /(SELECT|select)\s+.*\s+(FROM|from)\s+.*/;
        if (!query.match(sqlRegex)) {
            throw new CartoValidationError('source', 'nonValidSQLQuery');
        }
    }
}
