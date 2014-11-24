define({
    models: [{
        name: 'SanFranciscoHouse',
        url: '../asset/SanFranciscoHouse/SanFranciscoHouse.json',
        scale: [100, 100, 100]
    }],
    textures: [{
        target: '2D',
        name: 'houseDiffuse',
        url: '../asset/SanFranciscoHouse/textures/houseSF_green.png'
    }, {
        name: 'houseNormal',
        url: '../asset/SanFranciscoHouse/textures/houseSF_NM.png',
    }],
    entities: [{
        sceneNodePath: 'SanFranciscoHouse',
        materials: [{
            meshPath: 'polySurface2129',
            shader: 'buildin.physical',
            uniforms: {
                'diffuseMap': '#houseDiffuse',
                'normalMap': '#houseNormal',
                'glossiness': 0.2,
                'color': [1, 1, 1]
            },
            fragmentDefines: {
                'SRGB_DECODE': true
            }
        }],
        components: [{
            type: 'plugin',
            scriptUrl: 'house.plugin.js'
        }]
    }]
});