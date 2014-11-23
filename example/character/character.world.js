define({
    // Graphic configs
    graphic: {
        shadow: {
            enable: true,
            shadowCascade: 3,
            cascadeSplitLogFactor: 0.2
        }
    },

    cameras: [{
        name: 'mainCamera',
        position: [0, 200, -300],
        target: [0, 100, 0],

        parent: 'baseMale',
        far: 10000
    }],
    
    lights: [{
        name: 'mainLight',
        type: 'directional',
        intensity: 0.8,
        position: [10, 20, 10],
        target: [0, 0, 0],
        shadowResolution: 1024,
        shadowBias: 0.002,
        shadowSlopeScale: 5
    }, {
        name: 'ambient',
        type: 'ambient',
        intensity: 0.1
    }, {
        name: 'fillLight',
        type: 'point',
        intensity: 0.5,
        range: 300,
        position: [0, 200, -120],
        parent: 'baseMale'
    }],
    
    mainCamera: 'mainCamera',
    
    textures: [{
        target: '2D',
        name: 'groundDiffuse',
        wrapS: 'REPEAT',
        wrapT: 'REPEAT',
        url: '../asset/textures/grid.png',
        anisotropic: 32
    }],
    
    materials: [{
        name: 'ground',
        shader: 'buildin.lambert',
        uniforms: {
            diffuseMap: '#groundDiffuse',
            uvRepeat: [1000, 1000]
        },
        vertexDefines: {},
        fragmentDefines: {}
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
    }],
    
    entities: [{
        sceneNodePath: 'baseMale',
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
            scriptUrl: '../js/baseMaleControl.plugin.js',
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