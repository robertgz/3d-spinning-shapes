cubeSpin = function() {
  // setup stats.js 
  function initStats() {
    var stats = data.stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
  
    return stats.domElement;
  }
  // setup dat.gui
  function createDAT() {
    var datData = data.datGUIData;
    var gui = new dat.GUI();
    gui.add(datData, 'rotationZmultiplier', -25, 25).step(1);
    gui.add(datData, 'rotationYmultiplier', -25, 25, 1);
    gui.add(datData, 'ambientIntensity', -1, 50, 1).onChange(function (e) {
        data.ambientLight.intensity = e ;
    });
    gui.addColor(datData, 'background').onChange(function (e) {
        data.renderer.setClearColor( e );
    });
  
    return gui;
  }
  
  function setupScene() {
    data.scene = new THREE.Scene( { 
      background: configScene.backgroundColor 
    });

    var camPos = configScene.cameraPosition;
    var size = getWindowSize();
    data.camera = new THREE.PerspectiveCamera( 
      45, size.x / size.y, 1, 1000
    );
    data.camera.position.set( camPos.x, camPos.y, camPos.z );

    data.renderer = new THREE.WebGLRenderer( configScene.renderConfig );
    data.renderer.setSize( size.x, size.y );

    configScene.pointLights.forEach(function(lightData) {
      var light = new THREE.PointLight( 
        lightData.color, lightData.intensity, lightData.distance 
      );
      var pos = lightData.position;
      light.position.set( pos.x, pos.y, pos.z );
      data.scene.add( light );
    });
    // data.scene.add(new THREE.AxesHelper(5));

    return data.scene;
  }

  function setupSceneObjectGroups() {
    var lettersGroup = new THREE.Group();
    lettersGroup.name = data.sceneObjectsName;
    data.scene.add( lettersGroup );

    configScene.objects.forEach(function (item) {
      var group = new THREE.Group();
      group.name = item.name;
      lettersGroup.add( group );
    });
  }

  function setupKeyboardEventData() {
    configScene.objects.forEach(function (item) {

      if (item.keyboardKeys) {
        item.keyboardKeys.forEach(function (keyData){
          data.keyPressLookup[keyData.key] = { 
            objectName: item.name, direction: keyData.direction 
          };
        });
      }

    });
  }

  function setupObjectData() {
    configScene.objects.forEach(function (item) {
      data.objectList[item.name] = {};
      data.objectList[item.name].rotationData = 
        JSON.parse(JSON.stringify(configScene.rotationDataTemplate));
      data.objectList[item.name].color = item.color;
    });
  }

  function updateRotation(rotationData, sign) {
    rotationData.applyDamping = false;
    var rotMin = configScene.rotationConstants.rotMin;
    var rotMax = configScene.rotationConstants.rotMax;
    var rotIncrement = rotationData.rotIncrement;
    rotIncrement += configScene.rotationConstants.rotAcceleration * sign;

    if (Math.abs(rotIncrement) > rotMax) {
      // limit the rotation speed to rotMax
      rotIncrement = rotMax * sign;
      // console.log('Max rotation ' + sign);

    } else if (Math.abs(rotIncrement) < rotMin) { 
      // add a minimum rotation speed
      rotIncrement += rotMin * sign;
    }

    rotationData.rotIncrement = rotIncrement;
  }
  function updateSpinListener(event) { 
    // console.log('Key pressed ' + event.key)
    var name = data.keyPressLookup[event.key.toUpperCase()];
    if (!name) {
      return;
    }
    updateRotation(data.objectList[name.objectName].rotationData, name.direction);
  }

  function enableDampingListener(event) {
    var name = data.keyPressLookup[event.key.toUpperCase()];
    if (name) {
      data.objectList[name.objectName].rotationData.applyDamping = true;
    }
    data.clock.getDelta();
  }

  function getWindowSize() {
    if (configScene.fullScreen) {
      return { x: window.innerWidth, y: window.innerHeight };
    } else {
      return configScene.renderSize;
    }
  }

  function onWindowResize(){
    var size = getWindowSize();
    
    data.camera.aspect = size.x / size.y;
    data.camera.updateProjectionMatrix();

    data.renderer.setSize( size.x, size.y );
  }

  function getRandomRotation(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  function processKeypress(event) {
    if (event.key === " ") {
      // apply a random rotation to each object when the spacebar is pressed

      var rotCon = configScene.rotationConstants;
      var objectNames = Object.keys(data.objectList);

      objectNames.forEach(function(object) {
        var rotation = getRandomRotation( -rotCon.rotMax*2, rotCon.rotMax*2);
        
        data.objectList[object].rotationData.rotIncrement = rotation;
        data.objectList[object].rotationData.applyDamping = true;
      });
    }
  }

  function setupEvents() {
    window.addEventListener( "keydown", updateSpinListener, false );
    window.addEventListener( "keyup", enableDampingListener, false );
    window.addEventListener( "resize", onWindowResize, false );
    window.addEventListener( "keyup", processKeypress, false );
  }
 
  function applyRotation(object, name) {
    var sceneObj = data.scene.getObjectByName(name);  
    object.rotAngle += object.rotIncrement;
    object.rotDirection = Math.sign(object.rotIncrement); // fix/check !
    sceneObj.rotation.x = object.rotAngle;
  }

  function applyDamping(object, time) {
    var rotSpeed = Math.abs(object.rotIncrement);
  
    if (rotSpeed < configScene.rotationConstants.dampingFactor) {
      rotSpeed -= time * configScene.rotationConstants.dampingFactor2;
      object.rotIncrement = rotSpeed * object.rotDirection;
  
      if (rotSpeed < configScene.rotationConstants.dampingThreshold) {      
        object.applyDamping = false;
        object.rotIncrement = 0;
      }
    } else {
      rotSpeed -= time * configScene.rotationConstants.dampingFactor;
      object.rotIncrement = rotSpeed * object.rotDirection;
    }
    object.rotDirection = Math.sign(object.rotIncrement);
  }

  function applyRotationToList(objectList) {
    var time = data.clock.getDelta();
    var names = Object.keys(objectList);

    names.forEach(function(item) {
      applyRotation( objectList[item].rotationData, item );
  
      if (objectList[item].rotationData.applyDamping) {
        applyDamping( objectList[item].rotationData, time );
      }
    });
    
  }

  function animate() {
    data.stats.update();
    requestAnimationFrame( animate );
    
    applyRotationToList(data.objectList);
    
    data.renderer.render(data.scene, data.camera);
  }
  
  function importFile() {
    var loader = new THREE.GLTFLoader();
    loader.load( './assets/QWERT_Cubes1.gltf', function ( gltfData ) {

      var names = Object.keys(data.objectList);
      var importedScene = gltfData.scene;

      names.forEach(function(item) {

        var gltfCube = importedScene.getObjectByName(item);
        var group = data.scene.getObjectByName(item);

        if ( !gltfCube || !group ) {
          return;
        }
        
        var phongMaterial = new THREE.MeshPhongMaterial( { color: data.objectList[item].color} );
        gltfCube.material = phongMaterial;
        gltfCube.children[0].material = new THREE.MeshPhongMaterial( { emissive: 0x777759 } );
                
        group.position.copy(gltfCube.position);
        gltfCube.position.copy( new THREE.Vector3( ) );
        gltfCube.name = item + "_gltf";
        group.add(gltfCube);
      });
      // console.log(data.scene);

      data.fileImported = true;

    }, undefined, function ( error ) {  
      console.error( error );  
      data.fileImported = false;
    } );
  }

  /* **************** */
  /* application data */
  var data = {
    scene: null,
    renderer: null,
    camera: null,
    stats: null,
    clock: null,
    fileImported: false,
    datGUIData: {
      rotationZmultiplier: 1,
      rotationYmultiplier: 1,
      ambientIntensity: 1.0,
      background: 0xeeeeee,
    },
    sceneObjectsName: "letters",

    objectList: {}, // { name: { rotationData, color }}
    keyPressLookup: {},  // "letter": { objectName: "", direction: "" },
  }

  var configScene = {
    backgroundColor: 0xeeeeee,
    cameraPosition: { x: 0, y: 0, z: 18 },
    renderSize: { x: 500, y: 400 },
    // fullScreen: false,
    fullScreen: true,
    renderConfig: { antialias: true },
    pointLights: [ {
        position: { x: -8, y: 3.6, z: 6 },
        color: 0xffffff,
        intensity: .25,
        distance: 100
      }, {
        position: { x: 11, y: -3, z: 6 },
        color: 0xffffff,
        intensity: .15,
        distance: 100
      },
    ],
    rotationConstants: {
      rotAcceleration: 0.01,
      rotMin: 0.05,
      rotMax: 0.2,
      dampingFactor: 0.05,
      dampingFactor2: 0.05 * 0.75,
      dampingThreshold: 0.01,
    },
    rotationDataTemplate: { // copied to rotationData per object
      rotAngle: 0, // angle that is used to orient the object    
      rotIncrement: 0, // amount added to / subtracted from rotAngle
      rotDirection: 0, // -1, 0, 1
      applyDamping: false,
    },
    objects: [
      {
        name: "CubeQ",
        color:  0x2194ce,
        keyboardKeys: [
          { key: 'Q', direction: 1 },
          { key: 'A', direction: -1 },
        ]
      },
      {
        name: "CubeW",
        color:  0x94ce21,
        keyboardKeys: [
          { key: 'W', direction: 1 },
          { key: 'S', direction: -1 },
        ]
      },
      {
        name: "CubeE",
        color:  0xce2194,
        keyboardKeys: [
          { key: 'E', direction: 1 },
          { key: 'D', direction: -1 },
        ]
      },
      {
        name: "CubeR",
        color:  0x21ce94,
        keyboardKeys: [
          { key: 'R', direction: 1 },
          { key: 'F', direction: -1 },
        ]
      },
      {
        name: "CubeT",
        color:  0x9421ce,
        keyboardKeys: [
          { key: 'T', direction: 1 },
          { key: 'G', direction: -1 },
        ]
      }
    ]
  }

  /* *********************** */
  /* application entry point */
  function init() {

    document.body.appendChild(initStats());
    createDAT();    
    setupScene();
    
    document.body.appendChild(data.renderer.domElement);
    
    data.clock = new THREE.Clock();
    
    setupSceneObjectGroups();
    setupObjectData();
    setupKeyboardEventData();

    animate();
    
    setupEvents();
    importFile();
  }

  return {
    init: init
  }
}();