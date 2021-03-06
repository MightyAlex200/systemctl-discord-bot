"use strict";

const Utils = require("../core/Utils");

class IBase {
  static _inherit(proto, get) {
    var thisProto = this.prototype;
    thisProto._valueOverrides = thisProto._valueOverrides || {};
    thisProto._gettersByProperty = thisProto._gettersByProperty || {};
    thisProto._suppressErrors = false;
    Object.defineProperties(thisProto, {
      _valueOverrides: {enumerable: false},
      _gettersByProperty: {enumerable: false},
      _suppressErrors: {enumerable: false}
    });

    thisProto._gettersByProperty[this.name] =
      thisProto._gettersByProperty[this.name] || {};

    const interfacingProperties = new proto();
    for (let key in interfacingProperties) {
      thisProto._gettersByProperty[this.name][key] = get;

      Object.defineProperty(thisProto, key, {
        enumerable: true,
        configurable: true,
        get: function() {
          try {
            const value = get.call(this, key);
            if (this.__proto__._valueOverrides[key]) {
              return this.__proto__._valueOverrides[key].call(this, value);
            }
            return value;
          } catch (e) {
            if (!this.__proto__._suppressErrors) console.error(e.stack);
            return null;
          }
        }
      });
    }
  }
  static _setValueOverride(k, fn) {
    if (!this.prototype.hasOwnProperty(k)) {
      throw new Error(
        `Property '${k}' is not defined for ${this.constructor.name}`
      );
    }

    if (typeof fn !== "function") {
      return delete this._valueOverrides[k];
    }
    this.prototype._valueOverrides[k] = fn;
  }
  static _setSuppressErrors(value) {
    this.__proto__._suppressErrors = value;
  }

  // Get a copy of raw model data or property
  getRaw(property) {
    var allGetters = this.__proto__._gettersByProperty;
    var getters = allGetters[this.constructor.name];
    if (!getters) {
      // no own properties, lookup last inherited class
      var lastClass = Object.keys(allGetters).pop();
      getters = allGetters[lastClass];
    }

    getters = getters || {};

    if (property) {
      if (!getters.hasOwnProperty(property)) return;
      return getters[property].call(this, property);
    }

    var copy = {};
    for (var key in this) {
      try {
        if (getters.hasOwnProperty(key))
          copy[key] = getters[key].call(this, key);
      } catch (e) {
        copy[key] = null;
        console.error("Could not get key", key);
        console.error(e.stack);
      }
    }
    return copy;
  }

  // Get a copy of internal model data, including inherited properties
  toJSON() {
    var copy = {};
    for (var classname in this.__proto__._gettersByProperty) {
      var getters = this.__proto__._gettersByProperty[classname];
      for (var key in this) {
        try {
          if (getters.hasOwnProperty(key))
            copy[key] = getters[key].call(this, key);
        } catch (e) {
          copy[key] = null;
          console.error("Could not get key ", key);
          console.error(e.stack);
        }
      }
      if (classname === this.constructor.name) break;
    }
    return copy;
  }

  // Custom inspect output (console.log, util.format, util.inspect)
  inspect() {
    var copy = new (
      // create fake object to preserve class name
      new Function("return function " + this.constructor.name + "(){}")()
    );
    for (var key in this) { copy[key] = this[key]; }
    return copy;
  }

  get _valid() {
    try {
      var allGetters = this.__proto__._gettersByProperty;
      for (var classname in allGetters) {
        if (allGetters[classname].hasOwnProperty("id"))
          return allGetters[classname]["id"].call(this, "id");
      }
    } catch (e) {
      return false;
    }
  }

  valueOf() {
    if (!this.id) return null;
    return this.id;
  }
  equals(b) {
    return this.valueOf() === b.valueOf();
  }

  /**
   * Gets date and time this object was created at.
   * @returns {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(Utils.timestampFromSnowflake(this.id));
  }
}

module.exports = IBase;