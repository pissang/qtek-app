define({
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
    }, {
        name: 'jump',
        url: '../asset/baseMale/baseMale@jump.json'
    }, {
        name: 'walk',
        url: '../asset/baseMale/baseMale@walk.json'
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
                }, {
                    name: 'walk',
                    type: 'skinning',
                    position: [0, 3]
                }]
            }, {
                name: 'jump',
                type: 'skinning',
                loop: false
            }]
        }, {
            type: 'plugin',
            scriptUrl: 'character.plugin.js'
        }]
    }]
});