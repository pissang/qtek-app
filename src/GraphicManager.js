define(function (require) {
    
    var Clazz = require('./Clazz');
    var ShadowMapPass = require('qtek/prePass/ShadowMap');
    var Renderer = require('qtek/Renderer');
    var EnvironmentMapPass = require('qtek/prePass/EnvironmentMap');
    var FXLoader = require('qtek/loader/FX');
    var CompositorSceneNode = require('qtek/compositor/SceneNode');
    var Texture = require('qtek/Texture');

    var GraphicManager = Clazz.derive({

        _shadowMapPass: null,

        _debugShadow: false,

        _compositor: null,

        _compositorSceneNode: null,

        _appInstance: null

    }, {

        $init: function (app3D) {
            this._appInstance = app3D;
        },

        render: function (scene, camera) {
            var renderer = this._appInstance.getRenderer();
            if (this._shadowMapPass) {
                this._shadowMapPass.render(renderer, scene, camera);
            }
            if (this._compositor) {
                this._compositorSceneNode.autoUpdateScene = !this._shadowMapPass;
                this._compositorSceneNode.scene = scene;
                this._compositorSceneNode.camera = camera;

                this._compositor.render(renderer);
            } else {
                renderer.render(scene, camera);
            }
            if (this._shadowMapPass && this._debugShadow) {
                var clear = renderer.clear;
                renderer.clear = Renderer.DEPTH_BUFFER_BIT;
                this._shadowMapPass.renderDebug(renderer, 100);
                renderer.clear = clear;
            }
        },

        setShadow: function (config) {
            var renderer = this._appInstance.getRenderer();
            if (config.enable) {
                if (!this._shadowMapPass) {
                    this._shadowMapPass = new ShadowMapPass();
                    if (config.softShadow != null) {
                        this._shadowMapPass = ShadowMapPass[config.softShadow];
                    }
                    ['shadowBlur', 'shadowCascade', 'cascadeSplitLogFactor', 'lightFrustumBias'].forEach(function (propName) {
                        if (config[propName] != null) {
                            this._shadowMapPass[propName] = config[propName];
                        }
                    }, this);
                }
            }
            else {
                if (this._shadowMapPass) {
                    this._shadowMapPass.dispose(renderer);
                }
            }
            this._debugShadow = !!config.debug;
        },

        setPostProcessing: function (config) {
            var renderer = this._appInstance.getRenderer();
            if (this._compositor) {
                this._compositor.dispose(renderer); 
            }

            var fxLoader = new FXLoader();
            this._compositor = fxLoader.parse(config);

            this._compositorSceneNode = new CompositorSceneNode({
                name: 'scene',
                outputs: {
                    color : {
                        parameters : {
                            width : function(renderer) {
                                return renderer.width;
                            },
                            height : function(renderer) {
                                return renderer.height;
                            },
                            type : Texture.HALF_FLOAT
                        }
                    }
                }
            });
            this._compositor.addNode(this._compositorSceneNode);
        },

        setCompositor: function (compositor) {
            var renderer = this._appInstance.getRenderer();
            if (this._compositor) {
                this._compositor.dispose(renderer); 
            }
            this._compositorSceneNode = new CompositorSceneNode({
                name: 'scene',
                color : {
                    parameters : {
                        width : function(renderer) {
                            return renderer.width;
                        },
                        height : function(renderer) {
                            return renderer.height;
                        },
                        type : Texture.HALF_FLOAT
                    }
                }
            });
            this._compositor.addNode(this._compositorSceneNode);
        }
    });

    return GraphicManager;
});