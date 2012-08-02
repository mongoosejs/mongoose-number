// mongoose number type

module.exports = exports = function (mongoose) {

  /**
   * MongooseNumber constructor.
   *
   * @param {Number} value the number to subclass
   * @param {String} path schema path
   * @param {Document} doc parent document
   * @inherits Number
   */

  function MongooseNumber (value, path, doc) {
    var number = new Number(value);
    number.__proto__ = MongooseNumber.prototype;
    number._atomics = {};
    number._path = path;
    number._parent = doc;
    return number;
  }

  /*!
   * Inherits from Number.
   */

  MongooseNumber.prototype = new Number;

  /**
   * Atomic increment
   *
   * @api public
   */

  MongooseNumber.prototype.$inc = function (value) {
    var schema = this._parent.schema.path(this._path)
      , value = Number(value) || 1;
    if (isNaN(value)) value = 1;
    this._parent.setValue(this._path, schema.cast(this + value));
    this._parent.getValue(this._path)._atomics.$inc = value || 1;
    this._parent._activePaths.modify(this._path);
    return this;
  }

  MongooseNumber.prototype.increment = MongooseNumber.prototype.$inc;

  /**
   * Atomic decrement
   *
   * @api public
   */

  MongooseNumber.prototype.$dec = function () {
    this.increment(-1);
    return this;
  }

  MongooseNumber.prototype.decrement = MongooseNumber.prototype.$dec;

  /**
   * Re-declare toString (for `console.log`)
   *
   * @api public
   */

  MongooseNumber.prototype.inspect =
  MongooseNumber.prototype.toString = function () {
    return String(this.valueOf());
  }

  /*!
   * expose
   */

  return mongoose.Types.MongooseNumber = MongooseNumber;
}
