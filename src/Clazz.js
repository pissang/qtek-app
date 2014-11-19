define(function(require){

    'use strict';

    var deriveMixin = require('qtek/core/mixin/derive');
    var notifierMixin = require('qtek/core/mixin/notifier');
    var util = require('qtek/core/util');

    var Clazz = function() {
        /**
         * @type {number}
         */
        this.__GUID__ = util.genGUID();
    };

    util.extend(Clazz, deriveMixin);
    util.extend(Clazz.prototype, notifierMixin);

    return Clazz;
});