console.log('Loading --> map');
var socket = io();

var dojoConfig = {
    parseOnLoad: true
};

window.MAP;

$(function (Map) {
    require([
		"esri/map",
		"esri/layers/FeatureLayer",
		"esri/geometry/Point",
		"esri/layers/layer",
		"esri/geometry/Polygon",
		"esri/renderers/SimpleRenderer",
		"esri/renderers/SymbolAger",
		"esri/geometry/webMercatorUtils",
		"esri/geometry/scaleUtils",
		"esri/symbols/SimpleMarkerSymbol",
		"esri/symbols/SimpleLineSymbol",
        "esri/graphic",
        "esri/Color",
		"dojo/domReady!"
	], function (Map,
        FeatureLayer,
        Point,
        Layer,
        Polygon,
        SimpleRenderer,
        SymbolAger,
        webMercatorUtils,
        scaleUtils,
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        Graphic,
        Color
    ) {
        // layers
        var query,
            cities,
            tLines,
            pMeters,
            sMeters,
            pOHLine,
            regionBoundaries,
            feederBoundaries,
            featureLayer,
            counties;
        var layerList,
            togg;
        var layers = $('.layer'),
            reload = $('#reload'),
            layerListDiv = $('#layerSelectTitle');
        var layerInfos = [],
            dataPoints = [];
        // code to create the map and add a basemap
        MAP = new Map("map", {
            // other basemaps: satellite, hybrid, topo, gray, oceans, osm, national-geographic
            basemap: "topo",
            center: [-114.027, 43.809],
            zoom: 7
        });

        function showCoordinates(evt) {
            //  display coordinates in geographic (lat, long)
            var mapPoint = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
            $('#map-info h3').text(`Lat: ${mapPoint.y.toFixed(3)}, Long: ${mapPoint.x.toFixed(3)}, Zoom: ${MAP.getZoom()}`);
        }

        function showMapCenterPoint() {
            var mapPoint = webMercatorUtils.webMercatorToGeographic(MAP.extent.getCenter());
            $('#map-info h3').text(`Lat: ${mapPoint.y.toFixed(3)}, Long: ${mapPoint.x.toFixed(3)}, Scale: ${scaleUtils.getScale(MAP).toFixed(3)}`);
        }

        /* after map loads, connect to listen to mouse move & drag events
         * display mouse corresponding geographic coordinates when mouse is over the map
         * otherwise center coordinates of the map are shown by default
         */
        MAP.on('load', function () {
            MAP.on('mouse-move', showCoordinates);
            MAP.on('mouse-drag', showCoordinates);
            MAP.on('mouse-out', showMapCenterPoint);
        });


        function defaultLayers() {
            console.log('Creating default layers... ');
            query = new FeatureLayer('https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/1', {
                "id": 'query',
                visible: false
            });
            cities = new FeatureLayer('http://freedomdev:6080/arcgis/rest/services/BaseServices/CityBoundary/MapServer/1', {
                "id": 'cities',
                visible: false
            });
            counties = new FeatureLayer('http://freedomdev:6080/arcgis/rest/services/BaseServices/County/MapServer/0', {
                "id": 'counties',
                visible: false
            });
            tLines = new FeatureLayer('http://freedomdev:6080/arcgis/rest/services/Delivery/TransmissionVoltage/MapServer/0', {
                "id": 'tLines',
                visible: true,
                minScale: 580000
            });
            regionBoundaries = new FeatureLayer('http://freedomdev:6080/arcgis/rest/services/Delivery/Regions/MapServer/0', {
                "id": 'regionBoundaries',
                visible: false
            });
            feederBoundaries = new FeatureLayer('http://freedomdev:6080/arcgis/rest/services/Delivery/TransAndDist/MapServer/18', {
                "id": 'feederBoundaries',
                visible: false
            });
            pMeters = new FeatureLayer('http://freedomdev:6080/arcgis/rest/services/Delivery/TransAndDist/MapServer/21', {
                "id": 'pMeters',
                visible: false,
                minScale: 150000
            });
            sMeters = new FeatureLayer('http://freedomdev:6080/arcgis/rest/services/Delivery/TransAndDist/MapServer/37', {
                "id": 'sMeters',
                visible: false,
                minScale: 9000
            });
            pOHLine = new FeatureLayer('http://freedomdev:6080/arcgis/rest/services/Delivery/TransAndDist/MapServer/60', {
                "id": 'pOHLine',
                visible: true,
                minScale: 18100,
                maxScale: 1
            });
            MAP.addLayers([query, cities, counties, tLines, pMeters, sMeters, pOHLine, regionBoundaries, feederBoundaries]);
            //			MAP.addLayer(query);
        }

        defaultLayers();

        function createLayerButton(layerID, layerName, idx) {
            var newLayer = $('<div></div>'),
                newLayerHeader = $('<div></div>'),
                newLayerContent = $('<div></div>');
            newLayer.addClass('layer')
                .attr('name', layerName)
                .attr('data-layer-idx', idx)
                .addClass("ui-widget ui-widget-content ui-helper-clearfix ui-corner-all");
            newLayerHeader.addClass('layer-header')
                .append(document.createTextNode(layerName))
                .addClass("ui-widget-header ui-corner-all")
                .prepend("<span class='layer-toggle ui-icon'></span>");
            newLayerHeader.attr('data-layer-id', layerID);
            newLayerContent.addClass('layer-content');
            newLayer.append(newLayerHeader)
                .append(newLayerContent);
            newLayer.insertBefore('#reload');
            var mapLayer = MAP.getLayer(layerID);
            var layerVisible = mapLayer.visible;
            var layerTogg = newLayerHeader.find('.layer-toggle');
            if (layerVisible) {
                newLayer.css('background', 'lightgreen');
                newLayer.addClass('layer-state-on');
                newLayerHeader.addClass('layer-state-on');
                newLayerHeader.css('background', '#19728a');
                layerTogg.addClass('layer-state-on').addClass('ui-icon-check');
                layerTogg.css('background-position', '-64px -144px');
                layerTogg.css("background-image", "url('theme/images/ui-icons_08a500_256x240.png')");
            } else {
                newLayer.css('background', 'lightslategray');
                newLayer.addClass('layer-state-off');
                newLayerHeader.addClass('layer-state-off');
                newLayerHeader.css('background', '#517f8c');
                layerTogg.addClass('layer-state-off').addClass('ui-icon-closethick');
                layerTogg.css('background-position', '-96px -128px');
                layerTogg.css("background-image", "url('theme/images/ui-icons_a52b2b_256x240.png')");
            }
        }

        function toggleLayer(evt, ui) {
            console.log('Toggling...');
            var elem = $(evt.target);
            var layer = elem.closest('.layer');
            var layerHeader = elem.closest('.layer-header');
            var layerID = layerHeader.data('layer-id');
            console.log('Layer ID: ' + layerID);
            var mapLayer = MAP.getLayer(layerID);
            if (mapLayer.visible) {
                layer.toggleClass('layer-state-on layer-state-off');
                layer.css('background', 'lightslategray');
                layerHeader.css('background', '#517f8c');
                elem.toggleClass('layer-state-on layer-state-off');
                elem.css("background-image", "url('theme/images/ui-icons_a52b2b_256x240.png')");
                elem.toggleClass('ui-icon-check ui-icon-closethick');
                elem.css('background-position', '-96px -128px');
                mapLayer.hide();
            } else {
                layer.toggleClass('layer-state-off layer-state-on');
                layer.css('background', 'lightgreen');
                layerHeader.css('background', '#19728a');
                elem.toggleClass('layer-state-off layer-state-on');
                elem.css("background-image", "url('theme/images/ui-icons_08a500_256x240.png')");
                elem.toggleClass('ui-icon-closethick ui-icon-check');
                elem.css('background-position', '-64px -144px');
                mapLayer.show();
            }
        }

        function enableLayerFeatures() {
            togg = $(".layer-toggle");
            togg.click(toggleLayer);
            layerList = $('#layerList');
            layerList.sortable({
                connectWith: "#layerList",
                handle: ".layer-header",
                cancel: ".layer-toggle",
                placeholder: "ui-state-highlight"
            });
            console.log('Map --> load success!');
        }

        function initialLayers() {
            createLayerButton('query', 'Query Layer', 2);
            createLayerButton('cities', 'Cities', 3);
            createLayerButton('counties', 'Counties', 4);
            createLayerButton('tLines', 'T-Lines', 5);
            createLayerButton('pMeters', 'Primary Meters', 3);
            createLayerButton('sMeters', 'Secondary Meters', 4);
            createLayerButton('pOHLine', 'Primary OH-Lines', 5);
            createLayerButton('regionBoundaries', 'Region Boundaries', 6);
            createLayerButton('feederBoundaries', 'Feeder Boundaries', 7);
            MAP.on('load', enableLayerFeatures);
        }

        initialLayers();

        function layerData() {
            console.log('Layer Data --> loading');
            var i = 0;
            layers.each(function () {
                var layerName,
                    layerID,
                    layerIDX,
                    layerState;
                var elem = $(this);
                layerName = elem.attr('name');
                layerID = elem.data('layer-id');
                layerIDX = elem.data('layer-idx');
                layerState = (elem.hasClass('layer-state-on')) ? 'on' : 'off';
                layerInfos[i] = {
                    name: layerName,
                    id: layerID,
                    idx: layerIDX,
                    state: layerState
                };
                i++;
            });
        }

        function listLayers() {
            var i;
            //			console.log('Listing Layers --> ');
            for (i = 0; i < layerInfos.length; i++) {
                //				console.log('Layer --> ' + i);
                //				console.log(layerInfos[i]);
            }
        }

        function renderVisible() {
            //			map.removeLayer(usaLayer);
        }

        function reorderLayers() {
            //			console.log('Reload --> CLICKED');
            var i = 0;
            // remove all contents from the array
            layerInfos = [];
            /* 
             * pretty much same as layerData - 
             * overwriting previous array with current layer order
             * updating visibility state
             * updating div data[layer-idx] to reflect new index
             * 
             */
            layerList.children().each(function () {
                var layerName,
                    layerID,
                    layerIDX,
                    layerState;
                var elem = $(this);

                if (elem.hasClass('layer')) {
                    layerName = elem.attr('name');
                    layerID = elem.data('layer-id');
                    layerIDX = i;
                    elem.data('layer-idx', i);
                    layerState = (elem.hasClass('layer-state-on')) ? 'on' : 'off';
                    layerInfos[i] = {
                        name: layerName,
                        id: layerID,
                        idx: layerIDX,
                        state: layerState
                    };
                    i++;
                }
            });
            //		listLayers();
            renderVisible();
        }

        /* 
         * add query points to the map
         * 
         */

        var dataPoints = [];

        function newMarker(lat, long) {
            var line = new SimpleLineSymbol();
            line.setWidth(1);
            var marker = new SimpleMarkerSymbol();
            marker.setColor(new Color([168, 0, 0, 0.87]));
            marker.setOutline(line);
            marker.setSize(6);
            var point = new Point(lat, long);
            console.log(`MAP --> Creating Point @ lat: ${lat}, long: ${long}`);
            return new Graphic(point, marker);
        }

        socket.on('newpoint', function (point) {
            let lat = point.lat,
                long = point.long,
                reads = point.reads;
            dataPoints.push(newMarker(lat, long));
        });

        socket.on('points-done', () => {
            MAP.disableMapNavigation();
            console.log(`MAP --> Adding ${dataPoints.length} Points`);
            dataPoints.forEach((point) => {
                MAP.graphics.add(point);
            });
            MAP.enableMapNavigation();
            dataPoints = [];
        });

        /*--------------------------------*/
        /* ^^ map code above this line ^^ */
    });
});

console.log('...map initialization complete.');
