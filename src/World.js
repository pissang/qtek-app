define(function (require) {
    
    var Clazz = require('./Clazz');
    var Scene = require('qtek/Scene');

    var World = Clazz.derive({

        _scene: null,

        _cameras: null,

        _mainCamera: null,

        _appInstance: null,

        _entities: null

    }, function () {
        this._scene = new Scene();
    }, {

        $init: function (app3d) {
            this._appInstance = app3d;

            this._cameras = [];

            this._entities = [];

            this.trigger('init', app3d);
        },

        $frame: function (frameTime) {
            for (var i = 0; i < this._entities.length; i++) {
                this._entities[i].$frame(frameTime);
            }

            this.trigger('frame', frameTime);
        },

        $dispose: function () {
            
            this._appInstance.getRenderer().disposeScene(this._scene);

            for (var i = 0; i < this._entities.length; i++) {
                this._entities[i].$dispose();
            }

            this.trigger('dispose', frameTime);
        },

        $getEntities: function () {
            return this._entities;
        },

        getScene: function () {
            return this._scene;
        },

        getMainCamera: function () {
            return this._mainCamera;
        },

        setMainCamera: function (camera) {
            if (typeof(camera) === 'string') {
                camera = this.getCamera(camera);
            }
            this._mainCamera = camera;
        },

        getCamera: function (name) {
            for (var i = 0; i < this._cameras.length; i++) {
                if (this._cameras[i].name === name) {
                    return this._cameras[i];
                }
            }
        },

        addCamera: function (camera) {
            if (this._cameras.indexOf(camera) === -1) {
                this._cameras.push(camera);
            }
        },

        addEntity: function (entity) {
            // Have been added
            if (entity.getWorld() === this) {
                return;
            }
            entity.$init(this);
            this._entities.push(entity);
        },

        removeEntity: function (entity) {
            this._entities.splice(this._entities.indexOf(entity), 1);
            entity.$remove();
        },

        eachEntity: function (cb, context) {
            for (var i = 0, len = this._entities.length; i < len; i++) {
                cb.call(context, this._entities[i]);
            }
        },

        getAppInstance: function () {
            return this._appInstance;
        }
    });

    return World;
});