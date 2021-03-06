// ******************************************************************
// § 5.3. Validation keywords for arrays
// ******************************************************************

var testRunner = require('../index.js')
  ;

module.exports = function(config) {
  var errors = [];
  var index, subTestConfig;

  if (Array.isArray(config.schema.items)) {
    // array of schemas for each item in the array
    var count = Math.min(config.inst.length, config.schema.items.length);
    for (index = 0; index < count; ++index) {
      var item = config.inst[index];
      var itemSchema = config.schema.items[index];

      subTestConfig = config.clone();
      subTestConfig.inst = item;
      subTestConfig.schema = itemSchema;
      subTestConfig.resolutionScope =
        config.resolutionScope + '/items/' + index;
      subTestConfig.instanceContext = config.instanceContext + '/' + index;

      errors = errors.concat(testRunner(subTestConfig));
    }

    // validate additional items in the array
    if (config.inst.length > config.schema.items.length &&
        Object.prototype.hasOwnProperty.call(config.schema, 'additionalItems'))
    {
      // If additionalItems is boolean, validation for the
      // additionalItems keyword (above) is all we need. Otherwise,
      // validate each remaining item.
      if (typeof config.schema.additionalItems !== 'boolean') {
        for (index = config.schema.items.length;
             index < config.inst.length;
             ++index)
        {
          subTestConfig = config.clone();
          subTestConfig.inst = config.inst[index];
          subTestConfig.schema = config.schema.additionalItems;
          subTestConfig.resolutionScope =
            config.resolutionScope + '/items/' + index;
          subTestConfig.instanceContext = config.instanceContext + '/' + index;

          errors = errors.concat(testRunner(subTestConfig));
        }
      }
    }

  } else {
    // one schema for all items in the array
    for (index = 0; index < config.inst.length; ++index) {
      subTestConfig = config.clone();
      subTestConfig.inst = config.inst[index];
      subTestConfig.schema = config.schema.items;
      subTestConfig.resolutionScope = config.resolutionScope + '/items';
      subTestConfig.instanceContext = config.instanceContext + '/' + index;

      errors = errors.concat(testRunner(subTestConfig));
    }
  }

  return errors;
};
