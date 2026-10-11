import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const U = 9, FLAT = 0.55;
const at = (sx, sy) => [(sx - 960) / U, (sy - 540) / (U * FLAT)];

export const SYSTEM = [
  { name: 'Sedna', p: at(960, 140), r: 1.7, tex: 'ceres', tint: '#9a5a44', atmo: '#c9785a' },
  { name: 'Ceres', p: at(780, 312), r: 1.5, tex: 'ceres', tint: '#a07f5c' },
  { name: 'Phobos', p: at(1240, 278), r: 1.3, tex: 'ceres', tint: '#8c7c62', lumpy: true },
  { name: 'Mars', p: at(1160, 362), r: 2.4, tex: 'mars', tint: '#ffffff', atmo: '#e08a5e' },
  { name: 'Eris', p: at(1415, 350), r: 1.9, tex: 'eris', tint: '#e2b6c2', atmo: '#d7a0c8' },
  { name: 'Deimos', p: at(1035, 405), r: 1.6, kind: 'infested', c: ['#e0832a', '#3a160a', '#ffd36a'], atmo: '#ff8a3a' },
  { name: 'Earth', p: at(1210, 540), r: 2.9, tex: 'earth', clouds: true, tint: '#ffffff', atmo: '#7fbfff', night: true },
  { name: 'Lua', p: at(1290, 560), r: 1.1, tex: 'moon', tint: '#d8d8de', frame: true },
  { name: 'Pluto', p: at(1600, 535), r: 2.0, tex: 'eris', tint: '#d6e4ff', atmo: '#b8d4ff' },
  { name: 'Jupiter', p: at(580, 535), r: 5.0, tex: 'jupiter', tint: '#ffffff', atmo: '#f0d2a8' },
  { name: 'Europa', p: at(435, 540), r: 1.6, kind: 'ice', c: ['#d9d3a8', '#2f4a48', '#f4f0d8'], atmo: '#cfe8d8' },
  { name: 'Mercury', p: at(845, 635), r: 1.8, tex: 'moon', tint: '#e0b86c' },
  { name: 'Venus', p: at(1040, 718), r: 2.6, tex: 'venus', tint: '#f6c88a', atmo: '#f5c27a' },
  { name: 'Saturn', p: at(690, 800), r: 3.4, tex: 'saturn', tint: '#ffffff', atmo: '#f0dcae', ring: true },
  { name: 'Uranus', p: at(955, 920), r: 3.0, tex: 'uranus', tint: '#eaf8ff', atmo: '#c4f1ff', ringThin: true, tilt: 1.45 },
  { name: 'Neptune', p: at(1395, 840), r: 3.0, tex: 'uranus', tint: '#4a72e8', atmo: '#6f96ff' },
  { name: 'Void', p: at(270, 545), r: 2.2, special: 'rift' },
  { name: 'Zariman', p: at(245, 370), r: 2.0, special: 'zariman', late: true },
  { name: 'Kuva Fortress', p: at(250, 765), r: 1.7, special: 'fortress', moving: true },
  { name: 'Veil Proxima', p: at(1760, 190), r: 2.4, special: 'nebula' },
  { name: 'Duviri', p: at(1720, 330), r: 1.9, kind: 'cloud', c: ['#e48ec4', '#6e3360', '#ffd6ef'], atmo: '#ff9ad6' },
  { name: 'Höllvania', p: at(1660, 790), r: 1.7, kind: 'city', c: ['#5b3c6c', '#170e21', '#ff6eb4'], atmo: '#c86bff' },
  { name: 'Sanctuary', p: at(470, 960), r: 1.2, kind: 'holo', c: ['#bfeaff', '#3a6a88', '#ffffff'], atmo: '#9fe2ff' },
];

const KIND = { infested: 4, ice: 3, cloud: 7, city: 8, holo: 9 };
const WRECKS = ['Jupiter', 'Saturn', 'Earth', 'Mars', 'Venus', 'Uranus', 'Neptune', 'Ceres', 'Pluto', 'Mercury', 'Jupiter', 'Saturn'];

const NOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){float f=0.0;float a=0.5;for(int i=0;i<5;i++){f+=a*snoise(p);p*=2.03;a*=0.5;}return f;}
`;

const PLANET_VS = `
varying vec3 vObjN;varying vec3 vWorldN;varying vec3 vWorldPos;varying vec2 vUv;
void main(){vUv=uv;vObjN=normal;vWorldN=normalize(mat3(modelMatrix)*normal);vec4 wp=modelMatrix*vec4(position,1.0);vWorldPos=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}
`;

const LIGHT = `
  vec3 V=normalize(cameraPosition-vWorldPos);float fr=pow(1.0-max(dot(N,V),0.0),2.6);
  vec3 lit=col*(0.07+1.05*pow(lam,0.8));
  lit+=col*emit+emitCol*emit*0.25;
  lit+=emitCol*night*(1.0-smoothstep(0.0,0.2,lam));
  lit+=uAtmo*fr*uAtmoStr*(0.15+lam*1.1);
  gl_FragColor=vec4(lit,1.0);
