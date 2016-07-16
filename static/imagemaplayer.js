ImageMapLayer = function(imageUrl, imageBounds, options){
	var me = this;
	this._overlay = L.imageOverlay(imageUrl, imageBounds, options);

	this.addTo = function(map){
		me._map = map;
		me._overlay.addTo(map);
	}

	this.getLayer = function(){
		return me._overlay;
	}

	this.moveHorizontally = function(meters){
		var bounds = me._overlay.getBounds();
		var tl = L.latLng(bounds.getNorth(), bounds.getWest());
		var tr = L.latLng(bounds.getNorth(), bounds.getEast());
		var distLatLng = Math.abs(bounds.getWest() - bounds.getEast());
		var distMeters = tl.distanceTo(tr);

		var diffLatLng = meters * distLatLng/distMeters;
		// console.log(meters + " * " + distLatLng + "/" + distMeters + " = " + diffLatLng);
		var southWest = L.latLng(bounds.getSouth(), bounds.getWest() + diffLatLng);
		var	northEast = L.latLng(bounds.getNorth(), bounds.getEast() + diffLatLng);
		// console.log(tr.distanceTo(northEast));
		var newbounds = L.latLngBounds(southWest, northEast);
		me._overlay.setBounds(newbounds);
	}

	this.moveVertically = function(meters){
		var bounds = me._overlay.getBounds();
		var tl = L.latLng(bounds.getNorth(), bounds.getWest());
		var bl = L.latLng(bounds.getSouth(), bounds.getWest());
		var distLatLng = Math.abs(bounds.getNorth() - bounds.getSouth());
		var distMeters = tl.distanceTo(bl);
		var diffLatLng = meters * distLatLng/distMeters;
		var southWest = L.latLng(bounds.getSouth() + diffLatLng, bounds.getWest());
		var	northEast = L.latLng(bounds.getNorth() + diffLatLng, bounds.getEast());
		var newbounds = L.latLngBounds(southWest, northEast);
		me._overlay.setBounds(newbounds);
	}

	var Line = function(a, b){
		this.a = a;
		this.b = b;
	}

	var changeDist = function(line, diff){
		var oneDiff = diff/2;
		if(line.a > line.b){
			line.a += oneDiff;
			line.b -= oneDiff;
		} else {
			line.a -= oneDiff;
			line.b += oneDiff;
		}
		return line;
	}

	this.zoom = function(scale){
		var bounds = me._overlay.getBounds();
		var distLat = Math.abs(bounds.getNorth() - bounds.getSouth());
		var distLng = Math.abs(bounds.getEast() - bounds.getWest());

		var newDistLat = distLat * scale;
		var newDistLng = distLng * scale;

		var changedLats = changeDist(new Line(bounds.getNorth(), bounds.getSouth()), newDistLat - distLat);
		var changedLngs = changeDist(new Line(bounds.getEast(), bounds.getWest()), newDistLng - distLng);
		var southWest = L.latLng(changedLats.b, changedLngs.b);
		var	northEast = L.latLng(changedLats.a, changedLngs.a);
		var newBounds = L.latLngBounds(southWest, northEast);
		me._overlay.setBounds(newBounds);
		// console.log("lats: [" + changedLats.a + ", " + changedLats.b + "] = " + Math.abs(changedLats.a - changedLats.b) + ", expected: " + newDistLat);
		// console.log("lngs: [" + changedLngs.a + ", " + changedLngs.b + "] = " + Math.abs(changedLngs.a - changedLngs.b) + ", expected: " + newDistLng);

	}

	this.drawBounds = function(){
		var bounds = me._overlay.getBounds();
		L.polygon([
				[bounds.getNorth(), bounds.getWest()],
				[bounds.getNorth(), bounds.getEast()],
				[bounds.getSouth(), bounds.getEast()],
				[bounds.getSouth(), bounds.getWest()]
			]).addTo(me._map).bindPopup("I am a polygon.");
	}

};