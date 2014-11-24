require.config({
    paths : {
        'glmatrix' : '../../../qtek/thirdparty/gl-matrix',
        'text': '../dep/text',
        'socket.io': '../dep/socket.io',
        'matter': '../dep/matter'
    },
    packages: [{
        name: 'qtek',
        location: '../../../qtek/src',
        main: 'qtek.amd'
    }, {
        name: 'qtek-app',
        location: '../../src',
        main: 'qtek-app.amd'
    }, {
        name: 'qtek-physics',
        location: '../../../qtek-physics/src',
        main: 'qtek-physics.amd'
    }]
});