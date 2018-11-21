var sceneData = {
  scene: null,
  renderer: null,
  camera: null,
  spotLight: null,
  ambientLight: null,
  myMesh: null,
  stats: null,
  step: 0,
  clock: null
};

var sceneObjects = { // sceneObjects.commonBoxData.
  commonBoxData: {
    sideLength: 1.25,
    rotAcceleration: 0.01,
    rotMin: 0.05,
    rotMax: 0.2,
    dampingFactor: 0.05,
    dampingFactor2: 0.05 * 0.75,
    dampingThreshold: 0.01,
  },
  templateBoxData: {
    name: null,
    sideLength: 1.25,
    color: 0xffffff,
    rotAngle: 0, // rotation angle that is used to set for the object
    rotIncrement: 0, // amount added/subtracted to/from rotAngle to change the rotation
    rotDirection: 0, // -1, 0, 1
    applyDamping: false,
    position: { x: 0, y: 0, z: 0 },
  },
  boxInits: [
    { name: "box1", positionX: 0, 
      keyboardKeys: [
        { key: 'Q', direction: 1 },
        { key: 'A', direction: -1 },
      ]
    },
    { name: "box2", positionX: 2, 
      keyboardKeys: [
        { key: 'W', direction: 1 },
        { key: 'S', direction: -1 },
      ]
    },
    { name: "box3", positionX: 4, 
      keyboardKeys: [
        { key: 'E', direction: 1 },
        { key: 'D', direction: -1 },
      ]
    },
    { name: "box4", positionX: 6,
      keyboardKeys: [
        { key: 'R', direction: 1 },
        { key: 'F', direction: -1 },
      ]
    },
    { name: "box5", positionX: 8,
      keyboardKeys: [
        { key: 'T', direction: 1 },
        { key: 'G', direction: -1 },
      ]
    },
  ],
  boxList: {}, // rename boxes later
  keyEventLookup: {
    // "letter": { objectName: "", direction: "" },
  },
};

var gltfMeshData = {
  template: { // copied to rotationData per mesh
    rotAngle: 0, // angle that is used to orient the object    
    rotIncrement: 0, // amount added/subtracted to/from rotAngle
    rotDirection: 0, // -1, 0, 1
    applyDamping: false,
  },
  
  keyEventLookup: {
    // "letter": { objectName: "", direction: "", index: "" },
  },

  meshes: [
    {
      name: "CubeQ_exp",
      position: { x: 2, y: 0, z: 0 },
      color:  0xffffff,
      rotationData: {}, // add to each
      keyboardKeys: [
        { key: 'Q', direction: 1 },
        { key: 'A', direction: -1 },
      ]
    },
    {
      name: "CubeW_exp",
      position: { x: 5, y: 0, z: 0 },
      color:  0xffffff,
      keyboardKeys: [
        { key: 'W', direction: 1 },
        { key: 'S', direction: -1 },
      ]
    },
    {
      name: "CubeE_exp",
      position: { x: 8, y: 0, z: 0 },
      color:  0xffffff,
      keyboardKeys: [
        { key: 'E', direction: 1 },
        { key: 'D', direction: -1 },
      ]
    },
    {
      name: "CubeR_exp",
      position: { x: 11, y: 0, z: 0 },
      color:  0xffffff,
      keyboardKeys: [
        { key: 'R', direction: 1 },
        { key: 'F', direction: -1 },
      ]
    },
    {
      name: "CubeT_exp",
      position: { x: 14, y: 0, z: 0 },
      color:  0xffffff,
      keyboardKeys: [
        { key: 'T', direction: 1 },
        { key: 'G', direction: -1 },
      ]
    }
  ]
};

var StoreData = {
  message: 'dat2.gui',
  speed: 0.8,
  rotationZmultiplier: 1,
  rotationYmultiplier: 1,
  cubeColor: 0xffffff * Math.random(),
  clearColor: 0xeeeeee,
  background: 0xeeeeee,
  ambientIntensity: 1.0,
  // this.cubeColor: "#00ff00";
};
