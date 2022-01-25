import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://threejs.org/examples/jsm/loaders/RGBELoader.js';

var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new OrbitControls( camera, renderer.domElement );

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap; 

document.body.appendChild(renderer.domElement);
document.body.style.overflow='hidden';
scene.background = new THREE.Color( 'skyblue' );

function setEnvironment(){
    new RGBELoader()
        .setPath( './' )
        .load( 'environment.hdr', function ( texture ) {

            texture.mapping = THREE.EquirectangularReflectionMapping;

            scene.background = texture;
            scene.environment = texture;
    })
}

function setPlane(){
    const planegeometry = new THREE.PlaneGeometry( window.innerHeight*10,window.innerWidth );
    const planematerial = new THREE.MeshPhongMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( planegeometry, planematerial );

    plane.receiveShadow = true;
    scene.add( plane );

    plane.rotation.x=Math.PI/2;
    plane.position.y=0;
}


function setLight(){
    let ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
	scene.add(ambientLight);

    const pointLight = new THREE.PointLight( 0xffffff, 10, 1000 );
    pointLight.position.set( -500, 500, 500 );
    pointLight.castShadow = true;
	pointLight.shadow.camera.near = 0.1;
	pointLight.shadow.camera.far = 1000;

    pointLight.shadow.bias = -0.0001;
    pointLight.shadow.mapSize.width = 1024*4;
    pointLight.shadow.mapSize.height = 1024*4;
    scene.add( pointLight )

}

// setEnvironment()
// setPlane()
setLight()

var initPosition={}

renderer.shadowMap.enabled = true;

camera.position.set( 0, 10, 10 );

var GLTF_loader=new GLTFLoader();
GLTF_loader.load( './taixiu.glb', function(geometry)  {
    geometry.scene.position.x=0
    geometry.scene.position.y=0
    geometry.scene.position.z=0
    geometry.scene.name='taixiu'

    scene.add(geometry.scene);

    let model = scene.getObjectByName('taixiu')
    scene.getObjectByName('napday').position.y-=0.2
    initPosition.napday=scene.getObjectByName('napday').position.y
    console.log(model)


}, undefined, function ( error ) {

	console.error( error );

});


window.onresize=()=>{
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect=window.innerWidth / window.innerHeight;
}

const h=7
var vol = {monap:undefined};
var step = {
    monap: 0.06,
    quay: 0.2
}
var flags={
    daynap:true
}

var gocQuay = [,{x:1,y:2,z:1},{x:1,y:3,z:2},{x:3,y:2,z:1},{x:2,y:2,z:1},{x:1,y:3,z:1},{x:1,y:1,z:1}]

var sum=0

function hide(){
    if(sum>10) {
        document.querySelector('.big').classList.add('hide')
    }
    else {
        document.querySelector('.small').classList.add('hide')
    }

    document.querySelector('.ok').classList.add('hide')
}

function show(){
    if(sum>10) {
        document.querySelector('.big span.data').innerHTML=sum+" "
        document.querySelector('.big').classList.remove('hide')
    }
    else {
        document.querySelector('.small span.data').innerHTML=sum+" "
        document.querySelector('.small').classList.remove('hide')
    }

    document.querySelector('.ok').classList.remove('hide')
    document.querySelector('.open').classList.add('hide')
}

function resetQuay(){
    for(let i=1;i<=3;i++){
        scene.getObjectByName('xucxac_'+i).rotation.x=0;
        scene.getObjectByName('xucxac_'+i).rotation.z=0;
        scene.getObjectByName('xucxac_'+i).position.y-=0.06;
        scene.getObjectByName('xucxac_'+i).rotation.y=0;
    }
}

function moNap(){
    let y=scene.getObjectByName('napday').position.y
    if(y<vol.monap) scene.getObjectByName('napday').position.y+=step.monap;
    if(y>vol.monap-step.monap) {
        flags.monap=true
        flags.daynap=false
    }

    if(flags.khui&&flags.monap){
        flags.khui=false
        show()
    }
}

function dayNap(){
    let y=scene.getObjectByName('napday').position.y
    if(y>vol.monap) scene.getObjectByName('napday').position.y-=step.monap;
    else if(flags.quayxong && !flags.khui){
        vol.monap=undefined
        vol.quay=undefined
        flags.quayxong=false
        flags.daynap=true
        flags.monap=false
        resetQuay()

        if(flags.cankhui){
            flags.cankhui=false
            document.querySelector('.open').classList.remove('hide')
        }
    }
}

function quayCondition(){
    let y=scene.getObjectByName('napday').position.y
    if(y>vol.monap-step.monap && y<vol.monap && !flags.quayxong) return true
    else return false
}

function quay(){
    for(let i=1;i<=3;i++){
        scene.getObjectByName('xucxac_'+i).rotation.x=90;
        scene.getObjectByName('xucxac_'+i).rotation.z=-39;
        scene.getObjectByName('xucxac_'+i).position.y+=0.06;
    }
    vol.quay=40
}

function updateQuay(){
    if(vol.quay && scene.getObjectByName('xucxac_1').rotation.y<vol.quay) {
        for(let i=1;i<=3;i++){
            scene.getObjectByName('xucxac_'+i).rotation.y+=step.quay;
        }
        if(scene.getObjectByName('xucxac_1').rotation.y>vol.quay-100*step.quay && !flags.quayxong) {
            vol.monap=initPosition.napday;
            flags.quayxong=true;
        }
    }
}

function doiMat(i,n){
    let a=Math.PI/2
    let r_x,r_y,r_z
    r_x=gocQuay[n].x,r_y=gocQuay[n].y,r_z=gocQuay[n].z

    scene.getObjectByName('xucxac_'+i).rotation.x=r_x*a;
    scene.getObjectByName('xucxac_'+i).rotation.y=r_y*a;
    scene.getObjectByName('xucxac_'+i).rotation.z=r_z*a;
}

function khui(){
    vol.monap=h;
    flags.quayxong=true
    sum=0
    let n
    for(var i=1;i<=3;i++){
        n=Math.round(Math.random()*5+1)
        doiMat(i,n)
        sum+=n
    }
    flags.khui=true;

}

document.querySelector('.ok').onclick=function(){
    vol.monap=initPosition.napday
    hide()
}

document.querySelector('.open').onclick=function(){
    if(flags.daynap) {
        khui()
        flags.daynap=false
   }
}

document.querySelector('.play').onclick=()=>{
    if(!vol.monap && flags.daynap) {
        vol.monap=h
        flags.cankhui=true
    }
}

function game(){
    requestAnimationFrame(game)
    renderer.render(scene, camera)
    if(vol.monap) {
        moNap()
        if(quayCondition()) quay()
    }
    if(vol.quay) updateQuay()
    
    dayNap()

}

game()