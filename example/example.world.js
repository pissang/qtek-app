define({
    // Scene lights
    lights: [{
        name: 'main',
        type: 'directional',
        color: [1, 1, 1],
        intensity: 0,
        position: [10, 10, 10],
        // Rotation can be a array of quaternion or euler angle
        // Quaternion
        rotation: [0, 0, 0, 1]
        // Euler angle
        // rotation: [0, 0, 0]
        // Or use a target position to represent the rotation
        // target: [0.5, 0.5, 0.5]

        // If mounted on a parent node
        parent: 'Example'
    }],
    // Scene cameras
    cameras: [{
        name: 'main',
        type: 'perspective'
    }, {
        type: 'orthographic'
    }],
    mainCamera: 'main',
    models: [{
        name: 'Example',
        path: 'model/example/example.json',
        textureRootPath: 'model/example/textures/'
    }],
    clips: [{
        name: 'run',
        path: 'model/animation/run.json'
    }, {
        name: 'runLeft',
        path: 'model/animation/runLeft.json'
    }, {
        name: 'runRight',
        path: 'model/animation/runRight.json'
    }, {
        name: 'idle',
        path: 'model/animation/idle.json'
    }],
    entities: [{
        path: '/Example/node/mesh',
        components: [{
            type: 'plugin',
            // Load plugin script asynchronously
            scriptPath: 'plugin/example.js'
            // Or give the context directly
            // context: {
            //     init: function () {},
            //     update: function () {},
            //     dispose: function () {}
            // }
        }, {
            type: 'physics'
        }, {
            type: 'animation',
            clips: [{
                name: 'move',
                type: 'blend',
                blend: '1D',
                autoPlay: true,
                inputClips: [{
                    name: 'idle',
                    type: 'skinning',
                    position: [0, 1]
                }, {
                    name: 'run',
                    type: 'skinning',
                    position: [0, 1]
                }, {
                    name: 'runLeft',
                    type: 'skinning',
                    position: [-1, 0]
                }, {
                    name: 'runRight',
                    type: 'skinning',
                    position: [1, 0]
                }]
            }]
        }]
    }]
});