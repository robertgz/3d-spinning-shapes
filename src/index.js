function init() {
  // console.log("Using Three.js version: " + THREE.REVISION);

  let stats = initStats();
  document.body.appendChild(stats);  

  let datGUI = createDAT();
  setupScene();

  sceneData.myMesh = createMesh();
  sceneData.scene.add( sceneData.myMesh );
  
  sceneData.clock = new THREE.Clock();
  
  loadFile();
  // sceneData.scene.add( createBoxes() );

  // add the output of the renderer to the html page
  document.body.appendChild(sceneData.renderer.domElement);

  keyBoardEvents();

  animate(); // if run before loadFile has finished an error shows
}

function keyBoardEvents() {
  function updateSpin(event) { // move this outside of keyBoardEvents 
    // console.log('Key pressed ' + event.key)

    function evalRot(shape, sign) { // sign = 1 or -1
      shape.applyDamping = false;

      var commonData = sceneObjects.commonBoxData;
      var rotIncrement = shape.rotIncrement;
      rotIncrement += commonData.rotAcceleration * sign;

      if (Math.abs(rotIncrement) > commonData.rotMax) {
        // limit the rotation speed to rotMax
        rotIncrement = commonData.rotMax * sign;
        console.log('Max rotation ' + sign);

      } else if (Math.abs(rotIncrement) < commonData.rotMin) { 
        // add a minimum rotation speed
        rotIncrement += commonData.rotMin * sign;
      }

      shape.rotIncrement = rotIncrement;
    }

    var name = sceneObjects.keyEventLookup[event.key.toUpperCase()];
    if (name) {
      evalRot(sceneObjects.boxList[name.objectName], name.direction);
    }
  }

  function evalRot(shape, sign) { // sign = 1 or -1
    shape.applyDamping = false;

    var commonData = sceneObjects.commonBoxData;
    var rotIncrement = shape.rotIncrement;
    rotIncrement += commonData.rotAcceleration * sign;

    if (Math.abs(rotIncrement) > commonData.rotMax) {
      // limit the rotation speed to rotMax
      rotIncrement = commonData.rotMax * sign;
      console.log('Max rotation ' + sign);

    } else if (Math.abs(rotIncrement) < commonData.rotMin) { 
      // add a minimum rotation speed
      rotIncrement += commonData.rotMin * sign;
    }

    shape.rotIncrement = rotIncrement;
  }

  function updateSpinNEW(event) { // move this outside of keyBoardEvents 
    // console.log('Key pressed ' + event.key)
    var name = gltfMeshData.keyEventLookup[event.key.toUpperCase()];
    if (name) {
      evalRot(gltfMeshData.meshes[name.index].rotationData, name.direction);
    }
  }

  function enableDamping(event) {    
    var name = sceneObjects.keyEventLookup[event.key.toUpperCase()];
    if (name) {
      sceneObjects.boxList[name.objectName].applyDamping = true;
    }    
    sceneData.clock.getDelta();

    return;
  }

  function enableDampingNEW(event) {    
    var name = gltfMeshData.keyEventLookup[event.key.toUpperCase()];
    if (name) {
      gltfMeshData.meshes[name.index].rotationData.applyDamping = true;
      // console.log('? ' + name.index);
    } else {
      console.log('FIX');
    }

    sceneData.clock.getDelta();

    return;
  }

  // window.addEventListener("keydown", updateSpin);
  window.addEventListener("keydown", updateSpinNEW);
  // window.addEventListener("keyup", enableDamping);
  window.addEventListener("keyup", enableDampingNEW);
}

