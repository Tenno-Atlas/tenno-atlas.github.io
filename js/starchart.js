import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const KIND = { rock: 0, gas: 1, earth: 2, ice: 3, infested: 4, orokin: 5, lava: 6, cloud: 7, city: 8, holo: 9 };

export const SYSTEM = [
  { name: 'Mercury', a: 205, d: 10, r: 1.57, kind: 'rock', c: ['#a39890', '#5a514b', '#cfc4b8'] },
  { name: 'Venus', a: 248, d: 15, r: 2.62, kind: 'cloud', c: ['#e9c47e', '#a86c32', '#f7e3b0'], atmo: '#f3c77d' },
  { name: 'Earth', a: 292, d: 20, r: 2.8, kind: 'earth', c: ['#163f7a', '#4c7a3c', '#ffffff'], atmo: '#6fb4ff' },
  { name: 'Lua', near: 'Earth', off: [5.27, 0.51, 2.38], r: 0.88, kind: 'rock', c: ['#c4c4cb', '#6c6c75', '#e6e6ec'] },
  { name: 'Mars', a: 338, d: 25, r: 2.1, kind: 'rock', c: ['#c4592f', '#6f2814', '#e8946a'], atmo: '#e88a5e' },
  { name: 'Phobos', near: 'Mars', off: [4.08, 0.85, -2.72], r: 0.79, kind: 'rock', c: ['#927e70', '#4b3f37', '#b8a290'] },
  { name: 'Deimos', near: 'Mars', off: [-3.74, -0.34, 3.57], r: 1.05, kind: 'infested', c: ['#a0385a', '#3a0d20', '#ff7aa0'], atmo: '#ff6a9a' },
  { name: 'Ceres', a: 18, d: 30, r: 1.31, kind: 'rock', c: ['#8f929a', '#4a4c53', '#b9bbc3'] },
  { name: 'Jupiter', a: 58, d: 37, r: 5.95, kind: 'gas', c: ['#d9b68d', '#94643f', '#f5e6cf'], atmo: '#ecc9a2' },
  { name: 'Europa', near: 'Jupiter', off: [7.82, 1.02, 4.42], r: 1.14, kind: 'ice', c: ['#d6e8f2', '#7da4bd', '#ffffff'], atmo: '#a8dcff' },
  { name: 'Saturn', a: 98, d: 45, r: 5.08, kind: 'gas', c: ['#e3cc98', '#a5875a', '#f7ebcb'], atmo: '#f0dcae', ring: true },
  { name: 'Uranus', a: 138, d: 52, r: 3.68, kind: 'gas', c: ['#93d6dc', '#5aa3ae', '#c9f0f2'], atmo: '#9ff3ff', soft: true },
  { name: 'Neptune', a: 176, d: 58, r: 3.5, kind: 'gas', c: ['#3d64da', '#1f3388', '#86a8ff'], atmo: '#5f8cff' },
  { name: 'Pluto', a: 212, d: 64, r: 1.49, kind: 'ice', c: ['#dcc9ae', '#8a7055', '#f7efe2'] },
  { name: 'Sedna', a: 246, d: 69, r: 1.49, kind: 'ice', c: ['#cf7258', '#6a2b20', '#f2b9a0'] },
  { name: 'Eris', a: 280, d: 74, r: 1.75, kind: 'infested', c: ['#7fa064', '#2e4026', '#c8e0a0'], atmo: '#a6e07a' },
  { name: 'Kuva Fortress', a: 228, d: 40, r: 1.93, kind: 'lava', c: ['#b4232f', '#2c070b', '#ff5a36'], atmo: '#ff3a2a' },
  { name: 'Void', a: 318, d: 48, r: 2.27, kind: 'orokin', c: ['#f1cf78', '#6e4f18', '#fff3c8'], atmo: '#ffd27a' },
  { name: 'Zariman', a: 150, d: 31, r: 1.75, kind: 'orokin', c: ['#93e8dc', '#24575e', '#eafff9'], atmo: '#8ff5e6' },
  { name: 'Höllvania', a: 120, d: 22, r: 1.75, kind: 'city', c: ['#5b3c6c', '#170e21', '#ff6eb4'], atmo: '#c86bff' },
  { name: 'Duviri', a: 32, d: 77, r: 2.45, kind: 'cloud', c: ['#e48ec4', '#6e3360', '#ffd6ef'], atmo: '#ff9ad6' },
  { name: 'Veil Proxima', a: 352, d: 80, r: 2.27, kind: 'cloud', c: ['#5d82e4', '#18245e', '#b2c8ff'], atmo: '#7f9cff' },
  { name: 'Sanctuary', a: 70, d: 17, r: 1.05, kind: 'holo', c: ['#bfeaff', '#3a6a88', '#ffffff'], atmo: '#9fe2ff' },
];

