uniform sampler2D positionsA;
uniform sampler2D positionsB;
uniform sampler2D positionsC;
uniform float uTime;
uniform float uMix;
uniform float uFrequency;

varying vec2 vUv;

void main() {
    float time = smoothstep(0.2, 0.8, (sin(uTime * 0.25) + 1.0) * 0.5);
    float time2 = smoothstep(0.2, 0.8, (sin(uTime * 0.5) + 1.0) * 0.5);

    vec3 imagePositions = texture2D(positionsA, vUv).rgb;
    vec3 spherePositions = texture2D(positionsB, vUv).rgb;
    vec3 davidPositions = texture2D(positionsC, vUv).rgb;
    
    vec3 pos = mix(mix(davidPositions, spherePositions, time2), imagePositions, time );

    gl_FragColor = vec4(pos, 1.0);
}