function setupScene() {
  sceneData.scene = new THREE.Scene();

  sceneData.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  sceneData.camera.position.z = 10;
  sceneData.camera.position.x = 4;

  sceneData.renderer = new THREE.WebGLRenderer();
  sceneData.renderer.setClearColor( StoreData.background );
  // renderer.setSize(window.innerWidth, window.innerHeight);
  sceneData.renderer.setSize(500, 400);

  // add lights
  sceneData.spotLight = new THREE.SpotLight( 0xffffff );
  sceneData.spotLight.position.set( -40, 60, -10 );
  sceneData.scene.add( sceneData.spotLight );
  
  sceneData.ambientLight = new THREE.AmbientLight( 0x0c0c0c, sceneData.ambientIntensity );
  sceneData.scene.add( sceneData.ambientLight ); 

  // show axes in the screen
  sceneData.scene.add(new THREE.AxesHelper(5));
  
  return sceneData.scene;
}

// function animate() {
var animate = function () {
  sceneData.stats.update();
  requestAnimationFrame( animate );
  
  var datData = StoreData;
  var object = sceneData.myMesh;
  object.rotation.z += 0.01 * datData.rotationZmultiplier;
  object.rotation.y += 0.01 * datData.rotationYmultiplier;

  sceneData.step += 0.04;
  object.position.x = 0 + ( 1 * ( Math.cos(sceneData.step) ) );  

  // applyRotationToList(sceneObjects.boxList);

  applyRotationToListNEW(gltfMeshData.meshes);
  
  sceneData.renderer.render(sceneData.scene, sceneData.camera);
}

function applyRotationToListNEW(objectList) {
  var time = sceneData.clock.getDelta();

  objectList.forEach(function(item){
    applyRotation( item.rotationData, item.name );

    if (item.rotationData.applyDamping) {
      applyDamping(item.rotationData, time);
    }
  });
}

function applyRotationToList(objectList) {
  var time = sceneData.clock.getDelta();
  for (var item in objectList) {
    // console.log(objectList[item]);
    applyRotation( objectList[item], objectList[item].name );

    if (objectList[item].applyDamping) {
      applyDamping(objectList[item], time);
    }    
  }
}

function applyRotation(object, name) {
  // Should a reference to the scene object be stored in the sceneData list of objects?

  var sceneObj = sceneData.scene.getObjectByName(name);  
  object.rotAngle += object.rotIncrement;
  object.rotDirection = Math.sign(object.rotIncrement); // fix/check !
  sceneObj.rotation.x = object.rotAngle;
}

function applyDamping(object, time) {
  var rotSpeed = Math.abs(object.rotIncrement);
  // var dampingFactor

  if (rotSpeed < sceneObjects.commonBoxData.dampingFactor) {
    rotSpeed -= time * sceneObjects.commonBoxData.dampingFactor2;
    object.rotIncrement = rotSpeed * object.rotDirection;

    if (rotSpeed < sceneObjects.commonBoxData.dampingThreshold) {      
      object.applyDamping = false;
      object.rotIncrement = 0;
    }
  } else { // if (rotSpeed > 0)
    rotSpeed -= time * sceneObjects.commonBoxData.dampingFactor;
    object.rotIncrement = rotSpeed * object.rotDirection;
  }
  object.rotDirection = Math.sign(object.rotIncrement);
}

function createMesh() {
  var sideLength = 1;
  var datData = StoreData;
  var geometry = new THREE.BoxGeometry( sideLength, sideLength, sideLength);
  // var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  // var material = new THREE.MeshLambertMaterial( { color: datData.cubeColor } );
  var material = new THREE.MeshPhongMaterial( { color: datData.cubeColor } );
  var cube = new THREE.Mesh( geometry, material);
  cube.name = "moving cube";
  
  return cube;
}

function createBoxes() {
  var group = new THREE.Group();

  console.log('Box names');
  var boxTemplateJSON = JSON.stringify(sceneObjects.templateBoxData);

  sceneObjects.boxInits.forEach(function(item) {
    sceneObjects.boxList[item.name] = JSON.parse(boxTemplateJSON);  
    sceneObjects.boxList[item.name].name = item.name;
    sceneObjects.boxList[item.name].color = 0xffffff * Math.random();
    sceneObjects.boxList[item.name].position.x = item.positionX;

    // register keys to be looked up when keys are pressed
    if (item.keyboardKeys) {
      item.keyboardKeys.forEach(function (keyData){
        sceneObjects.keyEventLookup[keyData.key] = { objectName: item.name, direction: keyData.direction };
      });
      // console.log(sceneObjects.keyEventLookup);
    }
  });
  
  for (var item in sceneObjects.boxList) {
    group.add( createBox( sceneObjects.boxList[item] ) );
  }

  return group;
}

