define(function (require) {
   
    var Base = require('qtek/core/Base');
    var GLTFLoader = require('qtek/loader/GLTF');
    var FXLoader = require('qtek/loader/FX');
    var DirectionalLight = require('qtek/light/Directional');
    var PointLight = require('qtek/light/Point');
    var SpotLight = require('qtek/light/Spot');
    var AmbientLight = require('qtek/light/Ambient');
    var qtekUtil = require('qtek/core/util');
    var TaskGroup = require('qtek/async/TaskGroup');
    var Task = require('qtek/async/Task');
    var Node = require('qtek/Node');
    var Vector3 = require('qtek/math/Vector3');
    var Vector2 = require('qtek/math/Vector2');
    var Material = require('qtek/Material');
    var Shader = require('qtek/Shader');
    
    require('qtek/shader/buildin');

    var shaderLibrary = require('qtek/shader/library');
    var request = require('qtek/core/request');

    var SkinningClip = require('qtek/animation/SkinningClip');
    var Blend1DClip = require('qtek/animation/Blend1DClip');
    var Blend2DClip = require('qtek/animation/Blend2DClip');
    var SamplerClip = require('qtek/animation/SamplerClip');

    var SphereGeo = require('qtek/geometry/Sphere');
    var CubeGeo = require('qtek/geometry/Cube');
    var PlaneGeo = require('qtek/geometry/Plane');
    var CylinderGeo = require('qtek/geometry/Cylinder');
    var ConeGeo = require('qtek/geometry/Cone');

    var Texture2D = require('qtek/texture/Texture2D');
    var TextureCube = require('qtek/texture/TextureCube');
    var Texture = require('qtek/Texture');
    var textureUtil = require('qtek/util/texture');

    var Mesh = require('qtek/Mesh');

    var OrthoCamera = require('qtek/camera/Orthographic');
    var PerspectiveCamera = require('qtek/camera/Perspective');

    var World = require('./World');
    var Prefab = require('./Prefab');

    var AnimationComponent = require('./component/Animation');
    var AudioComponent = require('./component/Audio');
    var PhysicsComponent = require('./component/Physics');
    var PluginComponent = require('./component/Plugin');
    var Entity = require('./Entity');

    var ResourceManager = Base.derive({

        _appInstance: null,

        _shaderLibrary: null
    }, {

        $init: function (app3d) {
            this._appInstance = app3d;

            this._shaderLibrary = shaderLibrary.createLibrary();
        },

        loadWorld: function (config, onsuccess) {

            var world = new World(this._appInstance);

            var lib = {
                clipsMap: {},
                materialsMap: {},
                texturesMap: {},
                rootNode: world.getScene(),
                entities: [],
                cameras: []
            };

            var self = this;

            this._loadCommon(config, lib, function () {

                if (config.graphic && config.graphic.postProcessingUrl) {
                    request.get({
                        url: config.graphic.postProcessingUrl,
                        onload: function (data) {
                            config.graphic.postProcessing = JSON.parse(data);
                            afterLoad();
                        }
                    });
                } else {
                    afterLoad();
                }
            });

            var afterLoad = function () {
                self._createWorldOtherAfterLoad(config, lib, world, function () {
                    world.$init();

                    if (config.skybox) {
                        if (config.skybox.texture && config.skybox.texture.indexOf('#') === 0) {
                            var texture = lib.texturesMap[config.skybox.texture.slice(1)];
                            if (texture) {
                                world.setSkybox(texture);
                            }
                        }
                    }

                    onsuccess && onsuccess(world);
                    world.trigger('success');

                    self.trigger('loadworld', world);
                });
            }

            return world;
        },

        loadPrefab: function (config, onsuccess) {
            var prefab = new Prefab(config.name);

            var lib = {
                clipsMap: {},
                materialsMap: {},
                texturesMap: {},
                rootNode: prefab.getRootNode(),
                entities: []
            };

            var self = this;

            this._loadCommon(config, lib, function () {

                self._createPrefabOtherAfterLoad(config, lib, prefab, function () {

                    onsuccess && onsuccess(prefab);
                    prefab.trigger('success');

                    self.trigger('loadprefab', prefab);                    
                });
            });

            return prefab;
        },

        _loadCommon: function (config, lib, cb) {
            var tasks = [];
            var loadingTextures = [];
            if (config.textures) {
                loadingTextures = this._loadTextures(config.textures, lib);
            }

            this._createMaterials(config.materials, lib);

            // Load models
            if (config.models) {
                var modelLoaders = this._loadModels(config.models, lib);
                var task = new TaskGroup().all(modelLoaders);
                tasks.push(task);
                task.success(function (res) {
                    qtekUtil.each(res, function (model) {
                        // Loading textures
                        var textures = model.textures;
                        qtekUtil.each(textures, function (texture) {
                            loadingTextures.push(texture);
                        });
                    }, this);
                }, this);
            }

            // Load animation clips
            if (config.clips) {
                var clipLoaders = this._loadClips(config.clips, lib);
                var task = new TaskGroup().all(clipLoaders);
                tasks.push(task);
                task.success(function (res) {
                    qtekUtil.each(res, function (item) {
                        lib.clipsMap[item.clip.name] = item.clip;
                    }, this);
                }, this);
            }

            // Load textures
            var task = new TaskGroup().all(tasks);
            task.success(function () {
                // Loading textures
                loadingTextures = loadingTextures.filter(function (texture) {
                    return !texture.isRenderable();
                });
                var textureTask = new TaskGroup().allSettled(loadingTextures);
                textureTask.success(function () {
                    cb && cb();
                }, this);
            }, this);
        },

        _loadTextures: function (textures, lib) {
            var propKeys = ['type', 'wrapS', 'wrapT', 'magFilter', 'minFilter'];
            var textures = textures.map(function (textureInfo) {
                var target = textureInfo.target || '';
                var texture;
                switch (target.toLowerCase()) {
                    case 'cube':
                        texture = new TextureCube({
                            width: textureInfo.width || 512,
                            height: textureInfo.height || 512,
                        });
                        if (textureInfo.url instanceof Array) {
                            texture.load(textureInfo.url);
                        } else {
                            // Texture is a panoramra
                            textureUtil.loadPanorama(
                                textureInfo.url, texture, this._appInstance.getRenderer(),
                                {
                                    exposure: textureInfo.exposure || 0
                                },
                                function () {
                                    texture.trigger('success');
                                },
                                function () {
                                    texture.trigger('error');
                                }
                            )
                        }
                        break;
                    case '2d':
                    default:
                        texture = new Texture2D();
                        texture.load(textureInfo.url);
                        break;
                }
                propKeys.forEach(function (name) {
                    var value = textureInfo[name];
                    if (value != null) {
                        if (typeof(value) === 'string') {
                            value = Texture[value];
                        }
                        texture[name] = value;   
                    }
                });
                if (textureInfo.anisotropic != null) {
                    texture.anisotropic = textureInfo.anisotropic;
                }

                lib.texturesMap[textureInfo.name] = texture;
                return texture;
            }, this);

            return textures
        },

        _createMaterials: function (materials, lib) {
            qtekUtil.each(materials, function (materialInfo) {
                var shaderName = materialInfo.shader || 'buildin.physical';
                var enabledTextures = [];
                for (var key in materialInfo.uniforms) {
                    var val = materialInfo.uniforms[key];
                    if (typeof(val) === 'string' && val.indexOf('#') === 0) {
                        // Is a texture
                        enabledTextures.push(key);
                    }
                }
                var shader = this._shaderLibrary.get(shaderName, {
                    textures: enabledTextures,
                    vertexDefines: materialInfo.vertexDefines,
                    fragmentDefines: materialInfo.fragmentDefines
                });
                var material = new Material({
                    name: materialInfo.name,
                    shader: shader
                });
                for (var key in materialInfo.uniforms) {
                    var val = materialInfo.uniforms[key];
                    if (typeof(val) === 'string' && val.indexOf('#') === 0) {
                        material.set(key, lib.texturesMap[val.slice(1)]);
                    } else {
                        material.set(key, val);
                    }
                }

                lib.materialsMap[materialInfo.name] = material;
            }, this);
        },

        _loadModels: function(models, lib) {
            var meshLoaders = models.map(function (modelInfo) {
                if (modelInfo.url) {
                    var loader = new GLTFLoader({
                        includeCamera: false,
                        includeLight: false,
                        rootNode: new Node({
                            name: modelInfo.name
                        })
                    });
                    loader.load(modelInfo.url);
                    
                    if (modelInfo.textureRootPath !== null) {
                        loader.textureRootPath = modelInfo.textureRootPath;
                    }

                    this._setTransform(loader.rootNode, modelInfo);
                    this._addSceneNode(loader.rootNode, modelInfo, lib);
                    return loader;
                }
                // Procedure mesh
                else if (modelInfo.procedure) {
                    var mesh = new Mesh({
                        geometry: this._createGeometry(modelInfo),
                        material: lib.materialsMap[modelInfo.material]
                    });
                    if (mesh.material.shader.isTextureEnabled('normalMap')) {
                        mesh.geometry.generateTangents();
                    }

                    if (modelInfo.castShadow != null) {
                        mesh.castShadow = modelInfo.castShadow;
                    }
                    if (modelInfo.receiveShadow != null) {
                        mesh.receiveShadow = modelInfo.receiveShadow;
                    }

                    this._setTransform(mesh, modelInfo);
                    this._addSceneNode(mesh, modelInfo, lib);
                }
            }, this);

            return meshLoaders;
        },

        _createGeometry: function (modelInfo, lib) {
            switch (modelInfo.procedure.toLowerCase()) {
                case 'sphere':
                    return new SphereGeo({
                        widthSegments: modelInfo.widthSegments || 20,
                        heightSegments: modelInfo.heightSegments || 20,
                        radius: modelInfo.radius || 1
                    });
                    break;
                case 'cube':
                    return new CubeGeo({
                        widthSegments: modelInfo.widthSegments || 1,
                        heightSegments: modelInfo.heightSegments || 1,
                        depthSegments: modelInfo.depthSegments || 1
                    });
                    break;
                case 'plane':
                    return new PlaneGeo({
                        widthSegments: modelInfo.widthSegments || 1,
                        heightSegments: modelInfo.heightSegments || 1
                    });
                    break;
                case 'cylinder':
                    return new CylinderGeo({
                        radius: modelInfo.radius || 1,
                        height: modelInfo.height || 2,
                        capSegments: modelInfo.capSegments || 50,
                        heightSegments: modelInfo.heightSegments || 1
                    });
                    break;
                case 'cone':
                    return new CylinderGeo({
                        topRadius: modelInfo.topRadius == null ? modelInfo.topRadius : 0,
                        bottomRadius: modelInfo.bottomRadius == null ? modelInfo.topRadius : 0,
                        height: modelInfo.height || 2,
                        capSegments: modelInfo.capSegments || 50,
                        heightSegments: modelInfo.heightSegments || 1
                    });
                    break;
            }
        },

        _loadClips: function (clips, lib) {
            var clipLoaders = clips.map(function (clipInfo) {
                if (clipInfo.url) {
                    var loader = new GLTFLoader({
                        includeMesh: false,
                        includeCamera: false,
                        includeLight: false
                    });
                    loader.load(clipInfo.url);
                    loader.success(function (res) {
                        res.clip.name = clipInfo.name;
                    });
                    return loader;
                }
            });

            return clipLoaders;
        },

        _createWorldOtherAfterLoad: function (config, lib, world, cb) {

            this._createLights(config.lights, lib);

            this._createCameras(config.cameras, lib);

            this._createEntities(config.entities, lib, cb);

            if (config.graphic) {
                this._appInstance.setGraphic(config.graphic);
            }

            lib.cameras.forEach(function (camera) {
                world.addCamera(camera);
            });
            lib.entities.forEach(function (entity) {
                world.addEntity(entity);
            });

            world.setMainCamera(config.mainCamera);
        },

        _createPrefabOtherAfterLoad: function (config, lib, prefab, cb) {
            this._createLights(config.lights, lib);

            this._createEntities(config.entities, lib, cb);

            lib.entities.forEach(function (entity) {
                prefab.addEntity(entity); 
            });
        },

        _createCameras: function (cameras, lib) {
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

                if (cameraInfo.name != null) {
                    camera.setName(cameraInfo.name);
                }

                this._setTransform(camera, cameraInfo);

                this._addSceneNode(camera, cameraInfo, lib);

                lib.cameras.push(camera);
            }, this);
        },

        _createLights: function (lights, lib) {
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

                ['color', 'intensity', 'shadowResolution', 'castShadow'].forEach(function (propName) {
                    if (lightInfo[propName] != null) {
                        light[propName] = lightInfo[propName];
                    }
                });

                if (lightInfo.name != null) {
                    light.setName(lightInfo.name);
                }

                this._setTransform(light, lightInfo);

                this._addSceneNode(light, lightInfo, lib);
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

        _addSceneNode: function (node, info, lib) {
            if (info.parent) {
                var parentNode = lib.rootNode.queryNode(info.parent);
                parentNode.add(node);
            }
            else {
                lib.rootNode.add(node);
            }
        },

        _createEntities: function (entities, lib, cb) {
            var count = 0;
            qtekUtil.each(entities, function (entityInfo) {
                var sceneNode = lib.rootNode.queryNode(entityInfo.sceneNodePath);
                if (sceneNode) {
                    var entity = new Entity(this._appInstance, sceneNode);
                    lib.entities.push(entity);

                    // Set materials
                    if (entityInfo.materials) {
                        for (var i = 0; i < entityInfo.materials.length; i++) {
                            var materialInfo = entityInfo.materials[i];
                            var meshPath = materialInfo.meshPath;
                            var mesh = sceneNode.queryNode(meshPath);
                            if (mesh && mesh.material) {
                                var material = mesh.material;

                                var enabledTextures = material.shader.getEnabledTextures();
                                var vertexDefines = qtekUtil.extend({}, material.shader.vertexDefines);
                                qtekUtil.extend(vertexDefines, materialInfo.vertexDefines);
                                var fragmentDefines = qtekUtil.extend({}, material.shader.fragmentDefines);
                                qtekUtil.extend(fragmentDefines, materialInfo.fragmentDefines);

                                for (var key in materialInfo.uniforms) {
                                    var val = materialInfo.uniforms[key];
                                    if (typeof(val) === 'string' && val.indexOf('#') === 0) {
                                        // Is a texture
                                        if (enabledTextures.indexOf(key) < 0) {
                                            if (key === 'normalMap') {
                                                mesh.geometry.generateTangents();
                                            }
                                            enabledTextures.push(key);
                                        }
                                    }
                                }

                                var shaderName = materialInfo.shader || 'buildin.physical';
                                var shader = this._shaderLibrary.get(shaderName, {
                                    textures: enabledTextures,
                                    vertexDefines: vertexDefines,
                                    fragmentDefines: fragmentDefines
                                });

                                if (shader) {
                                    material.attachShader(shader, true);

                                    for (var key in materialInfo.uniforms) {
                                        var val = materialInfo.uniforms[key];
                                        if (typeof(val) === 'string' && val.indexOf('#') === 0) {
                                            material.set(key, lib.texturesMap[val.slice(1)]);
                                        } else {
                                            material.set(key, val);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Create components;
                    if (entityInfo.components) {
                        for (var i = 0; i < entityInfo.components.length; i++) {
                            count++;
                            var component = this._createComponent(entityInfo.components[i], entity, lib, function () {
                                count--;
                                if (count === 0) {
                                    setTimeout(cb);
                                }
                            });
                        }
                    }
                }
            }, this);
        },

        _createComponent: function (componentInfo, entity, lib, callback) {
            var component;
            var type = componentInfo.type || '';
            switch (type.toLowerCase()) {
                case 'plugin':
                    if (componentInfo.scriptUrl) {
                        component = new PluginComponent(entity);
                        var htmlPath = window.location.protocol + '//' + window.location.host + window.location.pathname;
                        htmlPath = htmlPath.slice(0, htmlPath.lastIndexOf('/'));
                        var absUrl = qtekUtil.relative2absolute(componentInfo.scriptUrl, htmlPath);
                        require([absUrl], function (context) {
                            component.setContext(context);
                            component.setParameters(componentInfo.parameters);
                            entity.addComponent(component);

                            callback();
                        });
                    }
                    else if (componentInfo.context) {
                        component = new PluginComponent(entity, componentInfo.context);
                        component.setParameters(componentInfo.parameters);
                        entity.addComponent(component);

                        callback();
                    }
                    break;
                case 'animation':
                    var component = new AnimationComponent(entity);
                    entity.addComponent(component);
                    qtekUtil.each(componentInfo.clips, function (clipInfo) {
                        var clip = this._createAnimationClip(clipInfo, lib);
                        if (clip) {
                            component.addClip(clip);
                        }
                        if (clipInfo.autoPlay) {
                            component.autoPlayClip = clipInfo.name;
                        }
                    }, this);

                    callback();
            }
        },

        _createAnimationClip: function (clipInfo, lib) {
            var type = clipInfo.type || '';
            switch (type.toLowerCase()) {
                case 'skinning':
                    var clip = lib.clipsMap[clipInfo.name];
                    clip.setLoop(clipInfo.loop);
                    return clip;
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
                    blendClip.setLoop(clipInfo.loop);

                    var exampleClip;
                    for (var i = 0; i < clipInfo.inputClips.length; i++) {
                        var inputClip = this._createAnimationClip(clipInfo.inputClips[i], lib);
                        if (inputClip) {
                            if (blendType === '2d') {
                                var position = clipInfo.inputClips[i].position || [0, 0];
                                blendClip.addInput(new Vector2(position[0], position[1]), inputClip, clipInfo.inputClips[i].offset || 0);
                            }
                            else {
                                blendClip.addInput(clipInfo.inputClips[i].position || 0, inputClip, clipInfo.inputClips[i].offset || 0);
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

    return ResourceManager;
});