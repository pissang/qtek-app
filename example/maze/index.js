define(function (require) {
    var IP = '172.18.19.117';

    var App3D = require('qtek-app/App3D');
    var TaskGroup = require('qtek/async/TaskGroup');
    var qtekUtil = require('qtek/core/util');
    var io = require('socket.io');
    var worldConfig = require('./main.world');
    var malePrefabConfig = require('./male.prefab');
    var housePrefabConfigs = [
        require('./house.prefab'),
        require('./house1.prefab'),
        require('./house2.prefab'),
        require('./house3.prefab'),
        require('./house4.prefab'),
        require('./house5.prefab')
    ];
    // var generateMaze = require('./maze');
    var field = require('./maze2');

    var app = new App3D();
    app.init(document.getElementById('main'));

    app.physicsEngine = require('./physics');

    var time = Date.now();

    app.physicsEngine.on('afterstep', function () {
        var dTime = Date.now() - time;
        app.physicsEngine.step(dTime / 1000);
        time = Date.now();
    });
    app.physicsEngine.step(0.1);

    // Load world from config file
    var world = app.loadWorld(worldConfig);

    // Load male prefab from config file
    var malePrefab = app.loadPrefab(malePrefabConfig);

    window.addEventListener('resize', function () {
        app.resize();
    });

    world.success(function () {
        var housePrefabs = housePrefabConfigs.map(function (item) {
            return app.loadPrefab(item);
        });
        var task = new TaskGroup().allSettled(housePrefabs);
        task.success(function () {
            // var field = generateMaze(30);
            field.dimension = 30;
            var mePosition = [];
            // Create house maze
            for (var i = 0; i < field.dimension; i++) {
                for (var j = 0; j < field.dimension; j++) {
                    if (field[i][j] || i === 0 || j === 0 || i === field.dimension - 1 || j === field.dimension - 1) {  // No out
                        var position = [
                            (i - field.dimension / 2) * 700,
                            0,
                            (j - field.dimension / 2) * 700
                        ];
                        var idx = Math.floor((Math.random() - 1e-5) * housePrefabs.length);
                        var instance = world.instantiatePrefab(housePrefabs[idx]);
                        instance.getRootNode().position.setArray(position);

                        // Make house face to the path
                        if (i > 0 && i < field.dimension - 1) {
                            if (j === 0) {
                                instance.getRootNode().rotation.rotateY(-Math.PI / 2);
                            } else if (j == field.dimension - 1) {
                                instance.getRootNode().rotation.rotateY(Math.PI / 2);
                            } else {
                                if (field[i - 1][j] && field[i + 1][j]) {
                                    if (field[i][j - 1]) {
                                        if (field[i][j + 1]) {
                                            world.destroyPrefabInstance(instance);
                                        } else {
                                            instance.getRootNode().rotation.rotateY(-Math.PI / 2);
                                        }
                                    } else {
                                        instance.getRootNode().rotation.rotateY(Math.PI / 2);
                                    }
                                } else if (!field[i - 1][j]) {
                                    instance.getRootNode().rotation.rotateY(Math.PI);
                                }
                            }
                        } else {
                            instance.getRootNode().rotation.rotateY(Math.PI);
                        }
                    }
                    else if (!field[i][j]) {
                        mePosition[0] = (i - field.dimension / 2) * 700;
                        mePosition[1] = 0;
                        mePosition[2] = (j - field.dimension / 2) * 700;
                    }
                }
            }

            // Init characters
            init(mePosition);
        });
    });

    var characterInstances = {};

    function init(mePosition) {

        var socket = io.connect('http://' + IP + ':8888/');
        // var socket = io.connect('http://dev052.baidu.com:8890');

        socket.on('connect_error', function () {
            console.log('连接服务器失败');
            socket.disconnect();

            // Single player
            app.start();
        });
        socket.on('connection-id', function (id) {
            console.log('connection id', id);
        });
        socket.emit('register', {
            type: 'game'
        });
        socket.on('other-close', function (id) {
            var instance = characterInstances[id];
            if (instance) {
                world.destroyPrefabInstance(instance);
            }
            delete characterInstances[id];
        });

        socket.on('register-status', function (statusData) {
            if (statusData.status === 'success') {
                var userData = window.localStorage['qtek-app-character-user'];
                if (userData) {
                    userData = JSON.parse(userData);
                } else {
                    userData = {
                        id: statusData.id,
                        position: mePosition,
                        color: [Math.random(), Math.random(), Math.random()]  
                    };
                }

                socket.emit('join', userData);

                document.getElementById('qrcode').src = 'http://ishowshao.com/phpqrcode/index.php?data=' + encodeURIComponent('http://' + IP + '/gamma/demo-remote.html?gameId=' + userData.id);
                // document.getElementById('qrcode').src = 'http://ishowshao.com/phpqrcode/index.php?data=' + encodeURIComponent('http://dev052.baidu.com:8890/demo-remote.html?gameId=' + userData.id);
                // 
                app.broadcastEntityEvent('userInit', userData);

                socket.on('control', function (data) {
                    switch (data.type) { 
                        case 'orientation':
                            break;
                        case 'motion':
                            break;
                        case 'stick0':
                            stickX = data.data.x;
                            stickY = data.data.y;

                            app.broadcastEntityEvent('changeSpeed', stickX, stickY);
                            break;
                        case 'stick1':
                            stickX = data.data.x;
                            stickY = data.data.y;

                            app.broadcastEntityEvent('orbit', stickX, stickY);
                            break;
                        case 'button-0':
                            app.broadcastEntityEvent('jump');
                            break;
                    }
                });

                socket.on('other-join', function (data) {
                    if (data.id !== userData.id) {
                        createCharacterInstance(data);
                    }
                });

                socket.on('other-sync', function (data) {
                    if (data.id !== userData.id) {
                        var instance = characterInstances[data.id];
                        if (instance) {
                            instance.getEntities().forEach(function (entity) {
                                if (data.position) {
                                    entity.broadcastComponentEvent('updatePositionAndRotation', data.position, data.rotation);
                                } else if (data.speed) {
                                    entity.broadcastComponentEvent('characterChangeSpeed', data.speed.x, data.speed.y);
                                }
                            });
                        }
                    }
                });

                socket.on('enter', function (data) {
                    data.forEach(function (item) {
                        if (item.id !== userData.id) {
                            qtekUtil.extend(item.join, item.sync);
                            createCharacterInstance(item.join);
                        }
                    });

                    app.start();
                });

                var createCharacterInstance = function (data) {
                    var instance = world.instantiatePrefab(malePrefab);
                    instance.getEntities().forEach(function (entity) {
                        entity.broadcastComponentEvent('characterUserInit', data);
                    });
                    characterInstances[data.id] = instance;

                    return instance;
                }

                app.on('selfSync', function (data) {
                    data.id = userData.id;
                    socket.emit('sync', data);
                });
            }
        });
    }
});