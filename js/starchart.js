import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const U = 9, FLAT = 0.55;
const at = (sx, sy) => [(sx - 960) / U, (sy - 540) / (U * FLAT)];

export const SYSTEM = [
  { name: 'Sedna', p: at(960, 140), r: 1.7, tex: 'ceres', tint: '#9a5a44', atmo: '#c9785a' },
  { name: 'Ceres', p: at(780, 312), r: 1.5, tex: 'ceres', tint: '#a07f5c' },
  { name: 'Phobos', p: at(1240, 278), r: 1.3, tex: 'ceres', tint: '#8c7c62', lumpy: true },
  { name: 'Mars', p: at(1160, 362), r: 2.4, tex: 'mars', tint: '#ffffff', atmo: '#e08a5e' },
  { name: 'Eris', p: at(1415, 350), r: 1.9, tex: 'eris', tint: '#e2b6c2', atmo: '#d7a0c8' },
  { name: 'Deimos', p: at(1035, 405), r: 1.6, kind: 'infested', tentacles: true, c: ['#4a3216', '#13110a', '#ff7a1a'], atmo: '#4a220c' },
  { name: 'Earth', p: at(1210, 540), r: 2.9, tex: 'earth', clouds: true, tint: '#ffffff', atmo: '#7fbfff', night: true },
  { name: 'Lua', p: at(1290, 560), r: 1.25, lua: true },
  { name: 'Pluto', p: at(1600, 535), r: 2.0, tex: 'eris', tint: '#d6e4ff', atmo: '#b8d4ff' },
  { name: 'Jupiter', p: at(580, 535), r: 5.0, tex: 'jupiter', tint: '#ffffff', atmo: '#f0d2a8' },
  { name: 'Europa', p: at(435, 540), r: 1.6, kind: 'ice', c: ['#d9d3a8', '#2f4a48', '#f4f0d8'], atmo: '#cfe8d8' },
  { name: 'Mercury', p: at(845, 635), r: 1.8, tex: 'moon', tint: '#e0b86c' },
  { name: 'Venus', p: at(1040, 718), r: 2.6, tex: 'venus', swirl: true, tint: '#f6c88a', atmo: '#f5c27a' },
  { name: 'Saturn', p: at(690, 800), r: 3.4, tex: 'saturn', tint: '#ffffff', atmo: '#f0dcae', ring: true },
  { name: 'Uranus', p: at(955, 920), r: 3.0, tex: 'uranus', swirl: true, tint: '#eaf8ff', atmo: '#c4f1ff', ringThin: true, tilt: 1.45 },
  { name: 'Neptune', p: at(1395, 840), r: 3.0, tex: 'uranus', swirl: true, tint: '#4a72e8', atmo: '#6f96ff' },
  { name: 'Void', p: at(270, 545), r: 2.2, special: 'rift' },
  { name: 'Zariman', p: at(245, 370), r: 2.0, special: 'zariman', late: true },
  { name: 'Kuva Fortress', p: at(250, 765), r: 1.7, special: 'fortress', moving: true },
  { name: 'Veil Proxima', p: at(1760, 190), r: 2.4, special: 'nebula' },
  { name: 'Duviri', card: true },
  { name: 'Höllvania', card: true },
  { name: 'Sanctuary', card: true },
];

