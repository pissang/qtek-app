define(function (require) {
    
    var Clazz = require('./Clazz');
    var ShadowMapPass = require('qtek/prePass/ShadowMap');
    var EnvironmentMapPass = require('qtek/prePass/EnvironmentMap');
    var FXLoader = require('qtek/loader/FX');
    var CompositorSceneNode = require('qtek/compositor/SceneNode');

    var GraphicManager = Clazz.derive({

        _shadowMapPass: null,

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
        },

        setShadow: function (config) {
            var renderer = this._appInstance.getRenderer();
            if (config.enable) {
                if (!this._shadowMapPass) {
                    this._shadowMapPass = new ShadowMapPass();
                    if (config.softShadow != null) {
                        this._shadowMapPass = ShadowMapPass[config.softShadow];
                    }
                    ['shadowBlur', 'shadowCascade', 'cascadeSplitLogFactor'].forEach(function (propName) {
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
        },

        setPostProcessing: function (config) {
            var renderer = this._appInstance.getRenderer();
            if (this._compositor) {
                this._compositor.dispose(renderer); 
            }

            var fxLoader = new FXLoader();
            this._compositor = fxLoader.parse(config);

            this._compositorSceneNode = new CompositorSceneNode({
                name: 'scene'
            });
            this._compositor.addNode(this._compositorSceneNode);
        }
    });

    return GraphicManager;
});