const LANES = [
  ['Mercury', 'Venus'], ['Venus', 'Earth'], ['Earth', 'Mars'], ['Mars', 'Ceres'], ['Ceres', 'Jupiter'],
  ['Jupiter', 'Saturn'], ['Saturn', 'Uranus'], ['Uranus', 'Neptune'], ['Neptune', 'Pluto'], ['Pluto', 'Sedna'],
  ['Sedna', 'Eris'], ['Earth', 'Lua'], ['Mars', 'Phobos'], ['Mars', 'Deimos'], ['Jupiter', 'Europa'],
  ['Pluto', 'Kuva Fortress'], ['Eris', 'Void'], ['Ceres', 'Zariman'], ['Earth', 'Höllvania'], ['Eris', 'Veil Proxima'],
];

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
varying vec3 vObjN;varying vec3 vWorldN;varying vec3 vWorldPos;
void main(){vObjN=normal;vWorldN=normalize(mat3(modelMatrix)*normal);vec4 wp=modelMatrix*vec4(position,1.0);vWorldPos=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}
`;

const PLANET_FS = `
uniform int uKind;uniform vec3 uA;uniform vec3 uB;uniform vec3 uC;uniform vec3 uAtmo;uniform float uAtmoStr;uniform float uSeed;uniform float uTime;uniform float uSoft;
varying vec3 vObjN;varying vec3 vWorldN;varying vec3 vWorldPos;
${NOISE}
void main(){
  vec3 n=normalize(vObjN);vec3 p=n*2.0+uSeed;vec3 col=uA;float emit=0.0;vec3 emitCol=uC;float night=0.0;
  vec3 N=normalize(vWorldN);vec3 L=normalize(-vWorldPos);float lam=max(dot(N,L),0.0);
  if(uKind==0){float h=fbm(p*1.6);col=mix(uB,uA,h*0.5+0.55);col=mix(col,uC,smoothstep(0.2,0.7,fbm(p*6.0+3.0))*0.35);float cr=1.0-smoothstep(0.0,0.07,abs(snoise(p*5.0)));col*=1.0-cr*0.22;float cr2=1.0-smoothstep(0.0,0.05,abs(snoise(p*11.0+7.0)));col*=1.0-cr2*0.12;}
  else if(uKind==1){float w=fbm(p*vec3(1.0,3.5,1.0)+vec3(uTime*0.015,0.0,0.0))*mix(0.35,0.12,uSoft);float y=n.y+w;float b=sin(y*mix(18.0,7.0,uSoft)+uSeed);col=mix(uA,uB,(b*0.5+0.5)*mix(1.0,0.45,uSoft));col=mix(col,uC,smoothstep(0.3,0.95,sin(y*7.0+1.3)*0.5+0.5)*0.45);float storm=smoothstep(0.86,0.98,snoise(p*vec3(1.8,4.0,1.8)+3.0));col=mix(col,uB*1.15,storm*0.5);}
  else if(uKind==2){float h=fbm(p*1.7);float land=smoothstep(0.02,0.09,h);vec3 ocean=mix(uA*0.7,uA*1.2,fbm(p*3.0)*0.5+0.5);vec3 ground=mix(uB,vec3(0.55,0.48,0.32),smoothstep(0.2,0.5,fbm(p*3.0+5.0)));col=mix(ocean,ground,land);col=mix(col,vec3(0.92),smoothstep(0.78,0.9,abs(n.y)));float cl=smoothstep(0.05,0.6,fbm(p*2.4+vec3(uTime*0.01,0.0,uTime*0.006)));col=mix(col,uC,cl*0.85);float cityL=smoothstep(0.6,0.85,snoise(p*22.0))*land*(1.0-cl);emit=0.0;night=cityL*0.9;emitCol=vec3(1.0,0.78,0.45);}
  else if(uKind==3){float h=fbm(p*2.0);col=mix(uB,uA,h*0.5+0.6);float cr=1.0-smoothstep(0.0,0.035,abs(fbm(p*3.5)));col=mix(col,uB*0.75,cr*0.65);col=mix(col,uC,smoothstep(0.3,0.8,fbm(p*5.0))*0.3);}
  else if(uKind==4){float h=fbm(p*2.4+uTime*0.008);float v=1.0-smoothstep(0.0,0.06,abs(snoise(p*5.5+uTime*0.01)));col=mix(uB,uA,h*0.5+0.55);col=mix(col,uC,v*0.75);emit=v*0.35;}
  else if(uKind==5){float h=fbm(p*3.0);col=mix(uB,uA,h*0.5+0.6);vec3 g=abs(fract(p*3.2)-0.5);float l=1.0-smoothstep(0.0,0.035,min(min(g.x,g.y),g.z));float pulse=0.6+0.4*sin(uTime*1.5+p.x*3.0);col=mix(col,uC,l*0.8);emit=l*0.9*pulse+0.12;}
  else if(uKind==6){float h=fbm(p*2.2);float cr=1.0-smoothstep(0.0,0.07,abs(fbm(p*4.0+uTime*0.02)));col=mix(uB,uA*0.65,h*0.5+0.5);col=mix(col,uC,cr);emit=cr*1.3;}
  else if(uKind==7){float w=fbm(p*1.4+vec3(fbm(p*2.0+uTime*0.01)));col=mix(uB,uA,w*0.5+0.55);col=mix(col,uC,smoothstep(0.15,0.85,w)*0.55);}
  else if(uKind==8){float h=fbm(p*2.0);col=mix(uB,uA,h*0.5+0.5);float lights=smoothstep(0.45,0.8,snoise(p*20.0))*smoothstep(-0.2,0.3,fbm(p*3.0));night=lights*1.6+0.08;emit=0.04;}
  else{float sl=smoothstep(0.82,1.0,sin(n.y*70.0+uTime*2.5));float grid=1.0-smoothstep(0.0,0.05,abs(fract(atan(n.z,n.x)*3.0)-0.5));col=uA*0.35+uC*sl*0.5+uA*grid*0.3;emit=0.55;}
  vec3 V=normalize(cameraPosition-vWorldPos);float fr=pow(1.0-max(dot(N,V),0.0),2.6);
  vec3 lit=col*(0.05+1.08*pow(lam,0.85));
  lit+=col*emit+emitCol*emit*0.25;
  lit+=emitCol*night*(1.0-smoothstep(0.0,0.22,lam));
  lit+=uAtmo*fr*uAtmoStr*(0.18+lam*1.1);
  gl_FragColor=vec4(lit,1.0);
}
`;

const HALO_VS = `
varying vec3 vWorldN;varying vec3 vWorldPos;
void main(){vWorldN=normalize(mat3(modelMatrix)*normal);vec4 wp=modelMatrix*vec4(position,1.0);vWorldPos=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}
`;
const HALO_FS = `
uniform vec3 uAtmo;uniform float uStr;varying vec3 vWorldN;varying vec3 vWorldPos;
void main(){vec3 V=normalize(cameraPosition-vWorldPos);float f=pow(max(dot(normalize(vWorldN),-V),0.0),3.0);vec3 L=normalize(-vWorldPos);float lam=0.35+0.65*max(dot(normalize(vWorldN),L)*0.5+0.5,0.0);gl_FragColor=vec4(uAtmo*f*uStr*lam,f*uStr*lam);}
`;

const RING_VS = `varying vec3 vPos;varying vec3 vWorldPos;void main(){vPos=position;vec4 wp=modelMatrix*vec4(position,1.0);vWorldPos=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}`;
const RING_FS = `
uniform float uIn;uniform float uOut;uniform vec3 uA;uniform vec3 uB;varying vec3 vPos;varying vec3 vWorldPos;
${NOISE}
void main(){float r=(length(vPos.xy)-uIn)/(uOut-uIn);float bands=0.5+0.5*sin(r*90.0)*0.5+0.5*snoise(vec3(r*30.0,0.0,0.0));float gap=smoothstep(0.55,0.57,r)*(1.0-smoothstep(0.6,0.62,r));float a=smoothstep(0.0,0.05,r)*(1.0-smoothstep(0.92,1.0,r))*(0.25+0.4*bands)*(1.0-gap*0.85);vec3 c=mix(uB,uA,bands);gl_FragColor=vec4(c,a*0.7);}
`;

const NEBULA_FS = `
varying vec3 vDir;
${NOISE}
void main(){vec3 d=normalize(vDir);float n1=fbm(d*2.2+vec3(3.0));float n2=fbm(d*3.5+vec3(11.0));float band=exp(-pow(d.y*2.4,2.0));vec3 c=vec3(0.0);c+=vec3(0.32,0.12,0.42)*smoothstep(-0.1,0.7,n1)*0.55*band;c+=vec3(0.06,0.22,0.38)*smoothstep(0.0,0.8,n2)*0.5;c+=vec3(0.5,0.18,0.12)*smoothstep(0.35,0.9,n1*n2*2.0)*0.25*band;gl_FragColor=vec4(c,1.0);}
`;
const NEBULA_VS = `varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;