`;

const TEX_FS = `
uniform sampler2D uMap;uniform sampler2D uClouds;uniform float uHasClouds;uniform float uNight;uniform vec3 uTint;uniform float uMono;uniform vec3 uAtmo;uniform float uAtmoStr;uniform float uTime;
varying vec3 vObjN;varying vec3 vWorldN;varying vec3 vWorldPos;varying vec2 vUv;
${NOISE}
void main(){
  vec3 N=normalize(vWorldN);vec3 Vc=normalize(cameraPosition-vWorldPos);vec3 L=normalize(normalize(-vWorldPos)*0.45+Vc*0.6+vec3(-0.25,0.35,0.0));float lam=max(dot(N,L),0.0);
  vec3 base=texture2D(uMap,vUv).rgb;
  float lum=dot(base,vec3(0.299,0.587,0.114));
  vec3 col=mix(base,vec3(lum)*1.25,uMono)*uTint;
  float emit=0.0;vec3 emitCol=vec3(1.0,0.78,0.45);float night=0.0;
  if(uHasClouds>0.5){float land=step(0.12,base.r+base.g-base.b*1.2);col=mix(col,vec3(0.62,0.27,0.2)*(0.6+lum*1.4),land*0.75);
    float c=texture2D(uClouds,vUv+vec2(uTime*0.002,0.0)).r;col=mix(col,vec3(1.0),c*0.8);night=uNight*land*(1.0-c)*smoothstep(0.55,0.85,snoise(normalize(vObjN)*24.0))*1.4;}
  ${LIGHT}
}
`;

const PROC_FS = `
uniform int uKind;uniform vec3 uA;uniform vec3 uB;uniform vec3 uC;uniform vec3 uAtmo;uniform float uAtmoStr;uniform float uSeed;uniform float uTime;
varying vec3 vObjN;varying vec3 vWorldN;varying vec3 vWorldPos;varying vec2 vUv;
${NOISE}
void main(){
  vec3 n=normalize(vObjN);vec3 p=n*2.0+uSeed;vec3 col=uA;float emit=0.0;vec3 emitCol=uC;float night=0.0;
  vec3 N=normalize(vWorldN);vec3 Vc=normalize(cameraPosition-vWorldPos);vec3 L=normalize(normalize(-vWorldPos)*0.45+Vc*0.6+vec3(-0.25,0.35,0.0));float lam=max(dot(N,L),0.0);
  if(uKind==3){float h=fbm(p*1.6);col=mix(uB,uA,smoothstep(-0.4,0.5,h+n.x*0.6));float cr=1.0-smoothstep(0.0,0.03,abs(fbm(p*3.2)));col=mix(col,uB*0.6,cr*0.7);col=mix(col,uC,smoothstep(0.3,0.8,fbm(p*5.0))*0.25);}
  else if(uKind==4){float h=fbm(p*2.2+uTime*0.006);float v=1.0-smoothstep(0.0,0.07,abs(snoise(p*4.5+uTime*0.01)));float blob=smoothstep(0.1,0.5,fbm(p*3.0+7.0));col=mix(uB,uA,h*0.5+0.55);col=mix(col,uC,blob*0.6);col=mix(col,uB*0.5,v*0.8);emit=blob*0.35;}
  else if(uKind==7){float w=fbm(p*1.4+vec3(fbm(p*2.0+uTime*0.01)));col=mix(uB,uA,w*0.5+0.55);col=mix(col,uC,smoothstep(0.15,0.85,w)*0.55);}
  else if(uKind==8){float h=fbm(p*2.0);col=mix(uB,uA,h*0.5+0.5);float lights=smoothstep(0.45,0.8,snoise(p*20.0))*smoothstep(-0.2,0.3,fbm(p*3.0));night=lights*1.6+0.08;emit=0.04;}
  else{float sl=smoothstep(0.82,1.0,sin(n.y*70.0+uTime*2.5));float grid=1.0-smoothstep(0.0,0.05,abs(fract(atan(n.z,n.x)*3.0)-0.5));col=uA*0.35+uC*sl*0.5+uA*grid*0.3;emit=0.55;}
  ${LIGHT}
}
`;

const HALO_VS = `varying vec3 vWorldN;varying vec3 vWorldPos;void main(){vWorldN=normalize(mat3(modelMatrix)*normal);vec4 wp=modelMatrix*vec4(position,1.0);vWorldPos=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}`;
const HALO_FS = `uniform vec3 uAtmo;uniform float uStr;varying vec3 vWorldN;varying vec3 vWorldPos;
void main(){vec3 V=normalize(cameraPosition-vWorldPos);float f=pow(max(dot(normalize(vWorldN),-V),0.0),3.0);vec3 L=normalize(-vWorldPos);float lam=0.3+0.7*max(dot(normalize(vWorldN),L)*0.5+0.5,0.0);gl_FragColor=vec4(uAtmo*f*uStr*lam,f*uStr*lam);}`;

const RING_VS = `varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const RING_FS = `uniform sampler2D uMap;uniform float uIn;uniform float uOut;uniform float uAlpha;varying vec3 vPos;
void main(){float r=(length(vPos.xy)-uIn)/(uOut-uIn);vec4 t=texture2D(uMap,vec2(clamp(r,0.0,1.0),0.5));gl_FragColor=vec4(t.rgb,t.a*uAlpha);}`;

