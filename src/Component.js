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

        /**
         * Initialize will be invoked when the component adding to entity
         */
        $init: function () {},

        $frame: function (frameTime) {
            this._frameTime = frameTime;
        },

        $dispose: function () {
            this._entity = null;
        },

        $dispatchEvent: null
    });

    return Component;
});