const store = () => (window.Alpine ? window.Alpine.store('wf') : null);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function glowTexture(stops) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

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
  renderer.setClearColor(0x02030a, 1);
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 3000);
  const HOME = { base: new THREE.Vector3(0, 134, 104), pos: new THREE.Vector3(0, 134, 104), target: new THREE.Vector3(2, 0, 8) };
  camera.position.copy(HOME.pos);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(HOME.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.screenSpacePanning = false;
  controls.minDistance = 8;
  controls.maxDistance = 320;
  controls.maxPolarAngle = 1.38;
  controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
  controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE };
  controls.zoomToCursor = true;
  let moved = false;
  controls.addEventListener('start', () => { moved = true; });

  const nebula = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 32), new THREE.ShaderMaterial({ vertexShader: NEBULA_VS, fragmentShader: NEBULA_FS, side: THREE.BackSide, depthWrite: false }));
  scene.add(nebula);

  const starGeo = new THREE.BufferGeometry();
  const N = 6000, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, rr = 900 + Math.random() * 400;
    const s = Math.sqrt(1 - u * u);
    pos.set([rr * s * Math.cos(th), rr * u, rr * s * Math.sin(th)], i * 3);
    const k = Math.random(), b = 0.45 + Math.random() * 0.55;
    col.set(k < 0.15 ? [b * 0.75, b * 0.85, b] : k < 0.25 ? [b, b * 0.88, b * 0.7] : [b, b, b], i * 3);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, depthWrite: false })));

  const sun = new THREE.Group();
  sun.add(new THREE.Mesh(new THREE.SphereGeometry(3.2, 48, 32), new THREE.MeshBasicMaterial({ color: 0xfff4dc })));
  const glowA = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture([[0, 'rgba(255,240,210,1)'], [0.18, 'rgba(255,200,120,0.75)'], [0.5, 'rgba(255,140,60,0.18)'], [1, 'rgba(255,90,40,0)']]), blending: THREE.AdditiveBlending, depthWrite: false }));
  glowA.scale.set(26, 26, 1);
  const glowB = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture([[0, 'rgba(255,220,170,0.5)'], [0.3, 'rgba(255,150,90,0.12)'], [1, 'rgba(120,60,140,0)']]), blending: THREE.AdditiveBlending, depthWrite: false }));
  glowB.scale.set(90, 90, 1);
  sun.add(glowA, glowB);
  scene.add(sun);

  const planets = new Map();
  const hitMeshes = [];
  const byName = Object.fromEntries(SYSTEM.map((p) => [p.name, p]));
  const posOf = (p) => {
    if (p.near) { const b = posOf(byName[p.near]); return b.clone().add(new THREE.Vector3(...p.off)); }
    const a = (p.a * Math.PI) / 180;
    return new THREE.Vector3(Math.cos(a) * p.d, 0, Math.sin(a) * p.d);
  };

  const orbitMat = new THREE.LineBasicMaterial({ color: 0x9fc6dd, transparent: true, opacity: 0.07, depthWrite: false });
  new Set(SYSTEM.filter((p) => !p.near).map((p) => p.d)).forEach((d) => {
    const pts = [];
    for (let i = 0; i <= 160; i++) { const t = (i / 160) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t) * d, 0, Math.sin(t) * d)); }
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), orbitMat));
  });

  const sphereGeo = new THREE.SphereGeometry(1, 96, 64);
  SYSTEM.forEach((p, i) => {
    const group = new THREE.Group();
    group.position.copy(posOf(p));
    const uniforms = {
      uKind: { value: KIND[p.kind] }, uA: { value: new THREE.Color(p.c[0]) }, uB: { value: new THREE.Color(p.c[1]) }, uC: { value: new THREE.Color(p.c[2]) },
      uAtmo: { value: new THREE.Color(p.atmo || '#8fb3c9') }, uAtmoStr: { value: p.atmo ? 1.1 : 0.35 }, uSeed: { value: i * 7.31 }, uTime: { value: 0 }, uSoft: { value: p.soft ? 1 : 0 },
    };
    const body = new THREE.Mesh(sphereGeo, new THREE.ShaderMaterial({ uniforms, vertexShader: PLANET_VS, fragmentShader: PLANET_FS }));
    body.scale.setScalar(p.r);
    body.rotation.z = 0.25 + (i % 5) * 0.06;
    group.add(body);
    if (p.atmo) {
      const halo = new THREE.Mesh(sphereGeo, new THREE.ShaderMaterial({ uniforms: { uAtmo: { value: new THREE.Color(p.atmo) }, uStr: { value: 0.9 } }, vertexShader: HALO_VS, fragmentShader: HALO_FS, side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      halo.scale.setScalar(p.r * 1.16);
      group.add(halo);
    }
    if (p.ring) {
      const inner = p.r * 1.35, outer = p.r * 2.35;
      const ring = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 160, 1), new THREE.ShaderMaterial({ uniforms: { uIn: { value: inner }, uOut: { value: outer }, uA: { value: new THREE.Color('#efdcb0') }, uB: { value: new THREE.Color('#8c7350') } }, vertexShader: RING_VS, fragmentShader: RING_FS, side: THREE.DoubleSide, transparent: true, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2 + 0.42;
      ring.rotation.y = 0.2;
      group.add(ring);
    }
    const hit = new THREE.Mesh(new THREE.SphereGeometry(Math.max(p.r * 1.5, 1.6), 12, 8), new THREE.MeshBasicMaterial({ visible: false }));
    hit.userData.planet = p.name;
    group.add(hit);
    hitMeshes.push(hit);
    scene.add(group);

    const label = document.createElement('button');
    label.type = 'button';
    label.className = 'pl-label';
    label.dataset.planet = p.name;
    label.innerHTML = '<span class="pl-ring"></span><span class="pl-name"></span><span class="pl-sub"></span><span class="pl-badge"></span>';
    labelLayer.appendChild(label);
    planets.set(p.name, { def: p, group, body, uniforms, label, ring: label.querySelector('.pl-ring') });
  });

  const laneMat = new THREE.LineDashedMaterial({ color: 0xbfe0f0, dashSize: 0.6, gapSize: 0.5, transparent: true, opacity: 0.22, depthWrite: false });
  LANES.forEach(([a, b]) => {
    const pa = planets.get(a), pb = planets.get(b);
    if (!pa || !pb) return;
    const dir = pb.group.position.clone().sub(pa.group.position).normalize();
    const s = pa.group.position.clone().addScaledVector(dir, pa.def.r * 1.6);
    const e = pb.group.position.clone().addScaledVector(dir, -pb.def.r * 1.6);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([s, e]), laneMat);
    line.computeLineDistances();
    scene.add(line);
  });

  let view = null;
  let markers = [];
  let nodeLines = null;
  let fly = null;

  function nodeRings(p, count) {
    const rings = count > 26 ? 3 : count > 12 ? 2 : 1;
    const per = Math.ceil(count / rings);
    return Array.from({ length: rings }, (_, k) => ({ radius: p.r * (1.75 + k * 0.8) + 1.2, n: Math.min(per, count - k * per) }));
  }

  function clearMarkers() {
    markers.forEach((m) => m.el.remove());
    markers = [];
    if (nodeLines) { scene.remove(nodeLines); nodeLines.traverse((o) => o.geometry && o.geometry.dispose()); nodeLines = null; }
  }

  function buildMarkers(name) {
    clearMarkers();
    const s = store();
    const pl = planets.get(name);
    if (!s || !pl) return 0;
    const nodes = s.A.nodes.filter((n) => n.p === name).sort((a, b) => (a.t === 'Bounty') - (b.t === 'Bounty') || a.n.localeCompare(b.n));
    const rings = nodeRings(pl.def, nodes.length);
    nodeLines = new THREE.Group();
    const lineMat = new THREE.LineBasicMaterial({ color: 0xbfe0f0, transparent: true, opacity: 0.18, depthWrite: false });
    let idx = 0;
    rings.forEach((ring, k) => {
      const pts = [];
      for (let i = 0; i < ring.n; i++) {
        const nd = nodes[idx++];
        const t = (i / ring.n) * Math.PI * 2 + k * 0.37;
        const p = pl.group.position.clone().add(new THREE.Vector3(Math.cos(t) * ring.radius, Math.sin(t * 3 + k) * 0.25, Math.sin(t) * ring.radius));
        pts.push(p);
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'node-mk';
        el.innerHTML = '<i></i><span class="nm-name"></span><span class="nm-sub"></span>';
        el.addEventListener('mouseenter', (ev) => s.showTip(ev, s.nodeTip(nd)));
        el.addEventListener('mousemove', (ev) => s.moveTip(ev));
        el.addEventListener('mouseleave', () => s.hideTip());
        el.addEventListener('click', (ev) => { ev.stopPropagation(); s.pin(nd.key); });
        labelLayer.appendChild(el);
        markers.push({ el, pos: p, node: nd });
      }
      pts.push(pts[0].clone());
      nodeLines.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    });
    scene.add(nodeLines);
    refresh();
    return rings[rings.length - 1].radius;
  }

  function flyTo(pos, target, done) {
    fly = { t: 0, dur: 1.25, p0: camera.position.clone(), t0: controls.target.clone(), p1: pos, t1: target, done };
    controls.enabled = false;
  }

  function goPlanet(name, nodeKey) {
    const pl = planets.get(name);
    if (!pl) return;
    view = name;
    const reach = buildMarkers(name) || pl.def.r * 4;
    const target = pl.group.position.clone();
    const away = target.clone().setY(0).normalize();
    const dir = new THREE.Vector3(away.x * 0.25, 1.6, away.z * 0.25 + 0.75).normalize();
    const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
    const free = W >= 1024 ? Math.max(0.3, (W - 760) / W) : 0.92;
    const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect * free);
    const dist = Math.max((reach * 1.12) / Math.tan(vHalf * 0.8), (reach * 1.12) / Math.tan(hHalf), pl.def.r * 5);
    controls.minDistance = pl.def.r * 2.2;
    controls.maxDistance = dist * 3;
    flyTo(target.clone().addScaledVector(dir, dist), target, () => {
      if (nodeKey) { const m = markers.find((x) => x.node.key === nodeKey); if (m) { m.el.classList.add('pulse'); setTimeout(() => m.el.classList.remove('pulse'), 2400); } }
    });
    document.body.classList.add('in-planet');
    refresh();
  }

  function goHome() {
    view = null;
    clearMarkers();
    controls.minDistance = 8;
    controls.maxDistance = 320;
    flyTo(HOME.pos.clone(), HOME.target.clone());
    document.body.classList.remove('in-planet');
    refresh();
  }

  function refresh() {
    const s = store();
    if (!s) return;
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
      L.classList.toggle('current', view === name);
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

  const v = new THREE.Vector3(), right = new THREE.Vector3();
  function project(p, out) {
    v.copy(p).project(camera);
    out.x = (v.x * 0.5 + 0.5) * W;
    out.y = (-v.y * 0.5 + 0.5) * H;
    out.z = v.z;
    return out;
  }
  const scr = { x: 0, y: 0, z: 0 }, scr2 = { x: 0, y: 0, z: 0 };
  function placeLabels() {
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    planets.forEach((pl, name) => {
      project(pl.group.position, scr);
      project(right.clone().multiplyScalar(pl.def.r).add(pl.group.position), scr2);
      const rad = Math.hypot(scr2.x - scr.x, scr2.y - scr.y);
      const behind = scr.z > 1;
      const hide = behind || !!view;
      pl.label.style.display = hide ? 'none' : '';
      if (hide) return;
      pl.label.style.transform = `translate(${scr.x.toFixed(1)}px,${scr.y.toFixed(1)}px)`;
      pl.label.style.setProperty('--r', Math.max(rad, 6).toFixed(1) + 'px');
      pl.label.classList.toggle('tiny', rad < 7 && !view);
    });
    if (!markers.length) return;
    const pl = planets.get(view);
    project(pl.group.position, scr);
    project(right.clone().multiplyScalar(pl.def.r).add(pl.group.position), scr2);
    const prad = Math.hypot(scr2.x - scr.x, scr2.y - scr.y);
    const camD = camera.position.distanceTo(pl.group.position);
    const c = { x: scr.x, y: scr.y };
    markers.forEach((m) => {
      project(m.pos, scr);
      const hidden = scr.z > 1 || (camera.position.distanceTo(m.pos) > camD && Math.hypot(scr.x - c.x, scr.y - c.y) < prad * 0.98);
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
    const k = camera.aspect < 1.2 ? Math.min(2.3, 1.25 / camera.aspect) : 1;
    HOME.pos.copy(HOME.base).sub(HOME.target).multiplyScalar(k).add(HOME.target);
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
    const hit = ray.intersectObjects(hitMeshes, false)[0];
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
    const moved = Math.hypot(ev.clientX - down.x, ev.clientY - down.y);
    down = null;
    if (moved > 6 || fly) return;
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
  window.addEventListener('atlas:home', () => { if (view) { const s = store(); if (s) s.closePlanet(); } else goHome(); });

  const clock = new THREE.Clock();
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    if (fly) {
      fly.t = Math.min(1, fly.t + dt / fly.dur);
      const k = ease(fly.t);
      camera.position.lerpVectors(fly.p0, fly.p1, k);
      controls.target.lerpVectors(fly.t0, fly.t1, k);
      camera.lookAt(controls.target);
      if (fly.t >= 1) { const d = fly.done; fly = null; controls.enabled = true; if (d) d(); }
    } else controls.update();
    planets.forEach((pl, name) => { pl.uniforms.uTime.value = t; pl.body.rotation.y += dt * (0.03 + 0.05 / pl.def.r) * (name === view ? 0.6 : 1); });
    glowA.material.rotation = t * 0.02;
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
