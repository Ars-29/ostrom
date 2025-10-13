uniform sampler2D uTexture;
varying float vAlpha;

void main() {
  vec4 tex = texture2D(uTexture, gl_PointCoord);
  gl_FragColor = vec4(tex.rgb, tex.a * vAlpha);

  if (gl_FragColor.a < 0.1) discard;
}
