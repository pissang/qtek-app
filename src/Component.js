define(function (require) {
    
    'use strict';
    
    var Clazz = require('./Clazz');

    var Component = Clazz.derive({
        _entity: null
    }, function (entity) {
        this._entity = entity;
    }, {
        type: 'COMPONENT',

        getEntity: function () {
            return this._entity;
        },

        getAppInstance: function () {
            return this._entity.getAppInstance();
        },

        $init: function () {},

        $frame: function (frameTime) {
            this._frameTime = frameTime;
        },

        $dispose: function () {
            this._entity = null;
        },

        $dispatchEvent: null,

        clone: function (entity) {
            return new this.constructor(entity);
        }
    });

    return Component;
});