const KIND = { infested: 4, ice: 3, cloud: 7, city: 8, holo: 9 };
const LEAN = -0.5;
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
varying vec3 vObjN;varying vec3 vWorldN;varying vec3 vWorldPos;varying vec2 vUv;varying vec3 vCenter;varying vec3 vEast;varying vec3 vNorth;
void main(){
  vUv=uv;vObjN=normal;mat3 m=mat3(modelMatrix);vWorldN=normalize(m*normal);
  vec3 e=cross(vec3(0.0,1.0,0.0),normal);if(dot(e,e)<1e-6)e=vec3(1.0,0.0,0.0);
  vEast=normalize(m*e);vNorth=normalize(cross(vWorldN,vEast));
  vec4 wp=modelMatrix*vec4(position,1.0);vWorldPos=wp.xyz;vCenter=(modelMatrix*vec4(0.0,0.0,0.0,1.0)).xyz;
  gl_Position=projectionMatrix*viewMatrix*wp;
}
`;

const SHADE = `
uniform vec3 uAtmo;uniform float uAtmoStr;uniform float uTime;uniform float uBump;
varying vec3 vObjN;varying vec3 vWorldN;varying vec3 vWorldPos;varying vec2 vUv;varying vec3 vCenter;varying vec3 vEast;varying vec3 vNorth;
vec3 sunDir(vec3 V){return normalize(normalize(-vCenter)+V*0.38+vec3(0.0,0.3,0.0));}
float dayOf(vec3 Ng,vec3 L){return smoothstep(-0.16,0.42,dot(Ng,L));}
vec3 lightUp(vec3 alb,vec3 N,vec3 Ng,vec3 V,vec3 L,float spec,float gloss){
  float ndl=max(dot(N,L),0.0);float day=dayOf(Ng,L);
  float diff=ndl*0.8+day*0.38;
  vec3 H=normalize(L+V);float sp=pow(max(dot(N,H),0.0),gloss)*spec*day;
  float fr=pow(1.0-max(dot(Ng,V),0.0),3.2);
  vec3 col=alb*(0.016+diff*0.98)+vec3(1.0,0.92,0.78)*sp;
  float glow=smoothstep(-0.3,0.75,dot(Ng,L));
  col+=uAtmo*uAtmoStr*fr*(0.04+1.1*glow);
  col+=uAtmo*uAtmoStr*0.06*day;
  return col;
}
vec3 bumpOf(sampler2D map,vec2 uv,vec3 Ng,float k){
  vec2 d=vec2(1.0/1024.0,1.0/512.0);
  float h0=dot(texture2D(map,uv).rgb,vec3(0.333));
  float hx=dot(texture2D(map,uv+vec2(d.x,0.0)).rgb,vec3(0.333));
  float hy=dot(texture2D(map,uv+vec2(0.0,d.y)).rgb,vec3(0.333));
  return normalize(Ng-k*((hx-h0)*vEast+(hy-h0)*vNorth));
}
`;

const TEX_FS = `
uniform sampler2D uMap;uniform vec3 uTint;uniform float uMono;uniform float uGas;uniform float uDetail;uniform float uSwirl;
${SHADE}
${NOISE}
void main(){
  vec3 Ng=normalize(vWorldN);vec3 V=normalize(cameraPosition-vWorldPos);vec3 L=sunDir(V);
  vec2 uv=vUv;
  if(uGas>0.5){float w=snoise(vec3(uv.x*6.0,uv.y*48.0,uTime*0.02));uv.x+=w*0.004+uTime*0.0004*sin(uv.y*31.0);uv.y+=snoise(vec3(uv.x*18.0,uv.y*90.0,uTime*0.03))*0.0016;}
  vec3 base=texture2D(uMap,uv).rgb;
  float lum=dot(base,vec3(0.299,0.587,0.114));
  vec3 alb=mix(base,vec3(lum)*1.3,uMono)*uTint;
  vec3 n=normalize(vObjN);
  if(uSwirl>0.0){vec3 q=n*vec3(2.2,5.5,2.2);float w=fbm(q+vec3(fbm(q*1.8+vec3(uTime*0.012,0.0,0.0)))*1.6);float band=sin(n.y*16.0+w*3.4);alb*=0.8+0.26*w+0.07*band;alb=mix(alb,alb*vec3(1.12,1.07,1.0),smoothstep(0.15,0.7,w)*0.5);}
  if(uDetail>0.0){float dn=fbm(n*26.0)*0.6+snoise(n*90.0)*0.25;alb*=1.0+dn*uDetail;}
  vec3 N=uBump>0.0?bumpOf(uMap,uv,Ng,uBump):Ng;
  if(uDetail>0.0){vec3 eo=normalize(cross(vec3(0.0,1.0,0.0),n)+1e-5);vec3 no=cross(n,eo);float s0=snoise(n*60.0);float sx=snoise((n+eo*0.004)*60.0);float sy=snoise((n+no*0.004)*60.0);N=normalize(N-uDetail*0.9*((sx-s0)*vEast+(sy-s0)*vNorth));}
  vec3 col=lightUp(alb,N,Ng,V,L,uGas>0.5?0.05:0.08,uGas>0.5?12.0:18.0);
  gl_FragColor=vec4(col,1.0);
}
`;

const EARTH_FS = `
uniform sampler2D uMap;uniform sampler2D uNormal;uniform sampler2D uSpec;uniform sampler2D uNight;uniform sampler2D uClouds;uniform float uCloudShift;
${SHADE}
void main(){
  vec3 Ng=normalize(vWorldN);vec3 V=normalize(cameraPosition-vWorldPos);vec3 L=sunDir(V);
  vec3 alb=texture2D(uMap,vUv).rgb;
  float lum=dot(alb,vec3(0.299,0.587,0.114));
  float sea=texture2D(uSpec,vUv).r;
  alb=mix(alb,alb*vec3(0.78,1.06,0.82),(1.0-sea)*smoothstep(0.02,0.1,lum)*0.6);
  vec3 nm=texture2D(uNormal,vUv).xyz*2.0-1.0;
  vec3 N=normalize(vEast*nm.x*uBump+vNorth*nm.y*uBump+Ng*nm.z);
  vec2 sh=vec2(dot(L,vEast),dot(L,vNorth))*0.004;
  float cs=texture2D(uClouds,vUv+vec2(uCloudShift,0.0)+sh).r;
  alb*=1.0-cs*0.45;
  vec3 col=lightUp(alb,N,Ng,V,L,sea*0.9,60.0);
  float day=dayOf(Ng,L);
  float city=pow(texture2D(uNight,vUv).r,1.6);
  col+=vec3(1.0,0.66,0.32)*city*(1.0-day)*2.2*(1.0-cs*0.8);
  gl_FragColor=vec4(col,1.0);
}
`;

const CLOUD_FS = `
uniform sampler2D uClouds;uniform float uCloudShift;
${SHADE}
void main(){
  vec3 Ng=normalize(vWorldN);vec3 V=normalize(cameraPosition-vWorldPos);vec3 L=sunDir(V);
  float c=texture2D(uClouds,vUv+vec2(uCloudShift,0.0)).r;
  c=smoothstep(0.08,0.9,c);
  float day=dayOf(Ng,L);
  float lit=max(dot(Ng,L),0.0)*0.85+day*0.3;
  vec3 col=vec3(1.0,0.98,0.95)*(0.01+lit*0.92);
  float fr=pow(1.0-max(dot(Ng,V),0.0),2.0);
  col+=uAtmo*fr*day*0.5;
  gl_FragColor=vec4(col,c*(0.92-fr*0.4));
}
`;

const PROC_FS = `
uniform int uKind;uniform vec3 uA;uniform vec3 uB;uniform vec3 uC;uniform float uSeed;
${SHADE}
${NOISE}
float height(vec3 p){
  if(uKind==3)return fbm(p*1.6)*0.7+(1.0-smoothstep(0.0,0.04,abs(fbm(p*3.2))))*-0.4;
  if(uKind==4){float h=fbm(p*2.2);float pu=smoothstep(0.62,0.85,snoise(p*8.0))*smoothstep(0.0,0.45,h);return h*0.35+pu*0.12;}
  if(uKind==8)return fbm(p*2.0)*0.6+step(0.55,fract(p.x*9.0))*step(0.55,fract(p.z*9.0))*0.15;
  return 0.0;
}
void main(){
  vec3 n=normalize(vObjN);vec3 p=n*2.0+uSeed;vec3 col=uA;vec3 emis=vec3(0.0);float night=0.0;
  vec3 Ng=normalize(vWorldN);vec3 V=normalize(cameraPosition-vWorldPos);vec3 L=sunDir(V);
  if(uKind==3){float h=fbm(p*1.6);col=mix(uB,uA,smoothstep(-0.4,0.5,h+n.x*0.6));float cr=1.0-smoothstep(0.0,0.03,abs(fbm(p*3.2)));col=mix(col,uB*0.5,cr*0.75);col=mix(col,uC,smoothstep(0.3,0.8,fbm(p*5.0))*0.3);}
  else if(uKind==4){float h=fbm(p*2.2);float rg=pow(max(1.0-abs(snoise(p*3.4+3.0)),0.0),18.0);float rg2=pow(max(1.0-abs(snoise(p*7.0+9.0)),0.0),26.0);float fine=fbm(p*9.0);float pu=smoothstep(0.62,0.85,snoise(p*8.0))*smoothstep(0.0,0.45,h);col=mix(uB,uA,smoothstep(-0.45,0.6,h+fine*0.25));col=mix(col,vec3(0.06,0.07,0.02),smoothstep(0.1,0.6,fbm(p*4.0+5.0))*0.6);col*=0.7+fine*0.4;col=mix(col,uC*0.5,pu*0.5);float pulse=0.75+0.25*sin(uTime*1.1+h*12.0);emis=uC*(rg*0.55+rg2*0.3+pu*0.3)*pulse;}
  else if(uKind==7){float w=fbm(p*1.4+vec3(fbm(p*2.0+uTime*0.01)));col=mix(uB,uA,w*0.5+0.55);col=mix(col,uC,smoothstep(0.15,0.85,w)*0.55);}
  else if(uKind==8){float h=fbm(p*2.0);col=mix(uB,uA,h*0.5+0.5);float grid=step(0.92,fract(p.x*14.0))+step(0.92,fract(p.z*14.0));float lights=smoothstep(0.45,0.8,snoise(p*20.0))*smoothstep(-0.2,0.3,fbm(p*3.0));night=lights*2.0+clamp(grid,0.0,1.0)*0.35;}
  else{float lat=1.0-smoothstep(0.0,0.035,abs(fract(n.y*9.0)-0.5));float lon=1.0-smoothstep(0.0,0.03,abs(fract(atan(n.z,n.x)*1.909859)-0.5));float hex=smoothstep(0.55,0.75,snoise(n*14.0+uTime*0.05));float sd=(n.y-sin(uTime*0.35))*7.0;float scan=exp(-sd*sd);float fr=pow(1.0-max(dot(Ng,V),0.0),2.2);col=uA*0.12;emis=uA*(lat+lon)*0.22+uA*hex*0.08+uC*scan*0.25+uA*fr*0.9+uA*0.03;}
  vec3 N=Ng;
  if(uKind==3||uKind==4||uKind==8){vec3 eo=normalize(cross(vec3(0.0,1.0,0.0),n)+1e-5);vec3 no=cross(n,eo);float e=0.01;float h0=height(p);float hx=height(p+eo*e*2.0);float hy=height(p+no*e*2.0);N=normalize(Ng-uBump*((hx-h0)*vEast+(hy-h0)*vNorth)/e);}
  vec3 lit=lightUp(col,N,Ng,V,L,uKind==3?0.35:0.06,uKind==3?40.0:14.0);
  float day=dayOf(Ng,L);
  lit+=emis+uC*night*(1.0-day*0.85);
  gl_FragColor=vec4(lit,1.0);
}
`;

const HALO_VS = `varying vec3 vWorldPos;varying vec3 vCenter;void main(){vec4 wp=modelMatrix*vec4(position,1.0);vWorldPos=wp.xyz;vCenter=(modelMatrix*vec4(0.0,0.0,0.0,1.0)).xyz;gl_Position=projectionMatrix*viewMatrix*wp;}`;
const HALO_FS = `uniform vec3 uAtmo;uniform float uStr;uniform float uEdge;varying vec3 vWorldPos;varying vec3 vCenter;
void main(){vec3 V=normalize(cameraPosition-vWorldPos);vec3 R=normalize(vWorldPos-vCenter);float d=max(dot(-R,V),0.0);
float f=pow(clamp(d/uEdge,0.0,1.0),3.0);
vec3 L=normalize(normalize(-vCenter)+V*0.38+vec3(0.0,0.3,0.0));float s=smoothstep(-0.45,0.6,dot(R,L));
gl_FragColor=vec4(uAtmo*f*uStr*(0.12+s*1.7),1.0);}`;

const RING_VS = `varying vec3 vPos;varying vec3 vWorldPos;varying vec3 vCenter;void main(){vPos=position;vec4 wp=modelMatrix*vec4(position,1.0);vWorldPos=wp.xyz;vCenter=(modelMatrix*vec4(0.0,0.0,0.0,1.0)).xyz;gl_Position=projectionMatrix*viewMatrix*wp;}`;
const RING_FS = `uniform sampler2D uMap;uniform float uIn;uniform float uOut;uniform float uAlpha;uniform float uR;varying vec3 vPos;varying vec3 vWorldPos;varying vec3 vCenter;
void main(){float r=(length(vPos.xy)-uIn)/(uOut-uIn);vec4 t=texture2D(uMap,vec2(clamp(r,0.0,1.0),0.5));
vec3 V=normalize(cameraPosition-vWorldPos);vec3 L=normalize(normalize(-vCenter)+V*0.38+vec3(0.0,0.3,0.0));
vec3 P=vWorldPos-vCenter;float along=dot(P,L);float perp=length(P-L*along);float sh=along<0.0?smoothstep(uR*0.97,uR*1.03,perp):1.0;
gl_FragColor=vec4(t.rgb*(0.08+0.95*sh),t.a*uAlpha);}`;

const NEBULA_VS = `varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const NEBULA_FS = `
varying vec3 vDir;
${NOISE}
void main(){vec3 d=normalize(vDir);float n1=fbm(d*1.8+vec3(3.0));float n2=fbm(d*3.2+vec3(11.0));float n3=fbm(d*6.0+vec3(5.0));float n4=fbm(d*12.0+vec3(2.0));
vec3 c=vec3(0.016,0.038,0.052);
c+=vec3(0.06,0.17,0.22)*smoothstep(-0.3,0.6,n1)*(0.8+0.4*n4);
c+=vec3(0.05,0.11,0.20)*smoothstep(0.0,0.7,n2)*0.8;
c=mix(c,vec3(0.008,0.012,0.016),smoothstep(0.15,0.55,n3)*0.6);
c+=vec3(0.12,0.08,0.05)*smoothstep(0.35,0.8,n1*n2*2.2)*0.6;
c+=vec3(0.10,0.05,0.12)*smoothstep(0.45,0.9,n2*n4*2.5)*0.35;
gl_FragColor=vec4(pow(c,vec3(2.2))*1.6,1.0);}
`;

