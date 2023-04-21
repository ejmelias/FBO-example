import * as THREE from 'three';
import simulationVertex from './Shaders/simulationVertex.glsl'
import simulationFragment from './Shaders/simulationFragment.glsl'

const generatePositions = (width, height) => {
    // we need to create a vec4 since we're passing the positions to the fragment shader
    // data textures need to have 4 components, R, G, B, and A
    const length = width * height * 4;
    const data = new Float32Array(length);

    // Fill Float32Array here
    for (let i = 0; i < length; i++) {
        const stride = i * 4;
    
        const distance = Math.sqrt(Math.random()) * 2.0;
        const theta = THREE.MathUtils.randFloatSpread(360); 
        const phi = THREE.MathUtils.randFloatSpread(360); 
    
        data[stride] =  distance * Math.sin(theta) * Math.cos(phi)          //x
        data[stride + 1] =  distance * Math.sin(theta) * Math.sin(phi);     //y
        data[stride + 2] =  distance * Math.cos(theta);                     //z
        data[stride + 3] =  1.0; // this value will not have any impact
    }

    return data;

};


const generateSpherePositions = (width, height) => {
    const length = width * height * 4;
    const data = new Float32Array(length);

    for (let i = 0; i < length; i++) {
        const stride = i * 4;
    
        const distance = Math.sqrt(Math.random()) * 2.0;
        const theta = THREE.MathUtils.randFloatSpread(360); 
        const phi = THREE.MathUtils.randFloatSpread(360); 
    
        data[stride] =  distance * Math.sin(theta) * Math.cos(phi)          //x
        data[stride + 1] =  distance * Math.sin(theta) * Math.sin(phi);     //y
        data[stride + 2] =  distance * Math.cos(theta);                     //z
        data[stride + 3] =  1.0; // this value will not have any impact
    }
    return data;
}
	
function parseMesh(g){
 
    var vertices = g.vertices;
    var total = vertices.length;
    var size = parseInt( Math.sqrt( total * 3 ) + .5 );
    var data = new Float32Array( size*size*3 );
    for( var i = 0; i < total; i++ ) {
        data[i * 3] = vertices[i].x;
        data[i * 3 + 1] = vertices[i].y;
        data[i * 3 + 2] = vertices[i].z;
    }
    return data;
}

// Create a custom simulation shader material
class SimulationMaterial extends THREE.ShaderMaterial {

    constructor(size, data) {
        console.log(data);
        // Create a Data Texture with our positions data
        const positionsTextureA = new THREE.DataTexture(
            data,
            size,
            size,
            THREE.RGBAFormat,
            THREE.FloatType
        );
        positionsTextureA.needsUpdate = true;
        
        const positionsTextureB = new THREE.DataTexture(
            generateSpherePositions(size, size),
            size,
            size,
            THREE.RGBAFormat,
            THREE.FloatType
        );
        positionsTextureB.needsUpdate = true;

        const simulationUniforms = {
            // Pass the positions Data Texture as a uniform
            positionsA: { value: positionsTextureA },
            positionsB: { value: positionsTextureB },
            uFrequency: { value: 0.25 },
            uMix: { value: 0 },
            uTime: { value: 0 },
        };

        super({
            uniforms: simulationUniforms,
            vertexShader: simulationVertex,
            fragmentShader: simulationFragment,
        });
    }
}

export default SimulationMaterial;
