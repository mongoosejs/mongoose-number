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

  MongooseNumber.prototype.$inc = function (val) {
    var schema = this._parent.schema.path(this._path)
      , value = Number(val) || 1;
    if (isNaN(value)) value = 1;

    var num = schema.cast(this + value, this._parent);
    this._parent.setValue(this._path, num);
    num._atomics.$inc = (this._atomics.$inc || 0) + value;
    this._parent.$__.activePaths.modify(this._path);
    return this;
  }

  MongooseNumber.prototype.increment = MongooseNumber.prototype.$inc;

  /**
   * Atomic decrement
   *
   * @api public
   */

  MongooseNumber.prototype.$dec = function (val) {
    var value = (Number(val) || 1) * -1;
    this.increment(value);
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
