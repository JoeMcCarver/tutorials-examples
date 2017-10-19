console.log('Loading --> view controls');
var Views = $(function () {
	var viewSelection = $(".view-select");

	function changeView(evt, data) {
		var view = data.item.value;
		switch (view) {
			case 'all':
				MAP.centerAndZoom([-114.45, 43.75], 7);
				break;
			case 'boise':
				MAP.centerAndZoom([-116.2, 43.6], 12);
				break;
			case 'canyon':
				MAP.centerAndZoom([-116.7, 43.54], 11);
				break;
			case 'pocatello':
				MAP.centerAndZoom([-112.56, 42.9], 10);
				break;
			case 'payette':
				MAP.centerAndZoom([-116.89, 43.95], 10);
				break;
			case 'twin-falls':
				MAP.centerAndZoom([-114.45, 42.57], 11);
				break;
		}
	}

	viewSelection.selectmenu({
		change: changeView,
		select: changeView
	});
	
});
console.log('...view controls initialization complete.');