const STAR_VS = `attribute float aSize;attribute vec3 aColor;attribute float aPhase;uniform float uTime;uniform float uPx;varying vec3 vColor;varying float vTw;
void main(){vColor=aColor;vTw=0.75+0.25*sin(uTime*(0.6+aPhase*1.7)+aPhase*40.0);vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=aSize*uPx;gl_Position=projectionMatrix*mv;}`;
const STAR_FS = `varying vec3 vColor;varying float vTw;void main(){vec2 q=gl_PointCoord-0.5;float r=length(q)*2.0;float core=exp(-r*r*9.0);float halo=exp(-r*3.5)*0.25;float spike=(exp(-abs(q.x)*40.0)*exp(-abs(q.y)*5.0)+exp(-abs(q.y)*40.0)*exp(-abs(q.x)*5.0))*0.35;float a=(core+halo+spike)*vTw;if(a<0.01)discard;gl_FragColor=vec4(vColor*a,1.0);}`;

const AURORA_VS = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const AURORA_FS = `uniform float uTime;uniform float uGain;varying vec2 vUv;
${NOISE}
void main(){
  float n=snoise(vec3(vUv.x*22.0,uTime*0.12,1.7));
  float n2=snoise(vec3(vUv.x*70.0,uTime*0.25,4.1));
  float rays=pow(0.5+0.5*sin(vUv.x*240.0+n*7.0+uTime*0.35),2.5)*0.75+pow(0.5+0.5*sin(vUv.x*520.0+n2*5.0-uTime*0.6),6.0)*0.6;
  float y=clamp(vUv.y,0.0,1.0);float h=1.0-y;
  float fall=pow(h,2.4)*(0.65+0.35*snoise(vec3(vUv.x*9.0,vUv.y*3.0-uTime*0.08,8.0)));
  float edge=smoothstep(0.0,0.05,y);
  float ends=smoothstep(0.0,0.07,vUv.x)*smoothstep(1.0,0.86,vUv.x);
  float base=exp(-y*38.0)*1.6;
  float a=((0.15+rays)*fall*edge+base)*ends*uGain;
  gl_FragColor=vec4(vec3(0.9,0.94,1.0)*clamp(a,0.0,4.0),1.0);
}`;

const TENT_FS = `
uniform vec3 uA;uniform vec3 uC;
${SHADE}
void main(){
  vec3 Ng=normalize(vWorldN);vec3 V=normalize(cameraPosition-vWorldPos);vec3 L=sunDir(V);
  float t=vUv.x;
  vec3 alb=uA*(0.8+0.2*sin(t*11.0));
  vec3 col=lightUp(alb,Ng,Ng,V,L,0.15,24.0);
  col+=uC*pow(smoothstep(0.45,1.0,t),2.0)*1.8+uC*0.35*pow(0.5+0.5*sin(t*30.0-uTime*1.4),10.0)*smoothstep(0.2,0.6,t);
  gl_FragColor=vec4(col,1.0);
}
`;

