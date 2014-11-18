define(function (require) {
    
    'use strict';
    
    var Base = require('qtek/core/Base');

    var Component = Base.derive({
        _entity: null
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
         * @param  {qtekApp.Entity} entity
         */
        $init: function (entity) {
            this._entity = entity;
        },

        $frame: function (frameTime) {
            this._frameTime = frameTime;
        },

        $dispose: function () {
            this._entity = null;
        }
    });

    return Component;
});