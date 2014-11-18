define(function (require) {
    
    var Base = require('qtek/core/Base');
    var GLTFLoader = require('qtek/loader/GLTF');
    var DirectionalLight = require('qtek/light/Directional');
    var PointLight = require('qtek/light/Point');
    var SpotLight = require('qtek/light/Spot');
    var AmbientLight = require('qtek/light/Ambient');
    var qtekUtil = require('qtek/core/util');
    var TaskGroup = require('qtek/async/TaskGroup');
    var Task = require('qtek/async/Task');
    var Scene = require('qtek/Scene');
    var Node = require('qtek/Node');
    var Vector3 = require('qtek/math/Vector3');
    var Vector2 = require('qtek/math/Vector2');
    var OrthoCamera = require('qtek/camera/Orthographic');
    var PerspectiveCamera = require('qtek/camera/Perspective');
    var Entity = require('./Entity');

    var AnimationComponent = require('./component/Animation');
    var AudioComponent = require('./component/Audio');
    var PhysicsComponent = require('./component/Physics');
    var PluginComponent = require('./component/Plugin');

    var SkinningClip = require('qtek/animation/SkinningClip');
    var Blend1DClip = require('qtek/animation/Blend1DClip');
    var Blend2DClip = require('qtek/animation/Blend2DClip');
    var SamplerClip = require('qtek/animation/SamplerClip');

    var World = Base.derive({

        _scene: null,

        _clipsMap: null,

        _cameras: null,

        _mainCamera: null,

        _appInstance: null,

        _entities: null

    }, {

        $init: function (app3d) {
            this._appInstance = app3d;

            this._scene = new Scene();

            this._clipsMap = {};

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
            
            this.getAppInstance().getRenderer.disposeScene(this._scene);

            for (var i = 0; i < this._entities.length; i++) {
                this._entities[i].$dispose();
            }

            this.trigger('dispose', frameTime);
        },

        loadConfig: function (config) {
            var tasks = [];
            var loadingTextures = [];
            if (config.models) {
                var modelLoaders = this._loadModels(config.models);
                var task = new TaskGroup().all(modelLoaders);
                tasks.push(task);
                task.success(function (res) {
                    qtekUtil.each(res, function (model) {
                        // Loading textures
                        var textures = model.textures;
                        qtekUtil.each(textures, function (texture) {
                            loadingTextures.push(texture);
                        });
                        this._scene.add(model.rootNode);
                    }, this);
                }, this);
            }
            if (config.clips) {
                var clipLoaders = this._loadClips(config.clips);
                var task = new TaskGroup().all(clipLoaders);
                tasks.push(task);
                task.success(this._afterLoadClips, this);
            }

            var task = new TaskGroup().all(tasks);
            task.success(function () {
                // Loading textures
                loadingTextures = loadingTextures.filter(function (texture) {
                    return !texture.isRenderable();
                });
                var textureTask = new TaskGroup().allSettled(loadingTextures);
                textureTask.success(function () {
                    this._initializeAfterLoad(config);
                    this.trigger('load');
                }, this);
            }, this);
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

        getClip: function (name) {
            return this._clipsMap[name];
        },

        getAppInstance: function () {
            return this._appInstance;
        },

        _loadModels: function(models) {
            var meshLoaders = models.map(function (item) {
                if (item.url) {
                    var loader = new GLTFLoader({
                        includeCamera: false,
                        includeLight: false,
                        rootNode: new Node({
                            name: item.name
                        })
                    });
                    this._setTransform(loader.rootNode, item);
                    loader.load(item.url);
                    if (item.textureRootPath !== null) {
                        loader.textureRootPath = item.textureRootPath;
                    }
                    return loader;
                }
            }, this);

            return meshLoaders;
        },

        _loadClips: function (clips) {
            var clipLoaders = clips.map(function (item) {
                if (item.url) {
                    var loader = new GLTFLoader({
                        includeMesh: false,
                        includeCamera: false,
                        includeLight: false
                    });
                    loader.load(item.url);
                    loader.success(function (res) {
                        res.clip.name = item.name;
                    });
                    return loader;
                }
            });

            return clipLoaders;
        },

        _afterLoadClips: function (res) {
            qtekUtil.each(res, function (item) {
                this._clipsMap[item.clip.name] = item.clip;
            }, this);
        },

        _initializeAfterLoad: function (config) {

            this._createLights(config.lights);

            this._createCameras(config.cameras);

            this.setMainCamera(config.mainCamera);

            this._createEntities(config.entities);
        },

        _createCameras: function (cameras) {
            qtekUtil.each(cameras, function (cameraInfo) {
                var camera;
                var type = cameraInfo.type || '';
                switch (type.toLowerCase()) {
                    case 'orthograph':
                        camera = new OrthoCamera();
                        ['left', 'right', 'top', 'bottom', 'near', 'far'].forEach(function (propName) {
                            if (cameraInfo[propName] != null) {
                                camera[propName] = cameraInfo[propName];
                            }
                        });
                        break;
                    case 'perspective':
                    default:
                        camera = new PerspectiveCamera();
                        ['near', 'far', 'fov', 'aspect'].forEach(function (propName) {
                            if (cameraInfo[propName] != null) {
                                camera[propName] = cameraInfo[propName];
                            }
                        });
                        break;
                }

                if (cameraInfo.parent) {
                    var parentNode = this._scene.queryNode(cameraInfo.parent);
                    parentNode.add(camera);
                } else {
                    this._scene.add(camera);
                }

                if (cameraInfo.name != null) {
                    camera.setName(cameraInfo.name);
                }

                this._setTransform(camera, cameraInfo);

                this._cameras.push(camera);
            }, this);
        },

        _createLights: function (lights) {
            qtekUtil.each(lights, function (lightInfo) {
                var light;
                var type = lightInfo.type || '';
                switch (type.toLowerCase()) {
                    case 'directional':
                        light = new DirectionalLight();
                        if (lightInfo.shadowBias != null) {
                            light.shadowBias = lightInfo.shadowBias;
                        }
                        if (lightInfo.shadowSlopeScale != null) {
                            light.shadowSlopeScale = lightInfo.shadowSlopeScale;
                        }
                        break;
                    case 'spot':
                        light = new SpotLight();
                        ['range', 'umbraAngle', 'penumbraAngle', 'falloffFactor', 'shadowBias', 'shadowSlopeScale'].forEach(function (propName) {
                            if (lightInfo[propName] != null) {
                                light[propName] = lightInfo[propName];
                            }
                        });
                        break;
                    case 'ambient':
                        light = new AmbientLight();
                        break;
                    case 'point':
                    default:
                        light = new PointLight();
                        if (lightInfo.range) {
                            light.range = lightInfo.range;
                        }
                        break;
                }

                if (lightInfo.color) {
                    light.color = lightInfo.color;
                }
                if (lightInfo.intensity != null) {
                    light.intensity = lightInfo.intensity;
                }

                if (lightInfo.parent) {
                    var parentNode = this._scene.queryNode(lightInfo.parent);
                    parentNode.add(light);
                }
                else {
                    this._scene.add(light);
                }
                if (lightInfo.name != null) {
                    light.setName(lightInfo.name);
                }

                this._setTransform(light, lightInfo);
            }, this);
        },

        _setTransform: function (node, info) {
            if (info.position) {
                node.position.setArray(info.position);
            }
            if (info.rotation) {
                // Is a quaternion
                if (info.rotation.length === 4) {
                    node.rotation.setArray(info.rotation);
                }
                else if (info.rotation.length === 3) {
                    node.rotation.rotateX(info.rotation[0]);
                    node.rotation.rotateY(info.rotation[1]);
                    node.rotation.rotateZ(info.rotation[2]);
                }
            }
            else if (info.target) {
                var targetVec = new Vector3();
                targetVec.setArray(info.target);
                node.lookAt(targetVec);
            }
            if (info.scale) {
                node.scale.setArray(info.scale);
            }
        },

        _createEntities: function (entities) {
            qtekUtil.each(entities, function (entityInfo) {
                var sceneNode = this._scene.queryNode(entityInfo.path);
                if (sceneNode) {
                    var entity = new Entity();
                    entity.$init(this, sceneNode);
                    this._entities.push(entity);

                    // Create components;
                    if (entityInfo.components) {
                        for (var i = 0; i < entityInfo.components.length; i++) {
                            var component = this._createComponent(entityInfo.components[i], entity);
                        }
                    }
                }
            }, this);
        },

        _createComponent: function (componentInfo, entity) {
            var component;
            var type = componentInfo.type || '';
            switch (type.toLowerCase()) {
                case 'plugin':
                    if (componentInfo.scriptUrl) {
                        component = new PluginComponent();
                        require([componentInfo.scriptUrl], function (context) {
                            component.context = context;
                        });
                        entity.addComponent(component);
                    }
                    else if (componentInfo.context) {
                        component = new PluginComponent({
                            context: componentInfo.context
                        });
                        entity.addComponent(component);
                    }
                    break;
                case 'animation':
                    var component = new AnimationComponent();
                    entity.addComponent(component);
                    qtekUtil.each(componentInfo.clips, function (clipInfo) {
                        var clip = this._createAnimationClip(clipInfo);
                        if (clip) {
                            component.addClip(clip);
                            if (clipInfo.autoPlay) {
                                component.playClip(clipInfo.name);
                            }
                        }
                    }, this);
            }
        },

        _createAnimationClip: function (clipInfo) {
            var type = clipInfo.type || '';
            switch (type.toLowerCase()) {
                case 'skinning':
                    return this.getClip(clipInfo.name);
                    break;
                case 'blend':
                    var blendClip;
                    var blendType = clipInfo.blend.toLowerCase();
                    switch (blendType) {
                        case '2d':
                            blendClip = new Blend2DClip();
                            if (clipInfo.position) {
                                blendClip.position.setArray(clipInfo.position);
                            }
                            break;
                        case '1d':
                        default:
                            blendClip = new Blend1DClip();
                            if (clipInfo.position) {
                                blendClip.position = clipInfo.position;
                            }
                    }
                    blendClip.name = clipInfo.name;
                    blendClip.setLoop(true);

                    var exampleClip;
                    for (var i = 0; i < clipInfo.inputClips.length; i++) {
                        var inputClip = this._createAnimationClip(clipInfo.inputClips[i]);
                        if (inputClip) {
                            if (blendType === '2d') {
                                var position = clipInfo.inputClips[i].position || [0, 0];
                                blendClip.addInput(new Vector2(position[0], position[1]), inputClip);
                            } else {
                                blendClip.addInput(clipInfo.inputClips[i].position || 0, inputClip);
                            }
                            exampleClip = inputClip.output != null ? inputClip.output : inputClip;
                        }
                    }
                    if (exampleClip) {
                        blendClip.output = new SkinningClip();
                        for (var i = 0; i < exampleClip.jointClips.length; i++) {
                            blendClip.output.addJointClip(new SamplerClip({
                                name: exampleClip.jointClips[i].name
                            }));
                        }
                        return blendClip;
                    }
            }
        }
    });

    return World;
});