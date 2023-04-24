import * as THREE from 'three';
import simulationVertex from './Shaders/simulationVertex.glsl'
import simulationFragment from './Shaders/simulationFragment.glsl'

const generateSphereSurfacePositions = (width, height) => {
    // we need to create a vec4 since we're passing the positions to the fragment shader
    // data textures need to have 4 components, R, G, B, and A
    const length = width * height * 4;
    const data = new Float32Array(length);

    // Fill Float32Array here
    for (let i = 0; i < length; i++) {
        const stride = i * 4;

        const radius = 2.5
        const u = Math.random();
        const v = Math.random();
    
        const theta = 2 * Math.PI * u; 
        const phi = Math.acos(2 * v - 1)
    
        data[stride] = radius * Math.sin(phi) * Math.cos(theta)        //x
        data[stride + 1] = radius * Math.sin(phi) * Math.sin(theta);   //y
        data[stride + 2] = radius * Math.cos(phi);                     //z
        data[stride + 3] = 1.0; // this value will not have any impact
    }

    return data;
};

const generatePlanePositions = (width, height) => {
    const length = width * height * 4;
    const data = new Float32Array(length);

    for (let i = 0; i < length; i++) {
        const stride = i * 4;
    
        const distance = Math.sqrt(Math.random()) * 2.0;
    
        data[stride] = (Math.random() - 0.5) * 20.0        //x
        data[stride + 1] = -3.0                            //y
        data[stride + 2] = (Math.random() - 0.5) * 20.0    //z
        data[stride + 3] = 1.0; // this value will not have any impact
    }
    return data;
}

const generateCubePositions = (width, height) => {
    const length = width * height * 4;
    const data = new Float32Array(length);

    for (let i = 0; i < length; i++) {
        const stride = i * 4;
    
        const distance = Math.sqrt(Math.random()) * 2.0;
        const theta = THREE.MathUtils.randFloatSpread(360); 
        const phi = THREE.MathUtils.randFloatSpread(360); 
    
        data[stride] = (Math.random() - 0.5) * 3.0;         //x
        data[stride + 1] = (Math.random() - 0.5) * 3.0;     //y
        data[stride + 2] = (Math.random() - 0.5) * 3.0;     //z
        data[stride + 3] = 1.0; // this value will not have any impact
    }
    return data;
}

const generateSpherePositions = (width, height) => {
    const length = width * height * 4;
    const data = new Float32Array(length);

    for (let i = 0; i < length; i++) {
        const stride = i * 4;
    
        const distance = Math.sqrt(Math.random()) * 2.0;
        const theta = THREE.MathUtils.randFloatSpread(360); 
        const phi = THREE.MathUtils.randFloatSpread(360); 
    
        data[stride] = distance * Math.sin(theta) * Math.cos(phi);         //x
        data[stride + 1] = distance * Math.sin(theta) * Math.sin(phi);     //y
        data[stride + 2] = distance * Math.cos(theta);                     //z
        data[stride + 3] = 1.0; // this value will not have any impact
    }
    return data;
}

// Create a custom simulation shader material
class SimulationMaterial extends THREE.ShaderMaterial {

    constructor(size, data1, data2) {
        // Create a Data Texture with our positions data
        const positionsTextureA = new THREE.DataTexture(
            data1,
            size,
            size,
            THREE.RGBAFormat,
            THREE.FloatType
        );
        positionsTextureA.needsUpdate = true;
        
        const positionsTextureB = new THREE.DataTexture(
            data2,
            size,
            size,
            THREE.RGBAFormat,
            THREE.FloatType
        );
        positionsTextureB.needsUpdate = true;

        const positionsTextureC = new THREE.DataTexture(
            generateSphereSurfacePositions(size, size),
            size,
            size,
            THREE.RGBAFormat,
            THREE.FloatType
        );
        positionsTextureC.needsUpdate = true;

        const simulationUniforms = {
            // Pass the positions Data Texture as a uniform
            positionsA: { value: positionsTextureA },
            positionsB: { value: positionsTextureB },
            positionsC: { value: positionsTextureC },
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
