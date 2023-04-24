uniform float uTime;

vec3 HueShift (vec3 Color, float Shift)
{
    vec3 P = vec3(0.55735)*dot(vec3(0.55735),Color);
    vec3 U = Color-P;
    vec3 V = cross(vec3(0.55735),U);    
    Color = U*cos(Shift*6.2832) + V*sin(Shift*6.2832) + P;
    return vec3(Color);
}

void main() {
    vec3 color = vec3(0.34, 0.53, 0.96);
    color = HueShift(color, sin(uTime * 0.2));

    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 3.0);

    color = mix(vec3(0.0), color, strength);
    gl_FragColor = vec4(color, strength);
}