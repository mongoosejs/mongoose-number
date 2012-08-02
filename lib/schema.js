// schema number

module.exports = exports = function (mongoose) {
  var Schema = mongoose.Schema
    , SchemaType = mongoose.SchemaType
    , Types = mongoose.Types

  /**
   * MongooseNumber constructor
   *
   * @inherits SchemaType
   * @param {String} key
   * @param {Object} [options]
   */

  function MongooseNumber (key, options) {
    SchemaType.call(this, key, options, 'Number');
  }

  /*!
   * inherits
   */

  MongooseNumber.prototype.__proto__ = SchemaType.prototype;

  /**
   * Implement checkRequired method.
   *
   * @param {any} value
   * @return {Boolean}
   */

  MongooseNumber.prototype.checkRequired = function checkRequired (value) {
    if (SchemaType._isRef(this, value, true)) {
      return null != value;
    } else {
      return typeof value == 'number' || value instanceof Number;
    }
  }

  /**
   * Sets a maximum number validator.
   *
   * @param {Number} value minimum number
   * @return {MongooseNumber} this
   */

  MongooseNumber.prototype.min = function (value) {
    if (this.minValidator)
      this.validators = this.validators.filter(function(v){
        return v[1] != 'min';
      });
    if (value != null)
      this.validators.push([function(v){
        return v === null || v >= value;
      }, 'min']);
    return this;
  };

  /**
   * Sets a maximum number validator
   *
   * @param {Number} value maximum number
   * @return {MongooseNumber} this
   */

  MongooseNumber.prototype.max = function (value) {
    if (this.maxValidator)
      this.validators = this.validators.filter(function(v){
        return v[1] != 'max';
      });
    if (value != null)
      this.validators.push([this.maxValidator = function(v){
        return v === null || v <= value;
      }, 'max']);
    return this;
  };

  /**
   * Casts to number
   *
   * @param {Object} value the value to cast
   * @param {Document} doc document that triggers the casting
   * @param {Boolean} [init]
   */

  MongooseNumber.prototype.cast = function (value, doc, init) {
    if (SchemaType._isRef(this, value, init)) return value;

    if (Array.isArray(value)) {
      // do nothing
    } else if (!isNaN(value)) {
      if (null === value) return value;
      if ('' === value) return null;
      if ('string' === typeof value) value = Number(value);
      if (value instanceof Number || typeof value == 'number' ||
         (value.toString && value.toString() == Number(value)))
        return new Types.MongooseNumber(value, this.path, doc);
    }

    throw new SchemaType.CastError('MongooseNumber', value);
  };

  /*!
   * ignore
   */

  function handleSingle (val) {
    return this.cast(val).valueOf();
  }

  function handleArray (val) {
    var self = this;
    return val.map( function (m) {
      return self.cast(m).valueOf();
    });
  }

  MongooseNumber.prototype.$conditionalHandlers = {
      '$lt' : handleSingle
    , '$lte': handleSingle
    , '$gt' : handleSingle
    , '$gte': handleSingle
    , '$ne' : handleSingle
    , '$in' : handleArray
    , '$nin': handleArray
    , '$mod': handleArray
    , '$all': handleArray
  }

  MongooseNumber.prototype.castForQuery = function ($conditional, val) {
    var handler;
    if (arguments.length === 2) {
      handler = this.$conditionalHandlers[$conditional];
      if (!handler)
        throw new Error("Can't use " + $conditional + " with MongooseNumber.");
      return handler.call(this, val);
    } else {
      val = this.cast($conditional);
      return val == null ? val : val.valueOf();
    }
  }

  /**
   * expose
   */

  return mongoose.Schema.Types.MongooseNumber = MongooseNumber;
}