const NEBULA_VS = `varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const NEBULA_FS = `
varying vec3 vDir;
${NOISE}
void main(){vec3 d=normalize(vDir);float n1=fbm(d*1.8+vec3(3.0));float n2=fbm(d*3.2+vec3(11.0));float n3=fbm(d*6.0+vec3(5.0));
vec3 c=vec3(0.020,0.045,0.060);
c+=vec3(0.06,0.17,0.22)*smoothstep(-0.3,0.6,n1);
c+=vec3(0.05,0.11,0.20)*smoothstep(0.0,0.7,n2)*0.8;
c=mix(c,vec3(0.012,0.016,0.018),smoothstep(0.15,0.55,n3)*0.55);
c+=vec3(0.10,0.07,0.05)*smoothstep(0.35,0.8,n1*n2*2.2)*0.6;
gl_FragColor=vec4(c,1.0);}
`;

const store = () => (window.Alpine ? window.Alpine.store('wf') : null);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const raw = (hex) => new THREE.Color(hex).convertLinearToSRGB();

function canvasTex(size, draw) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const glowTex = (stops) => canvasTex(256, (g, s) => {
  const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr;
  g.fillRect(0, 0, s, s);
});
const additive = (map, opacity = 1) => new THREE.SpriteMaterial({ map, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity });

function start() {
  const host = document.getElementById('chart');
  const labelLayer = document.getElementById('chart-labels');
  if (!host) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    host.classList.add('no-webgl');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x03070a, 1);
  host.prepend(renderer.domElement);

  const loader = new THREE.TextureLoader();
  const texCache = {};
  const tex = (name, ext = 'jpg') => {
    if (!texCache[name]) {
      texCache[name] = loader.load(`media/planets/${name}.${ext}`);
      texCache[name].anisotropy = 4;
    }
    return texCache[name];
  };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 4000);
  const HOME = { base: new THREE.Vector3(0, 118, 168), pos: new THREE.Vector3(0, 118, 168), target: new THREE.Vector3(0, 0, 4) };
  camera.position.copy(HOME.pos);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(HOME.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.screenSpacePanning = false;
  controls.minDistance = 6;
  controls.maxDistance = 520;
  controls.maxPolarAngle = 1.38;
  controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
  controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE };
  controls.zoomToCursor = true;
  let moved = false;
  controls.addEventListener('start', () => { moved = true; });

  scene.add(new THREE.HemisphereLight(0xcfe0ee, 0x2a1a14, 1.4), new THREE.PointLight(0xffe6c8, 2.5, 0, 0));

  const nebula = new THREE.Mesh(new THREE.SphereGeometry(1800, 48, 32), new THREE.ShaderMaterial({ vertexShader: NEBULA_VS, fragmentShader: NEBULA_FS, side: THREE.BackSide, depthWrite: false }));
  scene.add(nebula);

  const starGeo = new THREE.BufferGeometry();
  const N = 4000, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, rr = 1100 + Math.random() * 500;
    const s = Math.sqrt(1 - u * u);
    pos.set([rr * s * Math.cos(th), rr * u, rr * s * Math.sin(th)], i * 3);
    const b = 0.25 + Math.random() * 0.5;
    col.set([b * 0.85, b * 0.95, b], i * 3);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 1.3, sizeAttenuation: false, vertexColors: true, depthWrite: false })));

  const grid = new THREE.Group();
  const dashMat = new THREE.LineDashedMaterial({ color: 0x9fc6cf, dashSize: 0.5, gapSize: 1.1, transparent: true, opacity: 0.16, depthWrite: false });
  [16, 30, 46, 62, 78, 94, 112].forEach((d) => {
    const pts = [];
    for (let i = 0; i <= 240; i++) { const t = (i / 240) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t) * d, 0, Math.sin(t) * d * 0.92)); }
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), dashMat);
    l.computeLineDistances();
    grid.add(l);
  });
  const spokeMat = new THREE.LineBasicMaterial({ color: 0xb8d6dc, transparent: true, opacity: 0.08, depthWrite: false });
  for (let i = 0; i < 16; i++) {
    const t = (i / 16) * Math.PI * 2;
    grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(t) * 4, 0, Math.sin(t) * 4), new THREE.Vector3(Math.cos(t) * 150, 0, Math.sin(t) * 150)]), spokeMat));
  }
  scene.add(grid);

  const sun = new THREE.Group();
  sun.add(new THREE.Mesh(new THREE.SphereGeometry(1.6, 32, 16), new THREE.MeshBasicMaterial({ color: 0xfff1d6 })));
  const sunGlow = new THREE.Sprite(additive(glowTex([[0, 'rgba(255,236,200,1)'], [0.15, 'rgba(255,170,80,0.8)'], [0.45, 'rgba(230,110,40,0.2)'], [1, 'rgba(200,80,30,0)']])));
  sunGlow.scale.set(18, 18, 1);
  const sunHalo = new THREE.Sprite(additive(glowTex([[0, 'rgba(255,190,120,0.35)'], [0.4, 'rgba(220,120,60,0.08)'], [1, 'rgba(0,0,0,0)']])));
  sunHalo.scale.set(70, 70, 1);
  const sunStreak = new THREE.Sprite(additive(glowTex([[0, 'rgba(255,220,170,0.9)'], [0.3, 'rgba(255,170,100,0.25)'], [1, 'rgba(0,0,0,0)']]), 0.8));
  sunStreak.scale.set(46, 1.6, 1);
  sun.add(sunGlow, sunHalo, sunStreak);
  scene.add(sun);

  const planets = new Map();
  const hitMeshes = [];
  const sphereGeo = new THREE.SphereGeometry(1, 96, 64);
  const lateObjects = [];

  function halo(group, r, color) {
    const h = new THREE.Mesh(sphereGeo, new THREE.ShaderMaterial({ uniforms: { uAtmo: { value: new THREE.Color(color) }, uStr: { value: 0.9 } }, vertexShader: HALO_VS, fragmentShader: HALO_FS, side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    h.scale.setScalar(r * 1.16);
    group.add(h);
  }

  function wisps(group, color, count, span, height, strands) {
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false });
    const root = new THREE.Group();
    for (let k = 0; k < count; k++) {
      const pts = [];
      const x0 = (Math.random() - 0.5) * span;
      for (let i = 0; i <= 6; i++) pts.push(new THREE.Vector3(x0 + Math.sin(i * 1.3 + k) * span * 0.18 + (Math.random() - 0.5) * span * 0.08, (i / 6 - 0.5) * height, (Math.random() - 0.5) * 0.6));
      const base = new THREE.CatmullRomCurve3(pts).getPoints(80);
      for (let s2 = 0; s2 < strands; s2++) {
        const j = (s2 - strands / 2) * 0.05;
        let w = 0;
        const line = base.map((q, i) => { w += (Math.random() - 0.5) * 0.05; return new THREE.Vector3(q.x + j + w + Math.sin(i * 0.3 + s2 * 1.7) * 0.18 * Math.sin(i / 80 * Math.PI), q.y + Math.sin(i * 0.2 + s2) * 0.05, q.z + (Math.random() - 0.5) * 0.05); });
        root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(line), mat));
      }
    }
    group.add(root);
    return root;
  }

  function makeVoid(group, p) {
    const core = new THREE.Sprite(additive(glowTex([[0, 'rgba(245,250,255,1)'], [0.15, 'rgba(170,200,255,0.6)'], [1, 'rgba(0,0,0,0)']])));
    core.scale.set(p.r * 2.2, p.r * 2.2, 1);
    const streak = new THREE.Sprite(additive(glowTex([[0, 'rgba(240,246,255,1)'], [0.2, 'rgba(160,190,255,0.55)'], [1, 'rgba(0,0,0,0)']]), 1));
    streak.scale.set(p.r * 16, p.r * 0.38, 1);
    const streak2 = new THREE.Sprite(additive(glowTex([[0, 'rgba(150,180,255,0.5)'], [0.4, 'rgba(90,120,220,0.12)'], [1, 'rgba(0,0,0,0)']]), 0.9));
    streak2.scale.set(p.r * 28, p.r * 1.3, 1);
    const hazeT = canvasTex(256, (g, s2) => {
      g.translate(s2 / 2, s2 / 2);
      g.scale(1, 0.4);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, s2 / 2);
      gr.addColorStop(0, 'rgba(120,160,230,0.35)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.beginPath();
      g.arc(0, 0, s2 / 2, 0, Math.PI * 2);
      g.fill();
    });
    const haze = new THREE.Sprite(additive(hazeT, 0.9));
    haze.scale.set(p.r * 10, p.r * 10, 1);
    group.add(haze, streak2, streak, core);
    return wisps(group, 0x8ff0e0, 2, p.r * 3, p.r * 6, 14);
  }

  function makeZariman(group, p) {
    const plasmaT = canvasTex(512, (g, s2) => {
      for (let i = 0; i < 260; i++) {
        const x = s2 * (0.35 + Math.random() * 0.3), y = Math.random() * s2;
        g.strokeStyle = `rgba(${120 + Math.random() * 80},${230 + Math.random() * 25},${220 + Math.random() * 35},${0.05 + Math.random() * 0.08})`;
        g.lineWidth = 1 + Math.random() * 3;
        g.beginPath();
        g.moveTo(x, y);
        g.bezierCurveTo(x + (Math.random() - 0.5) * 160, y + 40, x + (Math.random() - 0.5) * 160, y + 90, x + (Math.random() - 0.5) * 80, y + 140);
        g.stroke();
      }
      const gr = g.createLinearGradient(0, 0, s2, 0);
      gr.addColorStop(0, 'rgba(0,0,0,1)');
      gr.addColorStop(0.3, 'rgba(0,0,0,0)');
      gr.addColorStop(0.7, 'rgba(0,0,0,0)');
      gr.addColorStop(1, 'rgba(0,0,0,1)');
      g.globalCompositeOperation = 'destination-out';
      g.fillStyle = gr;
      g.fillRect(0, 0, s2, s2);
    });
    const plasma = new THREE.Sprite(additive(plasmaT, 1));
    plasma.scale.set(p.r * 3.4, p.r * 6, 1);
    plasma.position.set(p.r * 0.5, 0, -0.5);
    const glow = new THREE.Sprite(additive(glowTex([[0, 'rgba(210,255,248,0.9)'], [0.25, 'rgba(70,220,200,0.35)'], [1, 'rgba(0,0,0,0)']])));
    glow.scale.set(p.r * 2.4, p.r * 4.4, 1);
    glow.position.copy(plasma.position);
    group.add(plasma, glow);
    const metal = new THREE.MeshStandardMaterial({ color: 0x9aa4a8, emissive: 0x10181a, roughness: 0.55, metalness: 0.6 });
    const ship = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.CapsuleGeometry(p.r * 0.42, p.r * 1.1, 8, 24), metal);
    hull.scale.set(1, 1, 0.75);
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(p.r * 0.36, p.r * 0.07, 10, 40), metal);
    ringA.position.set(-p.r * 0.38, 0, 0);
    ringA.rotation.y = Math.PI / 2;
    const ringB = ringA.clone();
    ringB.scale.setScalar(0.7);
    ringB.position.x -= p.r * 0.12;
    const lights = new THREE.Mesh(new THREE.TorusGeometry(p.r * 0.29, p.r * 0.012, 6, 40), new THREE.MeshBasicMaterial({ color: 0x9ff7ff }));
    lights.position.copy(ringA.position);
    lights.rotation.y = Math.PI / 2;
    ship.add(hull, ringA, ringB, lights);
    for (let i = 0; i < 4; i++) {
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, p.r * 0.8, 4), metal);
      ant.rotation.z = Math.PI / 2;
      ant.position.set(-p.r * 0.7, (i - 1.5) * p.r * 0.18, 0.1);
      ship.add(ant);
    }
    ship.rotation.set(0.15, 0.5, 0.12);
    group.add(ship);
    ship.scale.setScalar(1.8);
    return { body: ship, spin: wisps(group, 0x7ff5e0, 2, p.r * 2, p.r * 5, 10) };
  }

  function makeFortress(group, p) {
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(p.r, 1), new THREE.MeshStandardMaterial({ color: 0x9a8b84, emissive: 0x2a0c08, roughness: 0.9, metalness: 0.15, flatShading: true, map: tex('moon') }));
    rock.scale.set(1, 0.72, 1.15);
    group.add(rock);
    const metal = new THREE.MeshStandardMaterial({ color: 0xb4b9c0, emissive: 0x1a1c20, roughness: 0.45, metalness: 0.7, flatShading: true });
    const glow = new THREE.MeshBasicMaterial({ color: 0xff4a32 });
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < 22; i++) {
      const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.9 + 0.1, Math.random() - 0.5).normalize();
      const tower = i % 3 === 0;
      const h = tower ? p.r * (0.6 + Math.random() * 0.7) : p.r * (0.12 + Math.random() * 0.2);
      const w = tower ? 0.08 + Math.random() * 0.06 : 0.15 + Math.random() * 0.25;
      const m = new THREE.Mesh(tower ? new THREE.CylinderGeometry(w * 0.4, w, h, 6) : new THREE.BoxGeometry(w, h, w * (0.6 + Math.random())), metal);
      m.quaternion.setFromUnitVectors(up, dir);
      m.position.copy(dir).multiplyScalar(p.r * 0.7 + h * 0.5);
      rock.add(m);
      if (tower) {
        const tip = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), glow);
        tip.position.copy(dir).multiplyScalar(p.r * 0.7 + h);
        rock.add(tip);
      }
    }
    const red = new THREE.Sprite(additive(glowTex([[0, 'rgba(255,90,60,0.55)'], [0.4, 'rgba(200,30,30,0.12)'], [1, 'rgba(0,0,0,0)']])));
    red.scale.set(p.r * 4.5, p.r * 4.5, 1);
    group.add(red);
    return rock;
  }

  function makeNebula(group, p) {
    const t = canvasTex(256, (g, s) => {
      for (let i = 0; i < 70; i++) {
        const x = s / 2 + (Math.random() - 0.5) * s * 0.55, y = s / 2 + (Math.random() - 0.5) * s * 0.4, r = 20 + Math.random() * 60;
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, `rgba(${Math.random() < 0.6 ? '170,50,40' : '90,110,190'},0.10)`);
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr;
        g.fillRect(0, 0, s, s);
      }
    });
    const cloud = new THREE.Sprite(additive(t, 0.95));
    cloud.scale.set(p.r * 6, p.r * 6, 1);
    const core = new THREE.Sprite(additive(glowTex([[0, 'rgba(255,200,190,0.7)'], [0.2, 'rgba(200,80,90,0.2)'], [1, 'rgba(0,0,0,0)']])));
    core.scale.set(p.r * 1.6, p.r * 1.6, 1);
    group.add(cloud, core);
  }

  function makeFrame(group, p) {
    const gold = new THREE.MeshBasicMaterial({ color: 0xd9b46a, transparent: true, opacity: 0.85 });
    [0, 1, 2].forEach((i) => {
      const t = new THREE.Mesh(new THREE.TorusGeometry(p.r * (1.35 + i * 0.12), 0.025, 6, 96), gold);
      t.rotation.set(Math.PI / 2 + i * 0.6, i * 0.9, 0);
      group.add(t);
    });
  }

  function lumpyGeo(seed) {
    const g = new THREE.SphereGeometry(1, 64, 48);
    const ps2 = g.attributes.position, vv = new THREE.Vector3();
    for (let k = 0; k < ps2.count; k++) {
      vv.fromBufferAttribute(ps2, k);
      const d = 1 + 0.16 * Math.sin(vv.x * 3.1 + seed) * Math.cos(vv.y * 2.3) + 0.1 * Math.sin(vv.z * 4.7 + vv.x * 2.0) - 0.12 * Math.max(0, vv.x);
      vv.multiplyScalar(d);
      ps2.setXYZ(k, vv.x, vv.y * 0.8, vv.z);
    }
    g.computeVertexNormals();
    return g;
  }

  function makeBody(group, p, i) {
    let uniforms, frag;
    if (p.tex) {
      uniforms = {
        uMap: { value: tex(p.tex) }, uClouds: { value: tex(p.clouds ? 'earth-clouds' : p.tex) }, uHasClouds: { value: p.clouds ? 1 : 0 }, uNight: { value: p.night ? 1 : 0 },
        uTint: { value: raw(p.tint) }, uMono: { value: p.tint === '#ffffff' ? 0 : 0.7 }, uAtmo: { value: new THREE.Color(p.atmo || '#8fb3c9') }, uAtmoStr: { value: p.atmo ? 1.0 : 0.3 }, uTime: { value: 0 },
      };
      frag = TEX_FS;
    } else {
      uniforms = {
        uKind: { value: KIND[p.kind] }, uA: { value: new THREE.Color(p.c[0]) }, uB: { value: new THREE.Color(p.c[1]) }, uC: { value: new THREE.Color(p.c[2]) },
        uAtmo: { value: new THREE.Color(p.atmo || '#8fb3c9') }, uAtmoStr: { value: p.atmo ? 1.0 : 0.3 }, uSeed: { value: i * 7.31 }, uTime: { value: 0 },
      };
      frag = PROC_FS;
    }
    const body = new THREE.Mesh(p.lumpy ? lumpyGeo(i) : sphereGeo, new THREE.ShaderMaterial({ uniforms, vertexShader: PLANET_VS, fragmentShader: frag }));
    body.scale.setScalar(p.r);
    body.rotation.z = p.tilt != null ? p.tilt : 0.2 + (i % 5) * 0.05;
    group.add(body);
    if (p.atmo) halo(group, p.r, p.atmo);
    if (p.ring) {
      const inner = p.r * 1.25, outer = p.r * 2.3;
      const ring = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 160, 1), new THREE.ShaderMaterial({ uniforms: { uMap: { value: tex('saturn-ring', 'png') }, uIn: { value: inner }, uOut: { value: outer }, uAlpha: { value: 0.95 } }, vertexShader: RING_VS, fragmentShader: RING_FS, side: THREE.DoubleSide, transparent: true, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2 + 0.22;
      group.add(ring);
    }
    if (p.ringThin) {
      const m = new THREE.MeshBasicMaterial({ color: 0xbfe4ee, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false });
      [1.45, 1.6].forEach((k) => { const r = new THREE.Mesh(new THREE.RingGeometry(p.r * k, p.r * (k + 0.025), 128), m); r.rotation.y = Math.PI / 2 - 0.25; group.add(r); });
    }
    if (p.frame) makeFrame(group, p);
    return { body, uniforms };
  }

  SYSTEM.forEach((p, i) => {
    const group = new THREE.Group();
    group.position.set(p.p[0], 0, p.p[1]);
    let body = null, uniforms = null, spin = null;
    if (p.special === 'rift') spin = makeVoid(group, p);
    else if (p.special === 'zariman') ({ body, spin } = makeZariman(group, p));
    else if (p.special === 'fortress') body = makeFortress(group, p);
    else if (p.special === 'nebula') makeNebula(group, p);
    else ({ body, uniforms } = makeBody(group, p, i));
    const hit = new THREE.Mesh(new THREE.SphereGeometry(Math.max(p.r * 1.5, 2.2), 12, 8), new THREE.MeshBasicMaterial({ visible: false }));
    hit.userData.planet = p.name;
    group.add(hit);
    hitMeshes.push(hit);
    scene.add(group);
    if (p.late) lateObjects.push(group);

    const label = document.createElement('button');
    label.type = 'button';
    label.className = 'pl-label';
    label.dataset.planet = p.name;
    label.innerHTML = '<span class="pl-ring"></span><span class="pl-name"></span><span class="pl-sub"></span><span class="pl-badge"></span>';
    labelLayer.appendChild(label);
    const orbit = p.moving ? { r: Math.hypot(p.p[0], p.p[1]), a: Math.atan2(p.p[1], p.p[0]) } : null;
    planets.set(p.name, { def: p, group, body, uniforms, spin, label, orbit });
  });

  const beltCount = 150;
  const belt = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.22, 0), new THREE.MeshBasicMaterial({ color: 0x0c0a08 }), beltCount);
  const ceres = planets.get('Ceres').group.position;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3();
  for (let i = 0; i < beltCount; i++) {
    const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random());
    ps.set(ceres.x + 2 + Math.cos(a) * d * 11, (Math.random() - 0.5) * 1.5, ceres.z - 2 + Math.sin(a) * d * 17);
    q.setFromEuler(new THREE.Euler(Math.random() * 3, Math.random() * 3, Math.random() * 3));
    sc.setScalar(0.4 + Math.random() * 1.8);
    belt.setMatrixAt(i, m4.compose(ps, q, sc));
  }
  scene.add(belt);

  const wrecks = new THREE.Group();
  const black = new THREE.MeshBasicMaterial({ color: 0x050607 });
  WRECKS.forEach((name, i) => {
    const pl = planets.get(name);
    if (!pl) return;
    const w = new THREE.Group();
    const len = 1.6 + Math.random() * 1.8;
    w.add(new THREE.Mesh(new THREE.BoxGeometry(len, 0.35, 0.7), black));
    for (let k = 0; k < 4; k++) {
      const f = new THREE.Mesh(new THREE.BoxGeometry(0.2 + Math.random() * 0.6, 0.15, 0.8 + Math.random() * 1.6), black);
      f.position.set((Math.random() - 0.5) * len, 0, (Math.random() - 0.5) * 0.8);
      f.rotation.y = (Math.random() - 0.5) * 1.4;
      w.add(f);
    }
    const a = i * 2.1 + Math.random();
    const d = pl.def.r * 2.2 + 2.5 + Math.random() * 2;
    w.position.set(pl.group.position.x + Math.cos(a) * d, 1 + Math.random() * 2, pl.group.position.z + Math.sin(a) * d);
    w.rotation.set(Math.random() * 0.6, Math.random() * Math.PI, Math.random() * 0.6);
    w.scale.setScalar(0.7);
    wrecks.add(w);
  });
  scene.add(wrecks);
  lateObjects.push(wrecks);

  let view = null, markers = [], nodeLines = null, fly = null, lateOn = false, follow = null;

  const OFF_PLANET = (n) => n.t === 'Bounty' || n.t === 'Skirmish' || / \(Extra\)$/.test(n.n);
  const SOLID = (p) => !p.special || p.special === 'fortress';

  function clearMarkers() {
    markers.forEach((m) => m.el.remove());
    markers = [];
    if (nodeLines) { nodeLines.parent.remove(nodeLines); nodeLines.traverse((o) => o.geometry && o.geometry.dispose()); nodeLines = null; }
  }

  function viewFrame(pl) {
    const target = pl.group.position.clone();
    const away = target.clone().setY(0);
    if (away.lengthSq() < 1) away.set(0, 0, 1);
    away.normalize();
    const dir = new THREE.Vector3(away.x * 0.2, 1.25, away.z * 0.2 + 1).normalize();
    const rightV = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize();
    const upV = new THREE.Vector3().crossVectors(dir, rightV).normalize();
    return { target, dir, rightV, upV };
  }

  function tour(points) {
    const left = new Set(points.map((_, i) => i));
    if (!left.size) return [];
    let cur = [...left].reduce((a, b) => (points[b].y > points[a].y ? b : a));
    const order = [cur];
    left.delete(cur);
    while (left.size) {
      let best = null, bd = Infinity;
      left.forEach((k) => { const d = Math.hypot(points[k].x - points[cur].x, points[k].y - points[cur].y); if (d < bd) { bd = d; best = k; } });
      order.push(best);
      left.delete(best);
      cur = best;
    }
    return order;
  }

  function bodyRadius(p) { return SOLID(p) ? p.r : p.r * 3.2; }

  function buildMarkers(name, frameV) {
    clearMarkers();
    const s = store();
    const pl = planets.get(name);
    if (!s || !pl) return;
    const nodes = s.A.nodes.filter((n) => n.p === name).sort((a, b) => a.n.localeCompare(b.n));
    if (!nodes.length) return;
    const solid = SOLID(pl.def);
    const R = bodyRadius(pl.def);
    const face = solid ? nodes.filter((n) => !OFF_PLANET(n)) : nodes;
    const ring = solid ? nodes.filter(OFF_PLANET) : [];
    const { dir, rightV, upV } = frameV;
    nodeLines = new THREE.Group();
    const lineMat = new THREE.LineBasicMaterial({ color: 0xe8f2f6, transparent: true, opacity: 0.45, depthWrite: false });
    const golden = Math.PI * (3 - Math.sqrt(5));
    const flat = face.map((nd, i) => {
      const rr = 0.84 * Math.sqrt((i + 0.6) / face.length);
      const a = i * golden + 0.4;
      return { x: Math.cos(a) * rr, y: Math.sin(a) * rr * 0.92, nd };
    });
    const toLocal = (f) => {
      const z = Math.sqrt(Math.max(0, 1 - f.x * f.x - f.y * f.y));
      return new THREE.Vector3().addScaledVector(rightV, f.x * R).addScaledVector(upV, f.y * R).addScaledVector(dir, solid ? z * R * 1.01 : 0);
    };
    const pts = flat.map(toLocal);
    const order = tour(flat);
    const path = [];
    order.forEach((k, idx) => {
      if (!idx) return;
      const a = pts[order[idx - 1]], b = pts[k];
      for (let i = 0; i <= 16; i++) {
        const q = a.clone().lerp(b, i / 16);
        if (solid) q.setLength(R * 1.012);
        else q.addScaledVector(upV, Math.sin((i / 16) * Math.PI) * R * 0.06);
        path.push(q);
      }
    });
    if (path.length) nodeLines.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(path), lineMat));
    const per = Math.ceil(ring.length / 2);
    const sides = { 1: [], '-1': [] };
    ring.forEach((nd, i) => {
      const side = i % 2 === 0 ? 1 : -1;
      const k = Math.floor(i / 2);
      const ang = (per > 1 ? k / (per - 1) - 0.5 : 0) * 2.0;
      const rad = R * (1.3 + (k % 2) * 0.14);
      const off = new THREE.Vector3().addScaledVector(rightV, side * Math.cos(ang) * rad).addScaledVector(upV, Math.sin(ang) * rad);
      pts.push(off);
      flat.push({ nd, off: true });
      sides[side].push({ off, ang });
    });
    Object.values(sides).forEach((list) => {
      const line = list.sort((a, b) => a.ang - b.ang).map((r) => r.off);
      if (line.length > 1) nodeLines.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(new THREE.CatmullRomCurve3(line).getPoints(line.length * 12)), lineMat));
    });
    flat.forEach((f, i) => {
      const nd = f.nd;
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'node-mk' + (f.off ? ' off' : '');
      el.innerHTML = '<i></i><span class="nm-name"></span><span class="nm-sub"></span>';
      el.addEventListener('mouseenter', (ev) => s.showTip(ev, s.nodeTip(nd)));
      el.addEventListener('mousemove', (ev) => s.moveTip(ev));
      el.addEventListener('mouseleave', () => s.hideTip());
      el.addEventListener('click', (ev) => { ev.stopPropagation(); s.pin(nd.key); });
      labelLayer.appendChild(el);
      markers.push({ el, off: pts[i], node: nd, outside: !!f.off });
    });
    pl.group.add(nodeLines);
    refresh();
  }

  function flyTo(posV, target, done) {
    fly = { t: 0, dur: 1.3, p0: camera.position.clone(), t0: controls.target.clone(), p1: posV, t1: target, done };
    controls.enabled = false;
  }

  function goPlanet(name, nodeKey) {
    const pl = planets.get(name);
    if (!pl) return;
    view = name;
    const frameV = viewFrame(pl);
    buildMarkers(name, frameV);
    const R = bodyRadius(pl.def);
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const free = W >= 1024 ? Math.max(0.3, (W - 760) / W) : 0.94;
    const tanH = tanV * camera.aspect * free;
    const reachX = markers.some((m) => m.outside) ? R * 1.8 : R * 1.15;
    const reachY = markers.some((m) => m.outside) ? R * 1.5 : R * 1.1;
    const dist = Math.max(reachY / (0.66 * tanV), (reachX + R * 0.45) / (0.9 * tanH), R * 2.4);
    controls.minDistance = R * 1.3;
    controls.maxDistance = dist * 4;
    follow = frameV.target.clone();
    flyTo(frameV.target.clone().addScaledVector(frameV.dir, dist), frameV.target.clone(), () => {
      if (nodeKey) { const m = markers.find((x) => x.node.key === nodeKey); if (m) { m.el.classList.add('pulse'); setTimeout(() => m.el.classList.remove('pulse'), 2400); } }
    });
    document.body.classList.add('in-planet');
    refresh();
  }

  function goHome() {
    view = null;
    follow = null;
    clearMarkers();
    controls.minDistance = 6;
    controls.maxDistance = 520;
    flyTo(HOME.pos.clone(), HOME.target.clone());
    document.body.classList.remove('in-planet');
    refresh();
  }

  function refresh() {
    const s = store();
    if (!s) return;
    lateOn = s.mode === 'late';
    const viewGroup = view ? planets.get(view).group : null;
    lateObjects.forEach((o) => { o.visible = lateOn || o === viewGroup; });
    const counts = {};
    s.A.nodes.forEach((n) => { counts[n.p] = (counts[n.p] || 0) + 1; });
    const findPl = {};
    s.findHits.forEach((h) => { findPl[h.node.p] = true; });
    const anyHi = s.planHits.size || s.findHits.size || Object.keys(s.findPlanets).length;
    planets.forEach((pl, name) => {
      const plan = s.planPlanets[name];
      const find = findPl[name] || s.findPlanets[name];
      const L = pl.label;
      L.querySelector('.pl-name').textContent = s.planetName(name);
      L.querySelector('.pl-sub').textContent = counts[name] ? counts[name] + ' ' + s.t('nodes') : '';
      L.querySelector('.pl-badge').textContent = plan ? plan.count : '';
      L.classList.toggle('plan', !!plan);
      L.classList.toggle('find', !!find);
      L.classList.toggle('dim', !!anyHi && !plan && !find);
    });
    markers.forEach((m) => {
      const ph = s.planHits.get(m.node.key), fh = s.findHits.get(m.node.key);
      m.el.querySelector('.nm-name').textContent = m.node.n;
      m.el.querySelector('.nm-sub').textContent = [s.typeName(m.node.t), ph ? s.fmt(ph.eff) : '', !ph && fh ? s.fmt(fh.eff) : ''].filter(Boolean).join(' · ');
      m.el.classList.toggle('plan', !!ph);
      m.el.classList.toggle('find', !ph && !!fh);
      m.el.classList.toggle('pinned', s.pinned === m.node.key);
      m.el.classList.toggle('boss', m.node.t === 'Assassination');
    });
  }

  const v = new THREE.Vector3(), right = new THREE.Vector3(), tmp = new THREE.Vector3();
  const scr = { x: 0, y: 0, z: 0 }, scr2 = { x: 0, y: 0, z: 0 };
  function project(p, out) {
    v.copy(p).project(camera);
    out.x = (v.x * 0.5 + 0.5) * W;
    out.y = (-v.y * 0.5 + 0.5) * H;
    out.z = v.z;
    return out;
  }
  function placeLabels() {
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    planets.forEach((pl) => {
      project(pl.group.position, scr);
      project(tmp.copy(right).multiplyScalar(pl.def.r).add(pl.group.position), scr2);
      const rad = Math.hypot(scr2.x - scr.x, scr2.y - scr.y);
      const hide = scr.z > 1 || !!view || (pl.def.late && !lateOn);
      pl.label.style.display = hide ? 'none' : '';
      if (hide) return;
      pl.label.style.transform = `translate(${scr.x.toFixed(1)}px,${scr.y.toFixed(1)}px)`;
      pl.label.style.setProperty('--r', Math.max(rad, 6).toFixed(1) + 'px');
      pl.label.classList.toggle('tiny', rad < 7);
    });
    if (!markers.length) return;
    const pl = planets.get(view);
    project(pl.group.position, scr);
    project(tmp.copy(right).multiplyScalar(pl.def.r).add(pl.group.position), scr2);
    const prad = Math.hypot(scr2.x - scr.x, scr2.y - scr.y);
    const camD = camera.position.distanceTo(pl.group.position);
    const cx = scr.x, cy = scr.y;
    markers.forEach((m) => {
      tmp.copy(m.off).add(pl.group.position);
      const d = camera.position.distanceTo(tmp);
      project(tmp, scr);
      const hidden = scr.z > 1 || (!m.outside && SOLID(pl.def) && d > camD + pl.def.r * 0.2 && Math.hypot(scr.x - cx, scr.y - cy) < prad * 0.98);
      m.el.style.transform = `translate(${scr.x.toFixed(1)}px,${scr.y.toFixed(1)}px)`;
      m.el.classList.toggle('occluded', hidden);
    });
  }

  let W = 1, H = 1;
  function resize() {
    W = host.clientWidth; H = host.clientHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    const off = HOME.base.clone().sub(HOME.target);
    const free = W >= 1024 ? Math.max(0.35, (W - 760) / W) : 0.96;
    const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect * free;
    const need = Math.max(off.length(), 104 / tanH, 92 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    HOME.pos.copy(off.setLength(need)).add(HOME.target);
    if (!view && !fly && !moved) camera.position.copy(HOME.pos);
  }
  window.addEventListener('resize', resize);
  resize();

  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
  let hover = null, down = null;
  function pick(ev) {
    const r = renderer.domElement.getBoundingClientRect();
    mouse.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    const live = hitMeshes.filter((h) => lateOn || !planets.get(h.userData.planet).def.late);
    const hit = ray.intersectObjects(live, false)[0];
    return hit ? hit.object.userData.planet : null;
  }
  function setHover(name, ev) {
    const s = store();
    if (!s) return;
    if (name !== hover) {
      hover = name;
      renderer.domElement.style.cursor = name ? 'pointer' : '';
      if (name && name !== view) s.showTip(ev, s.planetTip(name)); else s.hideTip();
    } else if (name && name !== view) s.moveTip(ev);
  }
  renderer.domElement.addEventListener('pointermove', (ev) => { if (!down || ev.pointerType === 'mouse') setHover(fly ? null : pick(ev), ev); });
  renderer.domElement.addEventListener('pointerleave', () => setHover(null));
  renderer.domElement.addEventListener('pointerdown', (ev) => { down = { x: ev.clientX, y: ev.clientY }; });
  renderer.domElement.addEventListener('pointerup', (ev) => {
    if (!down) return;
    const dist = Math.hypot(ev.clientX - down.x, ev.clientY - down.y);
    down = null;
    if (dist > 6 || fly) return;
    const name = pick(ev);
    const s = store();
    if (name && name !== view && s) s.openPlanet(name);
  });
  renderer.domElement.addEventListener('contextmenu', (ev) => ev.preventDefault());
  labelLayer.addEventListener('click', (ev) => {
    const b = ev.target.closest('.pl-label');
    const s = store();
    if (b && s) s.openPlanet(b.dataset.planet);
  });
  labelLayer.addEventListener('mouseover', (ev) => {
    const b = ev.target.closest('.pl-label');
    const s = store();
    if (b && s && b.dataset.planet !== view) s.showTip(ev, s.planetTip(b.dataset.planet));
  });
  labelLayer.addEventListener('mousemove', (ev) => { const s = store(); if (s && ev.target.closest('.pl-label')) s.moveTip(ev); });
  labelLayer.addEventListener('mouseout', (ev) => { const s = store(); if (s && ev.target.closest('.pl-label') && !(ev.relatedTarget && ev.relatedTarget.closest && ev.relatedTarget.closest('.pl-label'))) s.hideTip(); });

  window.addEventListener('atlas:update', refresh);
  window.addEventListener('atlas:fly', (ev) => { const d = ev.detail || {}; if (d.planet) goPlanet(d.planet, d.node); else goHome(); });
  window.addEventListener('atlas:zoom', (ev) => { const k = ev.detail > 0 ? 0.8 : 1.25; const off = camera.position.clone().sub(controls.target).multiplyScalar(k); if (off.length() > controls.minDistance && off.length() < controls.maxDistance) camera.position.copy(controls.target).add(off); });
  window.addEventListener('atlas:home', () => { if (view) { const s = store(); if (s) s.closePlanet(); } else { moved = false; goHome(); } });

  const clock = new THREE.Clock();
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    planets.forEach((pl, name) => {
      if (pl.orbit) {
        pl.orbit.a += dt * 0.006;
        const rr = pl.orbit.r + Math.sin(t * 0.04) * 10;
        pl.group.position.set(Math.cos(pl.orbit.a) * rr, Math.sin(t * 0.3) * 0.4, Math.sin(pl.orbit.a) * rr);
      }
      if (pl.uniforms) pl.uniforms.uTime.value = t;
      if (pl.body && name !== view) pl.body.rotation.y += dt * (0.025 + 0.04 / pl.def.r);
      if (pl.spin) pl.spin.rotation.z += dt * 0.15;
    });
    if (view && follow) {
      const now = planets.get(view).group.position;
      tmp.copy(now).sub(follow);
      if (tmp.lengthSq() > 0) {
        camera.position.add(tmp);
        controls.target.add(tmp);
        if (fly) { fly.p1.add(tmp); fly.t1.add(tmp); }
        follow.copy(now);
      }
    }
    if (fly) {
      fly.t = Math.min(1, fly.t + dt / fly.dur);
      const k = ease(fly.t);
      camera.position.lerpVectors(fly.p0, fly.p1, k);
      controls.target.lerpVectors(fly.t0, fly.t1, k);
      camera.lookAt(controls.target);
      if (fly.t >= 1) { const d = fly.done; fly = null; controls.enabled = true; if (d) d(); }
    } else controls.update();
    sunGlow.material.rotation = t * 0.02;
    nebula.position.copy(camera.position);
    renderer.render(scene, camera);
    placeLabels();
    requestAnimationFrame(frame);
  }
  frame();
  refresh();
  document.body.classList.add('chart-ready');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
