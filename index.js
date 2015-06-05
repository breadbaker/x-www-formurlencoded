'use strict';

var _ = require('lodash');

var parseFormData = function (str) {
  var pieces = str.split(/------WebKitFormBoundary.*/);

  // remove empties
  pieces = _.compact(pieces);

  var parts;
  var name;
  var value;

  var fields = {};

  _.each(pieces, function (item) {
      if (item.indexOf('Content-Disposition: form-data;') !== -1) {

        parts = item.split(/\n/)
        //["", "Content-Disposition: form-data; name="(name)"", "", "(value)", ""]
        name = parts[1].split(/\"/)[1];
        parts.pop();
        value = parts.pop();

        fields[name] = value
      }
  });

  return fields;
}

module.exports = function (req, res, next) {

  if (req.headers['content-type'] !== 'application/x-www-form-urlencoded') {
    next();
    return;
  }

  var body = '';

  req.on('data', function (data) {
    body += data;

    // Too much POST data, kill the connection!
    if (body.length > 1e6)
      req.connection.destroy();
  });

  req.on('end', function () {
      var fields = parseFormData(body);
      req.body = req.body ? _.extend(req.body, fields) : fields;
      next();
  });
}