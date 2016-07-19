ImageMapLayer = function(imageUrl, imageBounds, options){
	var me = this;
	this._overlay = L.imageOverlay(imageUrl, imageBounds, options);
	FixedPoint = function(fromNorth, fromEast, marker){
		this.fromNorth = fromNorth;
		this.fromEast = fromEast;
		this.marker = marker;

		this.onRemove = function(){
			if(marker){
				marker.remove();
			}
		}

		this.getFromNorth = function(){
			return fromNorth;
		}

		this.getFromSouth = function(){
			return 1 - fromNorth;
		}

		this.getFromEast = function(){
			return fromEast;
		}

		this.getFromWest = function(){
			return 1 - fromEast;
		}
	}
	DEFAULT_FIXED_POINT = new FixedPoint(0.5, 0.5);
	this._fixedPoint = DEFAULT_FIXED_POINT;

	this.addTo = function(map){
		me._map = map;
		me._overlay.addTo(map);
	}

	this.getLayer = function(){
		return me._overlay;
	}

	this.removeFixedPoint = function(){
		me._fixedPoint.onRemove();
		me._fixedPoint = DEFAULT_FIXED_POINT;
	}

	this.getBounds = function(){
		return me._overlay.getBounds();
	}

	this.addFixedPoint = function(latlng){
		me._fixedPoint.onRemove();
		var bounds = me._overlay.getBounds();
		var fromNorthCoords = bounds.getNorth() - latlng.lat;
		var fromEastCoords = bounds.getEast() - latlng.lng;

		var widthCoords = bounds.getEast() - bounds.getWest();
		var heightCoords = bounds.getNorth() - bounds.getSouth();

		var marker = L.marker(latlng).bindPopup("fixed point");
		marker.addTo(me._map);

		me._fixedPoint = new FixedPoint(fromNorthCoords/heightCoords, fromEastCoords/widthCoords, marker);
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


	var changeDist = function(coord, distRatio, distDiff){
		return coord + distRatio*distDiff;
	}

	this.zoom = function(scale){
		var bounds = me._overlay.getBounds();
		var distLat = Math.abs(bounds.getNorth() - bounds.getSouth());
		var distLng = Math.abs(bounds.getEast() - bounds.getWest());

		var newDistLat = distLat * scale;
		var newDistLng = distLng * scale;

		var diffDistLat = newDistLat - distLat;
		var diffDistLng = newDistLng - distLng;

		var newNorth = changeDist(bounds.getNorth(), me._fixedPoint.getFromNorth(), diffDistLat);
		var newSouth = changeDist(bounds.getSouth(), me._fixedPoint.getFromSouth(), -diffDistLat);

		var newEast = changeDist(bounds.getEast(), me._fixedPoint.getFromEast(), diffDistLng);
		var newWest = changeDist(bounds.getWest(), me._fixedPoint.getFromWest(), -diffDistLng);

		var southWest = L.latLng(newSouth, newWest);
		var	northEast = L.latLng(newNorth, newEast);
		var newBounds = L.latLngBounds(southWest, northEast);
		me._overlay.setBounds(newBounds);
	}

	this.containsPoint = function(latlng){
		var bounds = me._overlay.getBounds();
		return latlng.lat <= bounds.getNorth() 
			&& latlng.lat >= bounds.getSouth()
			&& latlng.lng <= bounds.getEast()
			&& latlng.lng >= bounds.getWest();
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