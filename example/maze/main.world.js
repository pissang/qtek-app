define({
    // Graphic configs
    graphic: {
        shadow: {
            debug: true,
            enable: true,
            shadowCascade: 4,
            cascadeSplitLogFactor: 0.8,
            lightFrustumBias: 4000
        },
        postProcessingUrl: '../asset/fx/hdr.json'
    },

    cameras: [{
        name: 'mainCamera',
        position: [0, 200, -200],
        target: [0, 170, 0],

        parent: 'baseMale',
        far: 5000
    }],

    skybox: {
        texture: '#skybox'
    },
    
    lights: [{
        name: 'mainLight',
        type: 'directional',
        intensity: 2,
        position: [-5, 20, 10],
        target: [0, 0, 0],
        shadowResolution: 1024,
        shadowBias: 0.004,
        shadowSlopeScale: 0.5
    }, {
        name: 'ambient',
        type: 'ambient',
        intensity: 0.2
    }],
    
    mainCamera: 'mainCamera',
    
    textures: [{
        target: '2D',
        name: 'groundDiffuse',
        wrapS: 'REPEAT',
        wrapT: 'REPEAT',
        url: '../asset/textures/stoneGround.png',
        anisotropic: 32
    },{
        target: '2D',
        name: 'groundNormal',
        wrapS: 'REPEAT',
        wrapT: 'REPEAT',
        url: '../asset/textures/stoneGround_NRM.png',
        anisotropic: 32
    }, {
        target: 'CUBE',
        name: 'skybox',
        url: '../asset/textures/OpenfootageNET_Hintersee_low.hdr',
        width: 1024,
        height: 1024,
        exposure: 0.5
    }],
    
    materials: [{
        name: 'ground',
        shader: 'buildin.physical',
        uniforms: {
            diffuseMap: '#groundDiffuse',
            normalMap: '#groundNormal',
            glossiness: 0.8,
            uvRepeat: [500, 500]
        },
        vertexDefines: {},
        fragmentDefines: {
            'SRGB_DECODE': true
        }
    }],

    models: [{
        name: 'baseMale',
        url: '../asset/baseMale/baseMale.json'
    }, {
        name: 'ground',
        procedure: 'plane',
        material: 'ground',
        rotation: [-Math.PI / 2, 0, 0],
        scale: [100000, 100000, 1],
        castShadow: false
    }],
    
    clips: [{
        name: 'run',
        url: '../asset/baseMale/baseMale@run.json'
    }, {
        name: 'strafeLeft',
        url: '../asset/baseMale/baseMale@strafeLeft.json'
    }, {
        name: 'strafeRight',
        url: '../asset/baseMale/baseMale@strafeRight.json'
    }, {
        name: 'idle',
        url: '../asset/baseMale/baseMale@idle.json'
    }, {
        name: 'jump',
        url: '../asset/baseMale/baseMale@jump.json'
    }, {
        name: 'walk',
        url: '../asset/baseMale/baseMale@walk.json'
    }],
    
    entities: [{
        sceneNodePath: 'baseMale',
        materials: [{
            meshPath: 'baseMale',
            fragmentDefines: {
                'SRGB_DECODE': true
            }
        }],
        components: [{
            type: 'animation',
            clips: [{
                name: 'move',
                type: 'blend',
                blend: '2d',
                loop: true,
                autoPlay: true,
                position: [0, 0],
                inputClips: [{
                    name: 'run',
                    type: 'skinning',
                    position: [0, 8]
                }, {
                    name: 'walk',
                    type: 'skinning',
                    position: [0, 3]
                }, {
                    name: 'strafeLeft',
                    type: 'skinning',
                    position: [-3, 0],
                    offset: 400
                }, {
                    name: 'strafeRight',
                    type: 'skinning',
                    position: [3, 0]
                }, {
                    name: 'idle',
                    type: 'skinning',
                    position: [0, 0]
                }]
            }, {
                name: 'jump',
                type: 'skinning',
                loop: false
            }]
        }, {
            type: 'plugin',
            scriptUrl: 'baseMaleControl.plugin.js',
            parameters: {
                forwardMaxSpeed: 8,
                sideMaxSpeed: 3
            }
        }, {
            type: 'plugin',
            scriptUrl: 'user.plugin.js'
        }]
    }, {
        sceneNodePath: 'baseMale/mainCamera',
        components: [{
            type: 'plugin',
            scriptUrl: '../js/orbitCamera.plugin.js'
        }]
    }]
});