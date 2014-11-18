define({
    cameras: [{
        name: 'main',
        position: [0, 200, 300],
        target: [0, 100, 0]
    }],
    lights: [{
        name: 'main',
        type: 'directional',
        intensity: 0.7
    }, {
        name: 'ambient',
        type: 'ambient',
        intensity: 0.2
    }],
    mainCamera: 'main',
    models: [{
        name: 'baseMale',
        url: '../asset/baseMale/baseMale.json'
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
    }],
    entities: [{
        path: 'baseMale',
        components: [{
            type: 'animation',
            clips: [{
                name: 'move',
                type: 'blend',
                blend: '2d',
                autoPlay: true,
                position: [0, 0],
                inputClips: [{
                    name: 'run',
                    type: 'skinning',
                    position: [0, 4]
                }, {
                    name: 'strafeLeft',
                    type: 'skinning',
                    position: [-2, 0]
                }, {
                    name: 'strafeRight',
                    type: 'skinning',
                    position: [2, 0]
                }, {
                    name: 'idle',
                    type: 'skinning',
                    position: [0, 0]
                }]
            }]
        }, {
            type: 'plugin',
            scriptUrl: 'baseMale.js'
        }]
    }]
});