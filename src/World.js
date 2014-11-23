// TODO More convinient hierarchy management
define(function (require) {
    
    var Clazz = require('./Clazz');
    var Scene = require('qtek/Scene');

    var World = Clazz.derive({

        _scene: null,

        _cameras: null,

        _mainCamera: null,

        _appInstance: null,

        _entities: null,

        _prefabInstances: [],

        _initialized: false

    }, function (app3d) {
        this._appInstance = app3d;

        this._scene = new Scene();

        this._entities = [];

        this._cameras = [];
    }, {

        $init: function () {

            for (var i = 0; i < this._entities.length; i++) {
                this._entities[i].$init();
            }

            this._initialized = true;

            this.trigger('init');
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

            this.trigger('dispose');
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
                if (!camera) {
                    console.warn('Camera ' + camera + ' not found');
                }
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
            if (this._entities.indexOf(entity) < 0) {
                this._entities.push(entity);
            }
            // Entity is added after initialize
            if (this._initialized) {
                entity.$init();
            }
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
        },

        instantiatePrefab: function (prefab) {
            var instance = prefab.$instantiate(this);
            instance.getEntities().forEach(function (entity) {
                this.addEntity(entity);
            }, this);
            this._scene.add(instance.getRootNode());

            return instance;
        },

        destroyPrefabInstance: function (instance) {
            instance.getEntities().forEach(function (entity) {
                entity.$dispose();
                this.removeEntity(entity);
            }, this);
            this._appInstance.getRenderer().disposeNode(instance.getRootNode());
            instance.$dispose();
        }
    });

    return World;
});