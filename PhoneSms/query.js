var rp = require('request-promise'),
    moment = require('moment-timezone'),
    Q = require('q'),
    cheerio = require('cheerio'),
    _ = require('lodash');

module.exports = {
  alert: function() {
    return rp('http://104.236.218.72/node.json?type=alert').then(JSON.parse).then(function(json) {
      var items = [];
      var records = _.filter(json.list, function(record) {
        var now = moment.tz('America/New_York');
        return now.isBefore(moment.unix(record.field_expire_date));
      });
      _.each(records, function(record) {
        items.push(record.title);
        items.push(record.body.value);
      });

      if (items.length == 0)
        return "There are no alerts at this time.";

      return items.join('. ');
    });
  },
  inventory: function() {
    return rp('http://104.236.218.72/node.json?type=supplies').then(JSON.parse).then(function(json) {
      var items = [];
      var records = _.filter(json.list, function(record) {
        return +record.field_inventory > 0;
      });
      _.each(records, function(record) {
        items.push(record.title);
      });

      if(items.length == 0) {
        return "There are no items available at this time."
      }
      else {
        var itemExpr = (items.length == 1) ? 'item is' : 'items are';
        return 'The following ' + itemExpr + ' available in our food pantry. ' + items.join(', ');
      }
    });
  },
  events: function() {
    return rp('http://104.236.218.72/events').then(function(body) {
      var $ = cheerio.load(body);
      var message = $('.view-content').html();
      return 'The upcoming events are: ' + message;
    });
  },
  bed: function() {
    return Q('Please call 413-834-7410.');
  }
};