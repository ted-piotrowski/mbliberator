var tilelivestream = require('tilelivestreams');
var fs = require('fs');
var mbtiles = require('@mapbox/mbtiles');
var mkdirp = require('mkdirp');
var through = require('through2');

var numCompleted = 0;
module.exports = function(inTile, outPath, callback) {
  if (outPath.slice(-1) !== '/') {
    outPath = outPath + '/';
  }
  var infoName = "info.json";
  new mbtiles(inTile, function(err, tiles) {
      if (err) {
      return callback(err);
      }
      var tileStream = tilelivestream(tiles);
      mkdirp(outPath, function (err) {
	  if (err) {
	  return callback(err);
	  }
	  var writing = tileStream.pipe(through.obj(function (data, _, cb) {
		var path, outData;
		if (data.tile) {
		path = outPath + data.z + '/' + data.x + '/';
		mkdirp(path, function (err) {
		    if (err) {
		    return cb(err);
		    }
		    var fullpath, outdata, options = {};
		    if (data.tile) {
		    fullpath = path + data.y + '.pbf';
		    outdata = data.tile;
		    }		    
		    fs.writeFile(fullpath, outdata, options, cb);
		    numCompleted++;
		    numCompleted % 1000 === 0 && console.log(numCompleted);
		    });
		} else if (data.name) {
		fs.writeFile(outPath + infoName, JSON.stringify(data), {encoding: 'utf8'}, cb);
		}
		}));
	  writing.on('error', callback);
	  writing.on('end', function() {
	      callback();
	      });
      });
  });
};