function createBoxData() {

}

function createBox(boxData, positionX) { // creates THREEjs mesh
  var sideLength = sceneObjects.commonBoxData.sideLength;
  var geometry = new THREE.BoxGeometry( sideLength, sideLength, sideLength );
  var material = new THREE.MeshPhongMaterial( { color: boxData.color } );
  var box = new THREE.Mesh( geometry, material );
  box.name = boxData.name;
  box.position.x = boxData.position.x;

  return box;
}

function loadFile() {
  var loader = new THREE.GLTFLoader();

  // loader.load( './assets/Box.gltf', function ( gltfData ) {
  loader.load( './assets/QWERT_Cubes.gltf', function ( gltfData ) {
    console.log('QWERT_Cubes.gltf loaded');
    // console.log(gltfData);
    // console.log(gltfData.scene);

    // let scale = 25.0;
    // let scale = 1.0;
    // gltfData.scene.scale.x = scale;
    // gltfData.scene.scale.y = scale;
    // gltfData.scene.scale.y = scale;
    // sceneData.scene.add( gltfData.scene );

    // console.log('sceneData.scene');
    // console.log(sceneData.scene);
       
    var meshes = buildMeshes(sceneData.scene, gltfData.scene);
    sceneData.scene.add(meshes);
    // animate();
  
  }, undefined, function ( error ) {  
    console.error( error );  
  } );
}

function buildMeshes(existingScene, importedScene) {
  var meshGroup = new THREE.Group();
  var phongMaterial = new THREE.MeshPhongMaterial( { color: 0x550000, emissive: 0x000055 } );
  //, specular: 0xffffff, shininess: 50

  gltfMeshData.meshes.forEach(function (item, index) {
    // console.log(item.name);
    var mesh = importedScene.getObjectByName(item.name);
    if (!mesh) {
      return;
    }

    mesh.position.x = item.position.x;
    mesh.position.y = item.position.y;
    mesh.position.z = item.position.z;
    mesh.material = phongMaterial;
    // console.log(mesh);
    // sceneData.boxes[item.name] = {};

    // register keys to be looked up when keys are pressed
    if (item.keyboardKeys) {
      item.keyboardKeys.forEach(function (keyData){
        gltfMeshData.keyEventLookup[keyData.key] = { objectName: item.name, direction: keyData.direction, index: index };
      });
      // console.log(sceneObjects.keyEventLookup);
    }

    // data to be updated to spin the shapes
    item.rotationData = JSON.parse(JSON.stringify(gltfMeshData.template));

    meshGroup.add(mesh);
  });

  return meshGroup;
}

function createDAT() {
  var datData = StoreData;
  var gui = new dat.GUI();
  gui.add(datData, 'rotationZmultiplier', -25, 25).step(1);
  gui.add(datData, 'rotationYmultiplier', -25, 25, 1);
  gui.add(datData, 'ambientIntensity', -1, 50, 1).onChange(function (e) {
      sceneData.ambientLight.intensity = e ;
  });
  gui.addColor(datData, 'cubeColor').onChange(function (e) {
    if (sceneData.myMesh !== null) {
      sceneData.myMesh.material.color.setHex( e );
    }    
  });
  gui.addColor(datData, 'background').onChange(function (e) {
      sceneData.renderer.setClearColor( e );
  });

  return gui;
}

function initStats() {
  var stats = sceneData.stats = new Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';

  return stats.domElement;
} 

// issues
/*
  when browser is restored after minamizing a stopped cube is spinning
  the boxes slow down at different rates, this may be due to them using the same clock

*/