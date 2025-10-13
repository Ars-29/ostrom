uniform sampler2D uTexture;
uniform sampler2D uMask;
uniform float uProgress;

varying vec2 vUv;

void main() {
    vec4 maskColor = texture2D(uMask, vUv);
    float maskValue = smoothstep(0.0, 1.0, maskColor.r + uProgress);

    vec4 textureColor = texture2D(uTexture, vUv);
    gl_FragColor = mix(vec4(0.0, 0.0, 0.0, 0.0), textureColor, maskValue);
}