const SUN_FS = `uniform float uTime;varying vec3 vObjN;varying vec3 vWorldN;varying vec3 vWorldPos;
${NOISE}
void main(){vec3 V=normalize(cameraPosition-vWorldPos);float mu=max(dot(normalize(vWorldN),V),0.0);vec3 n=normalize(vObjN);
float g=fbm(n*7.0+vec3(0.0,uTime*0.05,0.0))*0.5+snoise(n*22.0+uTime*0.1)*0.25;
vec3 c=mix(vec3(4.2,1.7,0.5),vec3(6.0,4.6,2.8),pow(mu,0.6));c*=0.85+g*0.35;c*=0.55+0.45*pow(mu,0.35);
gl_FragColor=vec4(c,1.0);}`;
const SUN_VS = `varying vec3 vObjN;varying vec3 vWorldN;varying vec3 vWorldPos;void main(){vObjN=normal;vWorldN=normalize(mat3(modelMatrix)*normal);vec4 wp=modelMatrix*vec4(position,1.0);vWorldPos=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}`;

const FINISH_FS = `uniform sampler2D tDiffuse;uniform float uTime;uniform vec2 uRes;varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 q=vUv-0.5;float d=length(q*vec2(uRes.x/uRes.y,1.0)*0.9);
vec2 off=q*0.0016*d;vec3 c=vec3(texture2D(tDiffuse,vUv+off).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-off).b);
c*=mix(1.0,0.58,smoothstep(0.35,1.05,d));
c+=(hash(vUv*uRes+fract(uTime*7.0)*91.0)-0.5)*0.022;
gl_FragColor=vec4(c,1.0);}`;
const FINISH_VS = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;

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
  renderer.setClearColor(0x010204, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.prepend(renderer.domElement);

  const loader = new THREE.TextureLoader();
  const texCache = {};
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const tex = (name, ext = 'jpg', data = false) => {
    if (!texCache[name]) {
      const t = loader.load(`media/planets/${name}.${ext}`);
      t.anisotropy = Math.min(8, maxAniso);
      t.wrapS = THREE.RepeatWrapping;
      if (!data) t.colorSpace = THREE.SRGBColorSpace;
      texCache[name] = t;
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

  scene.add(new THREE.HemisphereLight(0xcfe0ee, 0x2a1a14, 0.5), new THREE.PointLight(0xffe6c8, 3.2, 0, 0));
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }));
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.75, 0.6, 1.25);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const finish = new ShaderPass({ uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } }, vertexShader: FINISH_VS, fragmentShader: FINISH_FS });
  composer.addPass(finish);

  const nebula = new THREE.Mesh(new THREE.SphereGeometry(1800, 48, 32), new THREE.ShaderMaterial({ vertexShader: NEBULA_VS, fragmentShader: NEBULA_FS, side: THREE.BackSide, depthWrite: false }));
  scene.add(nebula);

  const starGeo = new THREE.BufferGeometry();
  const N = 7000, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), size = new Float32Array(N), phase = new Float32Array(N);
  const STAR_TINTS = [[0.62, 0.74, 1.0], [0.85, 0.9, 1.0], [1.0, 1.0, 1.0], [1.0, 0.92, 0.78], [1.0, 0.78, 0.6]];
  for (let i = 0; i < N; i++) {
    const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, rr = 1100 + Math.random() * 500;
    const s = Math.sqrt(1 - u * u);
    pos.set([rr * s * Math.cos(th), rr * u, rr * s * Math.sin(th)], i * 3);
    const bright = Math.pow(Math.random(), 7);
    const tint = STAR_TINTS[Math.floor(Math.random() * STAR_TINTS.length)];
    const b = 0.14 + bright * 1.5;
    col.set([tint[0] * b, tint[1] * b, tint[2] * b], i * 3);
    size[i] = 1.6 + bright * 4.5 + Math.random() * 0.8;
    phase[i] = Math.random();
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  starGeo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  starGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  starGeo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
  const starMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uPx: { value: renderer.getPixelRatio() } }, vertexShader: STAR_VS, fragmentShader: STAR_FS, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  const grid = new THREE.Group();
  const dashMat = new THREE.LineDashedMaterial({ color: 0x9fc6cf, dashSize: 0.5, gapSize: 1.1, transparent: true, opacity: 0.11, depthWrite: false });
  [16, 30, 46, 62, 78, 94, 112].forEach((d) => {
    const pts = [];
    for (let i = 0; i <= 240; i++) { const t = (i / 240) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t) * d, 0, Math.sin(t) * d * 0.92)); }
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), dashMat);
    l.computeLineDistances();
    grid.add(l);
  });
  const spokeMat = new THREE.LineBasicMaterial({ color: 0xb8d6dc, transparent: true, opacity: 0.045, depthWrite: false });
  for (let i = 0; i < 16; i++) {
    const t = (i / 16) * Math.PI * 2;
    grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(t) * 4, 0, Math.sin(t) * 4), new THREE.Vector3(Math.cos(t) * 150, 0, Math.sin(t) * 150)]), spokeMat));
  }
  scene.add(grid);

  const sun = new THREE.Group();
  const sunMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 } }, vertexShader: SUN_VS, fragmentShader: SUN_FS });
  sun.add(new THREE.Mesh(new THREE.SphereGeometry(1.6, 64, 32), sunMat));
  const sunGlow = new THREE.Sprite(additive(glowTex([[0, 'rgba(255,236,200,1)'], [0.15, 'rgba(255,170,80,0.8)'], [0.45, 'rgba(230,110,40,0.2)'], [1, 'rgba(200,80,30,0)']])));
  sunGlow.scale.set(18, 18, 1);
  const sunHalo = new THREE.Sprite(additive(glowTex([[0, 'rgba(255,190,120,0.35)'], [0.4, 'rgba(220,120,60,0.08)'], [1, 'rgba(0,0,0,0)']])));
  sunHalo.scale.set(70, 70, 1);
  const sunStreak = new THREE.Sprite(additive(glowTex([[0, 'rgba(255,220,170,0.9)'], [0.3, 'rgba(255,170,100,0.25)'], [1, 'rgba(0,0,0,0)']]), 0.8));
  sunStreak.scale.set(46, 1.6, 1);
  sun.add(sunGlow, sunHalo, sunStreak);
  scene.add(sun);

  const planets = new Map();
  const timed = [];
  const hitMeshes = [];
  const sphereGeo = new THREE.SphereGeometry(1, 96, 64);
  const lateObjects = [];

  function halo(group, r, color, k = 1.09, str = 1) {
    const h = new THREE.Mesh(sphereGeo, new THREE.ShaderMaterial({ uniforms: { uAtmo: { value: new THREE.Color(color) }, uStr: { value: str }, uEdge: { value: Math.sqrt(1 - 1 / (k * k)) } }, vertexShader: HALO_VS, fragmentShader: HALO_FS, side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    h.scale.setScalar(r * k);
    group.add(h);
  }

  function wisps(group, color, count, span, height, strands) {
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.045, blending: THREE.AdditiveBlending, depthWrite: false });
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

  const VOID_PATH = [[200, 190], [262, 165], [328, 180], [360, 216], [384, 282], [400, 342], [424, 422], [482, 446], [540, 435], [600, 438], [660, 470], [722, 492], [780, 475], [812, 458], [880, 458], [915, 468]];
  function makeVoid(group, p) {
    const k = (p.r * 9.5) / 715;
    const curve = new THREE.CatmullRomCurve3(VOID_PATH.map(([x, y]) => new THREE.Vector3((x - 560) * k, 0, (y - 330) * k)), false, 'centripetal');
    const N = 320, pts = curve.getSpacedPoints(N);
    const curtain = (height, gain, wobble) => {
      const pos = new Float32Array((N + 1) * 6), uv = new Float32Array((N + 1) * 4), idx = [];
      pts.forEach((q, i) => {
        const t = i / N;
        const h = height * (0.55 + 0.45 * Math.sin(t * 9.0 + 1.3) * Math.sin(t * 3.1 + 0.4) + 0.25 * Math.sin(t * 23.0));
        const sway = Math.sin(t * 14.0) * wobble;
        pos.set([q.x, 0, q.z, q.x + sway, Math.max(h, height * 0.25), q.z - sway * 0.6], i * 6);
        uv.set([t, 0, t, 1], i * 4);
        if (i < N) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
      });
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      g.setIndex(idx);
      const m = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uGain: { value: gain } }, vertexShader: AURORA_VS, fragmentShader: AURORA_FS, side: THREE.DoubleSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
      timed.push(m.uniforms.uTime);
      group.add(new THREE.Mesh(g, m));
    };
    curtain(p.r * 1.5, 1.1, p.r * 0.06);
    curtain(p.r * 0.75, 0.7, -p.r * 0.1);
    const D = 1400, dpos = new Float32Array(D * 3), dcol = new Float32Array(D * 3), dsize = new Float32Array(D), dph = new Float32Array(D);
    for (let i = 0; i < D; i++) {
      const q = curve.getPointAt(Math.random());
      const spread = Math.pow(Math.random(), 2) * p.r * 0.35;
      const a = Math.random() * Math.PI * 2;
      dpos.set([q.x + Math.cos(a) * spread, Math.pow(Math.random(), 2.2) * p.r * 1.3, q.z + Math.sin(a) * spread], i * 3);
      const b = 0.35 + Math.pow(Math.random(), 4) * 2.2;
      dcol.set([b * 0.92, b * 0.95, b], i * 3);
      dsize[i] = 1.2 + Math.random() * 2.4;
      dph[i] = Math.random();
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
    dg.setAttribute('aColor', new THREE.BufferAttribute(dcol, 3));
    dg.setAttribute('aSize', new THREE.BufferAttribute(dsize, 1));
    dg.setAttribute('aPhase', new THREE.BufferAttribute(dph, 1));
    const dm = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uPx: { value: renderer.getPixelRatio() } }, vertexShader: STAR_VS, fragmentShader: STAR_FS, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
    timed.push(dm.uniforms.uTime);
    group.add(new THREE.Points(dg, dm));
    const glow = new THREE.Sprite(additive(glowTex([[0, 'rgba(230,236,255,0.5)'], [0.3, 'rgba(160,170,200,0.12)'], [1, 'rgba(0,0,0,0)']]), 0.8));
    glow.scale.set(p.r * 4, p.r * 4, 1);
    glow.position.copy(curve.getPointAt(0.3));
    group.add(glow);
    return null;
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

  function rockGeo(seed, detail = 3) {
    const g = new THREE.IcosahedronGeometry(1, detail);
    const ps2 = g.attributes.position, vv = new THREE.Vector3();
    for (let k = 0; k < ps2.count; k++) {
      vv.fromBufferAttribute(ps2, k);
      const d = 1 + 0.22 * Math.sin(vv.x * 3.3 + seed) * Math.cos(vv.y * 2.9 + seed * 0.7) + 0.12 * Math.sin(vv.z * 6.1 + seed * 1.3);
      vv.multiplyScalar(d);
      ps2.setXYZ(k, vv.x * 1.15, vv.y * 0.85, vv.z);
    }
    g.computeVertexNormals();
    return g;
  }

  function makeFortress(group, p) {
    const fort = new THREE.Group();
    const hull = new THREE.MeshStandardMaterial({ color: 0x6a5f72, emissive: 0x1c141e, roughness: 0.38, metalness: 0.75 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x3a3440, roughness: 0.55, metalness: 0.7 });
    const stone = new THREE.MeshStandardMaterial({ color: 0x5c5560, roughness: 0.9, metalness: 0.05, map: tex('moon'), bumpMap: tex('moon'), bumpScale: 2 });
    const red = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 0.3, 0.15) });
    const profile = [[0.0, -1.75], [0.05, -1.6], [0.12, -1.25], [0.2, -0.8], [0.28, -0.3], [0.34, 0.15], [0.36, 0.5], [0.3, 0.78], [0.2, 0.95], [0.0, 1.0]].map(([x, y]) => new THREE.Vector2(x, y));
    const spine = new THREE.Mesh(new THREE.LatheGeometry(profile, 28), hull);
    spine.scale.set(1, 1, 0.62);
    fort.add(spine);
    [-1, 1].forEach((side) => {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.9, 0.22), dark);
      fin.position.set(side * 0.27, -0.35, 0);
      fin.rotation.z = side * 0.09;
      fort.add(fin);
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.2, 0.5), hull);
      rib.position.set(side * 0.12, -0.2, 0.12);
      rib.rotation.z = -side * 0.05;
      fort.add(rib);
    });
    const capShape = new THREE.Shape();
    capShape.moveTo(-0.95, 0.0);
    capShape.bezierCurveTo(-0.6, 0.32, 0.2, 0.42, 1.05, 0.2);
    capShape.lineTo(0.92, 0.06);
    capShape.bezierCurveTo(0.4, 0.02, -0.2, -0.22, -0.95, 0.0);
    const cap = new THREE.Mesh(new THREE.ExtrudeGeometry(capShape, { depth: 0.38, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.04, bevelSegments: 3, curveSegments: 24 }), hull);
    cap.position.set(-0.02, 0.88, -0.19);
    cap.rotation.z = 0.06;
    fort.add(cap);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 0.28, 10), dark);
    crown.position.set(-0.05, 0.82, 0);
    fort.add(crown);
    const rnd = (k) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    for (let i = 0; i < 18; i++) {
      const y = -1.3 + rnd(i) * 2.0;
      const a = rnd(i + 40) * Math.PI * 2;
      const d = 0.32 + rnd(i + 80) * 0.22;
      const sc = 0.07 + rnd(i + 120) * 0.13;
      const r = new THREE.Mesh(rockGeo(i), stone);
      r.scale.setScalar(sc);
      r.position.set(Math.cos(a) * d, y, Math.sin(a) * d * 0.7);
      r.rotation.set(rnd(i + 3) * 3, rnd(i + 5) * 3, rnd(i + 7) * 3);
      fort.add(r);
    }
    const tethered = [[-1.15, 0.55, 0.1, 0.3], [1.2, 0.35, -0.1, 0.26], [0.95, -0.55, 0.2, 0.18], [-0.85, -0.85, -0.15, 0.16], [0.55, 1.25, 0.05, 0.08]];
    tethered.forEach(([x, y, z, sc], i) => {
      const r = new THREE.Mesh(rockGeo(i + 50), stone);
      r.scale.setScalar(sc);
      r.position.set(x, y, z);
      fort.add(r);
      if (sc < 0.12) return;
      const from = new THREE.Vector3(Math.sign(x) * 0.25, y - 0.1, 0);
      const to = new THREE.Vector3(x - Math.sign(x) * sc * 0.8, y, z);
      const mid = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, -0.3, 0.05));
      fort.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([from, mid, to]), 24, 0.028, 6, false), dark));
    });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const pts = [new THREE.Vector3(0, -1.55, 0)];
      for (let k = 1; k <= 4; k++) pts.push(new THREE.Vector3(Math.cos(a) * 0.05 * k + Math.sin(k + i) * 0.04, -1.55 - k * 0.12, Math.sin(a) * 0.05 * k));
      fort.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.012, 5, false), dark));
    }
    for (let i = 0; i < 14; i++) {
      const y = -1.1 + rnd(i + 200) * 1.9;
      const a = (rnd(i + 230) - 0.5) * 2.2 + (i % 2 ? Math.PI : 0);
      const rr = 0.3 * Math.min(1, (y + 1.75) / 1.6) + 0.02;
      const light = new THREE.Mesh(new THREE.SphereGeometry(0.018 + rnd(i + 260) * 0.02, 8, 6), red);
      light.position.set(Math.sin(a) * rr, y, Math.cos(a) * rr * 0.62);
      fort.add(light);
    }
    for (let i = 0; i < 3; i++) {
      const slit = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.012, 0.01), red);
      slit.position.set(0, 0.35 - i * 0.18, 0.225);
      fort.add(slit);
    }
    fort.scale.setScalar(p.r * 0.62);
    fort.rotation.set(-0.72, 0, 0.08);
    group.add(fort);
    const glow = new THREE.Sprite(additive(glowTex([[0, 'rgba(255,70,50,0.35)'], [0.4, 'rgba(190,25,25,0.08)'], [1, 'rgba(0,0,0,0)']])));
    glow.scale.set(p.r * 3.5, p.r * 4.5, 1);
    group.add(glow);
    return fort;
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

  function luaGeo() {
    const rnd = (k) => { const x = Math.sin(k * 78.233 + 12.9898) * 43758.5453; return x - Math.floor(x); };
    const cells = [];
    for (let i = 0; i < 52; i++) {
      const y = 1 - 2 * ((i + 0.5) / 52), rr = Math.sqrt(1 - y * y), a = i * 2.39996 + rnd(i) * 0.9;
      const c = new THREE.Vector3(Math.cos(a) * rr + (rnd(i + 7) - 0.5) * 0.25, y + (rnd(i + 9) - 0.5) * 0.2, Math.sin(a) * rr + (rnd(i + 11) - 0.5) * 0.25).normalize();
      const gone = rnd(i + 31) < 0.14;
      cells.push({ c, h: gone ? -0.09 - rnd(i + 3) * 0.04 : (rnd(i + 5) - 0.4) * 0.045, gone, shade: rnd(i + 13) });
    }
    const g = new THREE.SphereGeometry(1, 192, 144);
    const pos = g.attributes.position, v = new THREE.Vector3(), col = new Float32Array(pos.count * 3);
    const plate = new THREE.Color(), dark = new THREE.Color('#1d1517'), core = new THREE.Color('#4a2f28'), hi = new THREE.Color('#d2b9c0'), lo = new THREE.Color('#86707a');
    for (let k = 0; k < pos.count; k++) {
      v.fromBufferAttribute(pos, k).normalize();
      let d1 = -2, d2 = -2, best = null;
      for (const cell of cells) {
        const d = v.dot(cell.c);
        if (d > d1) { d2 = d1; d1 = d; best = cell; } else if (d > d2) d2 = d;
      }
      const edge = Math.min(1, Math.max(0, (d1 - d2) / 0.012));
      const crack = 1 - edge;
      const grain = 0.007 * Math.sin(v.x * 31 + v.y * 17) * Math.cos(v.z * 23 - v.x * 11) + 0.004 * Math.sin(v.y * 77 + v.z * 61) * Math.cos(v.x * 53);
      const r = 1 + best.h * edge - 0.06 * crack + grain;
      pos.setXYZ(k, v.x * r, v.y * r, v.z * r);
      if (best.gone) plate.copy(core).lerp(dark, 0.35 + 0.4 * Math.abs(Math.sin(v.y * 40 + v.x * 25)));
      else plate.copy(lo).lerp(hi, 0.25 + best.shade * 0.6 + grain * 25);
      plate.lerp(dark, Math.min(1, crack * 1.4));
      col[k * 3] = plate.r; col[k * 3 + 1] = plate.g; col[k * 3 + 2] = plate.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }

  function makeLua(group, p) {
    const body = new THREE.Mesh(luaGeo(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0.05, emissive: 0x150d10 }));
    body.scale.setScalar(p.r);
    const tilt = new THREE.Group();
    tilt.rotation.set(LEAN, 0, 0.12);
    tilt.add(body);
    group.add(tilt);
    halo(group, p.r, '#c9a9b6', 1.05, 0.22);
    const bone = new THREE.MeshStandardMaterial({ color: 0xe6d6bf, emissive: 0x231a12, roughness: 0.38, metalness: 0.6 });
    const frame = new THREE.Group();
    const R = p.r * 1.36, t = p.r * 0.03;
    frame.add(new THREE.Mesh(new THREE.TorusGeometry(R, t * 1.15, 10, 200), bone));
    const equator = new THREE.Mesh(new THREE.TorusGeometry(p.r * 1.16, t, 10, 200), bone);
    equator.rotation.x = Math.PI / 2 - 0.08;
    frame.add(equator);
    const meridian = new THREE.Mesh(new THREE.TorusGeometry(p.r * 1.16, t, 10, 200), bone);
    meridian.rotation.y = Math.PI / 2 - 0.22;
    frame.add(meridian);
    [0, 1, 2, 3].forEach((q) => {
      const a = q * Math.PI / 2;
      const arm = new THREE.Group();
      arm.rotation.z = a;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(t * 1.6, p.r * 0.5, 8), bone);
      spike.position.set(R + p.r * 0.27, 0, 0);
      spike.rotation.z = -Math.PI / 2;
      arm.add(spike);
      const brace = new THREE.Mesh(new THREE.BoxGeometry(t * 2.2, p.r * 0.34, t * 2.2), bone);
      brace.position.set(R, 0, 0);
      arm.add(brace);
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(t * 0.7, t * 0.7, R - p.r * 1.16, 6), bone);
      strut.position.set((R + p.r * 1.16) / 2, 0, 0);
      strut.rotation.z = Math.PI / 2;
      arm.add(strut);
      frame.add(arm);
    });
    frame.rotation.set(-0.72, 0, 0.05);
    group.add(frame);
    const stone = new THREE.MeshStandardMaterial({ color: 0xa08a93, roughness: 0.9, metalness: 0.05, flatShading: true });
    const rnd = (k) => { const x = Math.sin(k * 45.164 + 94.673) * 43758.5453; return x - Math.floor(x); };
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + rnd(i) * 0.5;
      const d = p.r * (1.75 + rnd(i + 20) * 0.5);
      const rock = new THREE.Mesh(rockGeo(i + 70, 1), stone);
      rock.scale.setScalar(p.r * (0.07 + rnd(i + 40) * 0.1));
      rock.position.set(Math.cos(a) * d, (rnd(i + 60) - 0.5) * p.r * 0.6, Math.sin(a) * d * 0.75);
      rock.rotation.set(rnd(i + 1) * 3, rnd(i + 2) * 3, rnd(i + 4) * 3);
      group.add(rock);
    }
    return body;
  }

  function fleshGeo() {
    const g = new THREE.SphereGeometry(1, 128, 96);
    const ps2 = g.attributes.position, vv = new THREE.Vector3();
    for (let k = 0; k < ps2.count; k++) {
      vv.fromBufferAttribute(ps2, k);
      const d = 1 + 0.14 * Math.sin(vv.x * 3.2 + 1.0) * Math.cos(vv.y * 2.4) + 0.09 * Math.sin(vv.z * 5.1 + vv.x * 2.2) + 0.05 * Math.sin(vv.y * 9.0 + vv.z * 4.0) - 0.16 * Math.max(0, -vv.y - 0.35);
      vv.multiplyScalar(d);
      ps2.setXYZ(k, vv.x * 1.08, vv.y * 0.94, vv.z);
    }
    g.computeVertexNormals();
    return g;
  }

  function makeTentacles(group, p) {
    const mat = new THREE.ShaderMaterial({ uniforms: { uA: { value: new THREE.Color('#3a2412') }, uC: { value: new THREE.Color(3.2, 1.1, 0.25) }, uAtmo: { value: new THREE.Color('#000000') }, uAtmoStr: { value: 0 }, uTime: { value: 0 }, uBump: { value: 0 } }, vertexShader: PLANET_VS, fragmentShader: TENT_FS });
    timed.push(mat.uniforms.uTime);
    const rnd = (k) => { const x = Math.sin(k * 91.7 + 17.3) * 43758.5453; return x - Math.floor(x); };
    const root = new THREE.Group();
    for (let i = 0; i < 11; i++) {
      const ang = -1.25 + (i / 10) * 2.3 + (rnd(i) - 0.5) * 0.25;
      const start = new THREE.Vector3(0.6, Math.sin(ang) * 0.8, Math.cos(ang) * 0.4).normalize().multiplyScalar(p.r * 0.88);
      const len = p.r * (1.6 + rnd(i + 10) * 1.4);
      const pts = [start];
      for (let k = 1; k <= 6; k++) {
        const f = k / 6;
        pts.push(new THREE.Vector3(start.x + len * f, start.y * (1 + f * 0.9) + Math.sin(f * 5.0 + i * 1.3) * p.r * 0.3 * f, start.z * (1 + f * 0.4) + Math.cos(f * 4.0 + i * 1.7) * p.r * 0.22 * f));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubular = 64, radial = 7;
      const geo = new THREE.TubeGeometry(curve, tubular, p.r * (0.024 + rnd(i + 20) * 0.02), radial, false);
      const pos = geo.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3();
      for (let s2 = 0; s2 <= tubular; s2++) {
        const t = s2 / tubular;
        curve.getPointAt(t, c);
        const taper = Math.max(0.06, 1 - t * 0.94);
        for (let r = 0; r <= radial; r++) {
          const idx = s2 * (radial + 1) + r;
          v.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(taper).add(c);
          pos.setXYZ(idx, v.x, v.y, v.z);
        }
      }
      geo.computeVertexNormals();
      root.add(new THREE.Mesh(geo, mat));
    }
    group.add(root);
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

  const GAS = { jupiter: 1, saturn: 1, uranus: 1, venus: 1 };
  function makeBody(group, p, i) {
    const atmo = { uAtmo: { value: new THREE.Color(p.atmo || '#8fb3c9') }, uAtmoStr: { value: p.atmo ? 1.0 : 0.25 }, uTime: { value: 0 } };
    let uniforms, frag, clouds = null;
    if (p.tex === 'earth') {
      uniforms = { ...atmo, uMap: { value: tex('earth') }, uNormal: { value: tex('earth-normal', 'jpg', true) }, uSpec: { value: tex('earth-spec', 'jpg', true) }, uNight: { value: tex('earth-night', 'jpg', true) }, uClouds: { value: tex('earth-clouds', 'jpg', true) }, uCloudShift: { value: 0 }, uBump: { value: 0.9 } };
      frag = EARTH_FS;
    } else if (p.tex) {
      const gas = !!GAS[p.tex];
      uniforms = { ...atmo, uMap: { value: tex(p.tex) }, uTint: { value: new THREE.Color(p.tint) }, uMono: { value: p.tint === '#ffffff' ? 0 : 0.7 }, uGas: { value: gas ? 1 : 0 }, uSwirl: { value: p.swirl ? 1 : 0 }, uBump: { value: gas ? 0 : p.bump || 2.2 }, uDetail: { value: gas ? 0 : 0.22 } };
      frag = TEX_FS;
    } else {
      uniforms = { ...atmo, uKind: { value: KIND[p.kind] }, uA: { value: new THREE.Color(p.c[0]) }, uB: { value: new THREE.Color(p.c[1]) }, uC: { value: new THREE.Color(p.c[2]) }, uSeed: { value: i * 7.31 }, uBump: { value: 0.035 } };
      frag = PROC_FS;
    }
    const axis = new THREE.Group();
    axis.rotation.x = LEAN;
    const tilt = new THREE.Group();
    tilt.rotation.z = p.tilt != null ? p.tilt : 0.18 + (i % 5) * 0.04;
    axis.add(tilt);
    group.add(axis);
    const body = new THREE.Mesh(p.tentacles ? fleshGeo() : p.lumpy ? lumpyGeo(i) : sphereGeo, new THREE.ShaderMaterial({ uniforms, vertexShader: PLANET_VS, fragmentShader: frag }));
    body.scale.setScalar(p.r);
    tilt.add(body);
    if (p.clouds) {
      clouds = new THREE.Mesh(sphereGeo, new THREE.ShaderMaterial({ uniforms: { ...atmo, uClouds: uniforms.uClouds, uCloudShift: uniforms.uCloudShift, uBump: { value: 0 } }, vertexShader: PLANET_VS, fragmentShader: CLOUD_FS, transparent: true, depthWrite: false }));
      clouds.scale.setScalar(1.012);
      body.add(clouds);
    }
    if (p.atmo) halo(group, p.r, p.atmo, p.clouds ? 1.07 : 1.06, p.clouds ? 1.1 : GAS[p.tex] ? 0.45 : 0.75);
    if (p.ring) {
      const inner = p.r * 1.25, outer = p.r * 2.3;
      const ring = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 192, 1), new THREE.ShaderMaterial({ uniforms: { uMap: { value: tex('saturn-ring', 'png') }, uIn: { value: inner }, uOut: { value: outer }, uAlpha: { value: 0.95 }, uR: { value: p.r } }, vertexShader: RING_VS, fragmentShader: RING_FS, side: THREE.DoubleSide, transparent: true, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2;
      tilt.add(ring);
    }
    if (p.ringThin) {
      const m = new THREE.MeshBasicMaterial({ color: 0xbfe4ee, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false });
      [1.45, 1.6].forEach((k) => { const r = new THREE.Mesh(new THREE.RingGeometry(p.r * k, p.r * (k + 0.025), 160), m); r.rotation.x = -Math.PI / 2; tilt.add(r); });
    }
    if (p.tentacles) makeTentacles(group, p);
    return { body, uniforms };
  }

  SYSTEM.forEach((p, i) => {
    if (p.card) return;
    const group = new THREE.Group();
    group.position.set(p.p[0], 0, p.p[1]);
    let body = null, uniforms = null, spin = null;
    if (p.special === 'rift') spin = makeVoid(group, p);
    else if (p.special === 'zariman') ({ body, spin } = makeZariman(group, p));
    else if (p.special === 'fortress') body = makeFortress(group, p);
    else if (p.special === 'nebula') makeNebula(group, p);
    else if (p.lua) body = makeLua(group, p);
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
    label.innerHTML = '<span class="pl-ring"></span><span class="pl-name"></span><span class="pl-sub"></span><span class="pl-cyc"></span><span class="pl-badge"></span>';
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
    const face = nodes.filter((n) => !n.hk);
    const ring = s.hubsOf(name);
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
    const hubMat = new THREE.LineDashedMaterial({ color: 0xe3b45e, transparent: true, opacity: 0.5, dashSize: R * 0.04, gapSize: R * 0.03, depthWrite: false });
    const per = Math.ceil(ring.length / 2);
    ring.forEach((hub, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const k = Math.floor(i / 2);
      const ang = (per > 1 ? k / (per - 1) - 0.5 : 0) * 1.4 + 0.25;
      const rad = R * 1.42;
      const off = new THREE.Vector3().addScaledVector(rightV, side * Math.cos(ang) * rad).addScaledVector(upV, Math.sin(ang) * rad);
      const edge = off.clone().setLength(R * 1.04);
      const link = new THREE.Line(new THREE.BufferGeometry().setFromPoints([edge, off.clone().setLength(rad * 0.97)]), hubMat);
      link.computeLineDistances();
      nodeLines.add(link);
      pts.push(off);
      flat.push({ hub, side });
    });
    flat.forEach((f, i) => {
      const el = document.createElement('button');
      el.type = 'button';
      if (f.hub) {
        const hub = f.hub;
        el.className = 'node-mk hub' + (f.side < 0 ? ' left' : '');
        el.innerHTML = '<i></i><span class="nm-name"></span><span class="nm-sub"></span>';
        el.addEventListener('mouseenter', (ev) => s.showTip(ev, s.hubTip(hub)));
        el.addEventListener('click', (ev) => { ev.stopPropagation(); s.openHub(hub.key); });
        markers.push({ el, off: pts[i], hub, outside: true });
      } else {
        const nd = f.nd;
        el.className = 'node-mk';
        el.innerHTML = '<i></i><span class="nm-name"></span><span class="nm-sub"></span>';
        el.addEventListener('mouseenter', (ev) => s.showTip(ev, s.nodeTip(nd)));
        el.addEventListener('click', (ev) => { ev.stopPropagation(); s.pin(nd.key); });
        markers.push({ el, off: pts[i], node: nd, outside: false });
      }
      el.addEventListener('mousemove', (ev) => s.moveTip(ev));
      el.addEventListener('mouseleave', () => s.hideTip());
      labelLayer.appendChild(el);
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
    if (!pl) {
      view = name;
      follow = null;
      clearMarkers();
      controls.minDistance = 6;
      controls.maxDistance = 520;
      flyTo(HOME.pos.clone(), HOME.target.clone());
      document.body.classList.add('in-planet', 'in-card');
      refresh();
      return;
    }
    document.body.classList.remove('in-card');
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
      if (nodeKey) { const m = markers.find((x) => (x.node && x.node.key === nodeKey) || (x.hub && x.hub.nodes.some((n) => n.key === nodeKey))); if (m) { m.el.classList.add('pulse'); setTimeout(() => m.el.classList.remove('pulse'), 2400); } }
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
    document.body.classList.remove('in-planet', 'in-card');
    refresh();
  }

  function refresh() {
    const s = store();
    if (!s) return;
    lateOn = s.mode === 'late';
    const viewGroup = view && planets.has(view) ? planets.get(view).group : null;
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
      if (m.hub) {
        const hit = s.hubHit(m.hub);
        m.el.querySelector('.nm-name').textContent = s.hubName(m.hub);
        m.el.querySelector('.nm-sub').textContent = [s.hubSub(m.hub) + ' · ' + m.hub.nodes.length, hit.plan ? s.fmt(hit.plan) : hit.find ? s.fmt(hit.find) : ''].filter(Boolean).join(' · ');
        m.el.classList.toggle('plan', !!hit.plan);
        m.el.classList.toggle('find', !hit.plan && !!hit.find);
        m.el.classList.toggle('pinned', s.hub === m.hub.key);
        return;
      }
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
    composer.setSize(W, H);
    composer.setPixelRatio(renderer.getPixelRatio());
    finish.uniforms.uRes.value.set(W * renderer.getPixelRatio(), H * renderer.getPixelRatio());
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

  function liveLabels() {
    const s = store();
    if (!s) return;
    planets.forEach((pl, name) => {
      const el = pl.label.querySelector('.pl-cyc');
      const c = s.cycleOf(name)[0];
      if (!c) { if (el.textContent) el.textContent = ''; return; }
      el.className = 'pl-cyc st-' + c.state;
      el.innerHTML = '<i></i>' + c.label + ' <em>' + s.left(c.expiry) + '</em>';
    });
  }
  window.addEventListener('atlas:update', refresh);
  window.addEventListener('atlas:update', liveLabels);
  window.addEventListener('atlas:live', liveLabels);
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
      if (pl.uniforms) { pl.uniforms.uTime.value = t; if (pl.uniforms.uCloudShift) pl.uniforms.uCloudShift.value = t * 0.0012; }
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
    sunMat.uniforms.uTime.value = t;
    timed.forEach((u) => { u.value = t; });
    starMat.uniforms.uTime.value = t;
    stars.position.copy(camera.position);
    finish.uniforms.uTime.value = t;
    composer.render(dt);
    placeLabels();
    requestAnimationFrame(frame);
  }
  frame();
  refresh();
  document.body.classList.add('chart-ready');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
