const map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [-20, 33],
    zoom: 2
});

carto.setDefaultAuth({
    user: 'cartogl',
    apiKey: 'YOUR_API_KEY'
});

const source = new carto.source.SQL('SELECT ST_Multi(the_geom_webmercator) as the_geom_webmercator, ST_Multi(the_geom) as the_geom FROM polygons_0');
const s = carto.style.expressions;
const style = new carto.Style({
    width: s.float(100),
    color: s.rgba(0, 127, 127, .9)
});
const layer = new carto.Layer('myCartoLayer', source, style);

layer.addTo(map);
