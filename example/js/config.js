require.config({
    paths : {
        'glmatrix' : '../../../qtek/thirdparty/gl-matrix',
        'text': '../js/text',
        'socket.io': '../dep/socket.io'
    },
    packages: [{
        name: 'qtek',
        location: '../../../qtek/src',
        main: 'qtek.amd'
    }, {
        name: 'qtek-app',
        location: '../../src',
        main: 'qtek-app.amd'
    }]
});