import { extend, createPortal, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState } from "react";
import { useFBO, OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import { useControls } from 'leva';
import * as THREE from 'three';
import SimulationMaterial from "./SimulationMaterial";
import fragment from './Shaders/fragment.glsl';
import vertex from './Shaders/vertex.glsl';

extend({ SimulationMaterial });

function Particles() {

    //image based data, loaded as a texture
    const texture = useTexture('./noise.jpg');
    const canvas = document.createElement("canvas");
    canvas.width = texture.image.width;
    canvas.height = texture.image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(texture.image, 0, 0)
    const imgData = ctx.getImageData(0, 0, texture.image.width, texture.image.height);
    const iData = imgData.data;

    const size = texture.image.width; //only set up for square images right now
    const length = size * size;
    const data1 = new Float32Array( length * 4 );
    for ( var i = 0; i < length; i++ ) {
        var i4 = i * 4;
        data1[ i4 ]     = ( ( i % canvas.width ) - canvas.width  * .5 ) * 0.07;
        data1[ i4 + 1 ] = ((( iData[i4] / 0xFF * 0.299 +iData[i4+1]/0xFF * 0.587 + iData[i4+2] / 0xFF * 0.114 ) * 64) * 0.07) - 2;
        data1[ i4 + 2 ] = ( parseInt( i / canvas.width ) - canvas.height * .5 ) * 0.07;
        data1[ i4 + 3 ] = 1.0
    }


    // load the model and get the vertex data
    const {nodes} = useGLTF('./david.glb');
    const vertices = nodes.david.geometry.attributes.position.array;
    const total = vertices.length;
    //const size = parseInt( Math.sqrt( total) );  //size is being used from the image above, so there may be more or less particles than the actual vertex count of the model
    const data2 = new Float32Array( size * size * 4 );
    for( var i = 0; i < total; i++ ) {
        const i3 = i * 3;
        const i4 = i * 4;
        data2[i4    ] = vertices[i3    ] / 30; //division is just to resize the model
        data2[i4 + 1] = vertices[i3 + 1] / 30;
        data2[i4 + 2] = vertices[i3 + 2] / 30;
        data2[i4 + 3] = 1.0; //need extra value for the simulation fragment shader, but it wont be used.
    }

    // This reference gives us direct access to our points
    const points = useRef();
    const simulationMaterialRef = useRef();

    // Create a camera and a scene for our FBO
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1 );

    // Create a simple square geometry with custom uv and positions attributes
    const positions = new Float32Array([ -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0, ]);
    const uvs = new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]);

    // Create our FBO render target
    const renderTarget = useFBO(size, size, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        type: THREE.FloatType,
    });

    // Generate a "buffer" of vertex of size "size" with normalized coordinates
    const particlesPosition = useMemo(() => {
        const length = size * size;
        const particles = new Float32Array(length * 3);
        for (let i = 0; i < length; i++) {
            let i3 = i * 3;
            particles[i3 + 0] = (i % size) / size;
            particles[i3 + 1] = i / size / size;
        }
        return particles;
    }, [size]);

    const uniforms = useMemo(() => ({
        uPositions: {
            value: null,
        },
        uTime: {value: 1.0, },
    }),[]);

    useFrame((state, delta) => {
        const { gl } = state;

        // Set the current render target to our FBO
        gl.setRenderTarget(renderTarget);
        gl.clear();
        // Render the simulation material with square geometry in the render target
        gl.render(scene, camera);
        // Revert to the default render target
        gl.setRenderTarget(null);

        // Read the position data from the texture field of the render target
        // and send that data to the final shaderMaterial via the `uPositions` uniform
        points.current.material.uniforms.uPositions.value = renderTarget.texture;

        points.current.rotation.y += delta * 0.5;
        simulationMaterialRef.current.uniforms.uTime.value += delta;

        points.current.material.uniforms.uTime.value += delta;
    });

    return (
        <>
            <OrbitControls/>
            {/* Render off-screen our simulation material and square geometry */}
            {createPortal(
                <mesh>
                    <simulationMaterial ref={simulationMaterialRef} args={[size, data1, data2]} />
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={positions.length / 3}
                            array={positions}
                            itemSize={3}
                        />
                        <bufferAttribute
                            attach="attributes-uv"
                            count={uvs.length / 2}
                            array={uvs}
                            itemSize={2}
                        />
                    </bufferGeometry>
                </mesh>,
                scene
            )}
            <points ref={points} >
                <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particlesPosition.length / 3}
                    array={particlesPosition}
                    itemSize={3}
                />
                </bufferGeometry>
                <shaderMaterial
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    fragmentShader={fragment}
                    vertexShader={vertex}
                    uniforms={uniforms}
                    transparent
                />
            </points>
        </>
    );
}
export default Particles;
