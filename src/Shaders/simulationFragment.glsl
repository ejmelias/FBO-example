uniform sampler2D positionsA;
uniform sampler2D positionsB;
uniform float uTime;
uniform float uMix;
uniform float uFrequency;

varying vec2 vUv;

void main() {
    float time = (sin(uTime * 0.45) + 1.0) * 0.5;

    vec3 davidPositions = texture2D(positionsA, vUv).rgb;
    vec3 spherePositions = texture2D(positionsB, vUv).rgb;
    
    vec3 pos = mix(spherePositions, davidPositions, time);

    gl_FragColor = vec4(pos, 1.0);
}