function init() {
  // console.log("Using Three.js version: " + THREE.REVISION);

  let stats = initStats();
  document.body.appendChild(stats);  

  let datGUI = createDAT();
  setupScene();
  
  sceneData.clock = new THREE.Clock();

  loadFile2();

  keyBoardEvents();

  // add the output of the renderer to the html page
  document.body.appendChild(sceneData.renderer.domElement);
  
  // animate(); // if run before loadFile has finished an error shows
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

  function updateSpin(event) { // move this outside of keyBoardEvents 
    // console.log('Key pressed ' + event.key)
    var name = gltfMeshData.keyEventLookup[event.key.toUpperCase()];
    if (name) {
      evalRot(gltfMeshData.meshes2[name.index].rotationData, name.direction);
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

  function enableDamping(event) {    
    var name = gltfMeshData.keyEventLookup[event.key.toUpperCase()];
    if (name) {
      gltfMeshData.meshes2[name.index].rotationData.applyDamping = true;
    } else {
      console.log('FIX');
    }

    sceneData.clock.getDelta();

    return;
  }

  window.addEventListener("keydown", updateSpin);
  window.addEventListener("keyup", enableDamping);
}

function setupScene() {
  sceneData.scene = new THREE.Scene();

  sceneData.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  sceneData.camera.position.x = 0;
  sceneData.camera.position.y = 0;
  sceneData.camera.position.z = 15;

  sceneData.renderer = new THREE.WebGLRenderer( { antialias: true } ); //
  sceneData.renderer.setClearColor( StoreData.background );
  // renderer.setSize(window.innerWidth, window.innerHeight);
  sceneData.renderer.setSize(500, 400);

  // add lights
  // sceneData.ambientLight = new THREE.AmbientLight( 0x0c0c0c, sceneData.ambientIntensity );
  // sceneData.scene.add( sceneData.ambientLight ); 

  sceneData.pointLight1 = new THREE.PointLight( 0xffffff, .25, 100 );
  sceneData.pointLight1.position.set( -8, 3.6, 6 );
  sceneData.scene.add( sceneData.pointLight1 );

  sceneData.pointLight2 = new THREE.PointLight( 0xffffff, .15, 100 );
  sceneData.pointLight2.position.set( 11, -3, 6 );
  sceneData.scene.add( sceneData.pointLight2 );

  // show axes in the screen
  sceneData.scene.add(new THREE.AxesHelper(5));
  
  return sceneData.scene;
}

var animate = function () {
  sceneData.stats.update();
  requestAnimationFrame( animate );
  
  sceneData.step += 0.04;
  
  applyRotationToList(gltfMeshData.meshes2);
  
  sceneData.renderer.render(sceneData.scene, sceneData.camera);
}

function applyRotationToList(objectList) {
  var time = sceneData.clock.getDelta();

  objectList.forEach(function(item){
    applyRotation( item.rotationData, item.name );

    if (item.rotationData.applyDamping) {
      applyDamping(item.rotationData, time);
    }
  });
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

function loadFile2() {
  var loader = new THREE.GLTFLoader();
  loader.load( './assets/QWERT_Cubes1.gltf', function ( gltfData ) {

    var letterCubes = gltfData.scene.getObjectByName("Original_Empty001");
    
    prepImportedScene(sceneData.scene, letterCubes);
    sceneData.scene.add( letterCubes );
    animate();

  }, undefined, function ( error ) {  
    console.error( error );  
  } );
}

function prepImportedScene(existingScene, importedScene) {

  gltfMeshData.meshes2.forEach(function (item, index) {
    var mesh = importedScene.getObjectByName(item.name);
    if (!mesh) {
      return;
    }

    var phongMaterial = new THREE.MeshPhongMaterial( { color: item.color} ); 
    mesh.material = phongMaterial;

    mesh.children[0].material = new THREE.MeshPhongMaterial( 
      { emissive: 0x777759 } );

    // register keys to be looked up when keys are pressed
    if (item.keyboardKeys) {
      item.keyboardKeys.forEach(function (keyData){
        gltfMeshData.keyEventLookup[keyData.key] = { objectName: item.name, direction: keyData.direction, index: index };
      });
    }

    // data to be updated to spin the shapes
    item.rotationData = JSON.parse(JSON.stringify(gltfMeshData.template));
  });
}

function createDAT() {
  var datData = StoreData;
  var gui = new dat.GUI();
  gui.add(datData, 'rotationZmultiplier', -25, 25).step(1);
  gui.add(datData, 'rotationYmultiplier', -25, 25, 1);
  gui.add(datData, 'ambientIntensity', -1, 50, 1).onChange(function (e) {
      sceneData.ambientLight.intensity = e ;
  });
  // gui.addColor(datData, 'cubeColor').onChange(function (e) {
  //   if (sceneData.myMesh !== null) {
  //     sceneData.myMesh.material.color.setHex( e );
  //   }    
  // });
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