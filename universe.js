import * as THREE from './assets/vendor/three.module.js';
const TAU=Math.PI*2;
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const smooth=(a,b,n)=>{const t=clamp((n-a)/(b-a));return t*t*(3-2*t);};
const random=i=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n);};
const stations=['room','code','corridor','face','voice','research','fields','hospital','tools','archive','proof','room'];
const gold=0xd6b88a,blue=0x83acbd;

/** One spatial scene graph. Story position owns the camera and particle morph. */
export class Universe {
  constructor(canvas,reducedMotion){
    this.canvas=canvas;this.reduced=reducedMotion;this.kind='room';this.progress=0;this.position=0;this.tool=0;
    this.mouse={x:0,y:0};this.explodeTarget=0;this.explode=0;this.focus=null;this.route=0;
    this.groups=[];this.animations=[];this.pickables=[];this.mobile=innerWidth<761;
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x070b0e);this.scene.fog=new THREE.FogExp2(0x070b0e,.012);
    this.camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.08,230);this.camera.position.set(11,7,21);
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:!this.mobile,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,this.mobile?1.15:1.6));this.renderer.setSize(innerWidth,innerHeight);
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;
    this.renderer.shadowMap.enabled=!this.mobile;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();
    this.scene.add(new THREE.HemisphereLight(0x9bbdcd,0x15100b,1.3));
    this.key=new THREE.DirectionalLight(0xc4d9e5,2.8);this.key.position.set(8,14,12);this.scene.add(this.key,this.key.target);
    this.rim=new THREE.DirectionalLight(gold,1.4);this.rim.position.set(-12,5,-8);this.scene.add(this.rim,this.rim.target);
    this.look=new THREE.Vector3();this.cameraTarget=new THREE.Vector3();this.lookTarget=new THREE.Vector3();
    this.makeMaterials();this.makeUniverse();this.makeWorlds();this.makeParticles();this.resize();this.canvas.dataset.engine='webgl';
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();document.body.classList.add('graphics-lost');});
    canvas.addEventListener('webglcontextrestored',()=>document.body.classList.remove('graphics-lost'));
  }
  makeMaterials(){
    this.steel=new THREE.MeshStandardMaterial({color:0x34434c,metalness:.7,roughness:.33});
    this.dark=new THREE.MeshStandardMaterial({color:0x172129,metalness:.3,roughness:.68});
    this.brass=new THREE.MeshStandardMaterial({color:0xb49b74,metalness:.8,roughness:.3});
    this.pale=new THREE.MeshStandardMaterial({color:0xc1c8c5,metalness:.45,roughness:.35});
    this.green=new THREE.MeshStandardMaterial({color:0x526857,metalness:.3,roughness:.58});
    this.light=new THREE.MeshBasicMaterial({color:gold});this.cool=new THREE.MeshBasicMaterial({color:blue});
  }
  box(w,h,d,material,x=0,y=0,z=0,parent){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;(parent||this.scene).add(m);return m;}
  line(points,color=blue,opacity=.25,parent){const g=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));const m=new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:true,opacity}));(parent||this.scene).add(m);return m;}
  ring(radius,tube=.012,color=gold,parent){const m=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,6,128),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.62}));(parent||this.scene).add(m);return m;}
  text(text,{size=1,color='#b7c4ca',width=6,height=1,font='IBM Plex Mono',background=false}={},parent){
    const cv=document.createElement('canvas');cv.width=1024;cv.height=Math.round(1024*height/width);const c=cv.getContext('2d');
    if(background){c.fillStyle='#080e12';c.fillRect(0,0,cv.width,cv.height);}
    c.font=`${Math.floor(cv.height*size*.67)}px "${font}", monospace`;c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;c.fillText(text,cv.width/2,cv.height/2,cv.width-35);
    const texture=new THREE.CanvasTexture(cv);texture.colorSpace=THREE.SRGBColorSpace;
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide}));(parent||this.scene).add(mesh);return mesh;
  }
  node(text,x,y,z,parent,{color=blue,size=.7}={}){
    const group=new THREE.Group();group.position.set(x,y,z);parent.add(group);
    const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(size,0),this.steel);group.add(outer);
    group.add(new THREE.LineSegments(new THREE.EdgesGeometry(outer.geometry),new THREE.LineBasicMaterial({color,transparent:true,opacity:.7})));
    const core=new THREE.Mesh(new THREE.OctahedronGeometry(size*.27),new THREE.MeshBasicMaterial({color}));group.add(core);
    const label=this.text(text,{width:3.6,height:.44},group);label.position.y=-size-.55;
    this.animations.push({kind:'node',object:outer,core,group,index:this.groups.length-1});return group;
  }
  makeUniverse(){
    const count=this.mobile?1100:2600,positions=new Float32Array(count*3),colors=new Float32Array(count*3);
    for(let i=0;i<count;i++){const a=random(i+44)*TAU,r=18+random(i+88)*75;positions.set([Math.cos(a)*r,Math.sin(a)*r,-random(i+133)*710+40],i*3);const c=new THREE.Color(i%6?0x8cabbc:gold);colors.set([c.r,c.g,c.b],i*3);}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
    this.scene.add(new THREE.Points(geometry,new THREE.PointsMaterial({size:.065,vertexColors:true,transparent:true,opacity:.65,depthWrite:false})));
    const points=[];for(let i=0;i<74;i++)points.push(new THREE.Vector3(Math.sin(i*.62)*10,-2.4+Math.cos(i*.47)*4,28-i*10));
    this.filament=new THREE.CatmullRomCurve3(points);
    this.scene.add(new THREE.Mesh(new THREE.TubeGeometry(this.filament,1100,.013,4,false),new THREE.MeshBasicMaterial({color:gold,transparent:true,opacity:.32})));
    this.sparks=[];for(let i=0;i<22;i++){const spark=new THREE.Mesh(new THREE.SphereGeometry(.055,6,6),this.light);this.scene.add(spark);this.sparks.push(spark);}
    for(let i=0;i<24;i++){const ring=this.ring(14+random(i)*11,.006,i%3?blue:gold);ring.position.set(Math.sin(i)*4,1,-i*30);ring.rotation.set(.15*Math.sin(i),.18*Math.cos(i),i*.13);}
  }
  makeWorlds(){
    stations.forEach((kind,index)=>{
      const group=new THREE.Group();group.position.z=-index*60;this.scene.add(group);this.groups.push(group);
      const methods={room:'makeRoom',code:'makeCode',corridor:'makeCorridor',face:'makeFace',voice:'makeVoice',research:'makeResearch',fields:'makeFields',hospital:'makeHospital',tools:'makeTools',archive:'makeArchive',proof:'makeProof'};
      this[methods[kind]](group,index===11);
      if(index!==0&&index!==11){const title=this.text(['','ATTEMPT / REPEAT','FOUNDATIONS','FACEMEET','DOCTORG','MEASURE / UNDERSTAND','AGRISTORE','AROVITA','THE WORKSHOP','THE ARCHIVE','EVIDENCE'][index],{width:14,height:1.3,color:'#7e939e',size:.8},group);title.position.set(0,7,-4);}
    });
  }
  makeRoom(g,ending){
    const room=new THREE.Group();room.position.y=-1.5;g.add(room);
    const cv=document.createElement('canvas');cv.width=cv.height=256;const c=cv.getContext('2d');c.fillStyle='#514332';c.fillRect(0,0,256,256);
    for(let i=0;i<100;i++){c.strokeStyle=`rgba(16,12,9,${random(i)*.25})`;c.beginPath();c.moveTo(0,i*2.6);c.lineTo(256,i*2.6+random(i)*3);c.stroke();}
    const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;const wood=new THREE.MeshStandardMaterial({map:tex,roughness:.65,metalness:.1});
    this.box(11,.28,8,wood,0,-1.6,0,room);this.box(11,6,.16,this.dark,0,1.35,-3.9,room);this.box(.16,6,8,this.dark,-5.4,1.35,0,room);
    this.line([[-5.5,-1.45,4],[-5.5,4.4,4],[-5.5,4.4,-4],[5.5,4.4,-4],[5.5,-1.45,-4]],gold,.35,room);
    this.box(5.8,.16,2.5,wood,.2,.1,-.8,room);for(const x of [-2.4,2.8])for(const z of [-1.75,.15])this.box(.12,1.7,.12,this.steel,x,-.75,z,room);
    this.box(ending?2.9:2.2,ending?1.8:1.35,.09,this.steel,.35,ending?1.55:1,-1.5,room);
    const screen=this.text(ending?'> still building_':'> Hello World_',{width:ending?2.7:2,height:ending?1.6:1.2,color:'#bfdec9',size:.18,background:true},room);screen.position.set(.35,ending?1.55:1,-1.442);
    if(ending){this.box(.18,.6,.2,this.steel,.35,.5,-1.5,room);const second=this.text('SYSTEM / ONLINE',{width:1.15,height:1.8,color:'#8faebc',size:.12,background:true},room);second.position.set(2.35,1.4,-1.35);second.rotation.y=-.3;}
    this.box(2.2,.06,1.05,this.steel,.35,.23,-.65,room);for(let i=0;i<5;i++)for(let j=0;j<12;j++)this.box(.115,.015,.09,this.dark,-.52+j*.145,.269,-.96+i*.13,room);
    this.box(.7,.03,.95,this.pale,1.95,.23,-.45,room).rotation.y=.13;
    for(let i=0;i<4;i++)this.box(.95,.15,.65,i%2?this.dark:this.brass,-1.8,.29+i*.16,-1.2,room).rotation.y=(i-2)*.13;
    const mug=new THREE.Mesh(new THREE.CylinderGeometry(.17,.15,.31,16),this.pale);mug.position.set(1.85,.39,-1.6);room.add(mug);
    this.box(.45,.06,.45,this.steel,-2.05,.23,-.15,room);this.line([[-2.05,.25,-.15],[-2.15,1.4,-.2],[-1.1,2.1,-.4]],gold,.9,room);
    const shade=new THREE.Mesh(new THREE.ConeGeometry(.42,.48,24,1,true),this.brass);shade.rotation.z=.45;shade.position.set(-1.02,1.92,-.4);room.add(shade);
    const lamp=new THREE.SpotLight(0xffc988,32,13,.6,.8,1.5);lamp.position.set(-1.05,1.8,-.35);lamp.target.position.set(-.8,.1,-.65);lamp.castShadow=!this.mobile;lamp.shadow.mapSize.set(512,512);room.add(lamp,lamp.target);
    const light=new THREE.PointLight(0x8cc9e9,6,5);light.position.set(.4,1.1,-.9);room.add(light);
    const cone=new THREE.Mesh(new THREE.ConeGeometry(1.2,2,32,1,true),new THREE.MeshBasicMaterial({color:0xffcf95,transparent:true,opacity:.035,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));cone.position.set(-1.05,.95,-.35);room.add(cone);
    this.box(1.5,.18,1.4,this.dark,.4,-.5,1.6,room);this.box(1.55,1.8,.15,this.dark,.4,.3,2.25,room);for(const x of [-.15,.95])for(const z of [1.15,2.1])this.box(.07,1,.07,this.steel,x,-1,z,room);
    const person=new THREE.Group();person.position.set(.4,-.4,1.55);room.add(person);
    const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.4,.9,6,12),this.dark);torso.position.y=.85;torso.rotation.x=.15;person.add(torso);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.3,18,16),new THREE.MeshStandardMaterial({color:0x3d332d,roughness:.95}));head.scale.y=1.16;head.position.set(0,1.8,-.12);person.add(head);
    const hair=new THREE.Mesh(new THREE.SphereGeometry(.303,16,10,0,TAU,0,1.7),this.dark);hair.position.copy(head.position);hair.scale.y=1.18;person.add(hair);
    for(const sign of [-1,1]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.9,4,8),this.dark);arm.rotation.set(.8,0,sign*.25);arm.position.set(sign*.44,.95,-.48);person.add(arm);}
    const outer=this.ring(9,.025,gold,g);outer.rotation.y=.25;const outer2=this.ring(9.3,.006,blue,g);outer2.rotation.y=.25;
    const caption=this.text(ending?'THE TOOLS CHANGED. THE CURIOSITY DID NOT.':'MEMORY 001 / A ROOM WITH A QUESTION',{width:10,height:.45,color:'#d2bb98'},g);caption.position.set(0,-4.2,4.7);
    this.animations.push({kind:'room',object:room,index:this.groups.length-1});
  }
  makeCode(g){
    for(let i=0;i<24;i++){
      const portal=this.ring(4.4+i*.07,.015,i%4?blue:gold,g);portal.position.z=8-i*2.1;portal.rotation.z=i*.055;
      if(i%3===0){const label=this.text(['if (curious) {','build();','ERROR / TRY AGAIN','learn(error);','return answer;','BUILD SUCCESSFUL'][Math.floor(i/3)%6],{width:4,height:.45,color:i%2?'#afc8d1':'#d4b58b'},g);label.position.set(Math.sin(i)*4,Math.cos(i)*2,-i*1.4);label.rotation.y=Math.sin(i)*.25;}
    }
    for(let i=0;i<80;i++){const a=random(i)*TAU,r=4+random(i+100)*3,z=10-random(i+200)*45;const shard=this.box(.04+random(i+400)*.45,.02,.8+random(i+500)*2,i%4?this.steel:this.brass,Math.cos(a)*r,Math.sin(a)*r,z,g);shard.rotation.z=a;}
  }
  makeCorridor(g){
    for(let i=0;i<10;i++){const z=5-i*3;for(const sign of [-1,1]){
      this.box(.26,9,.4,this.steel,sign*5,1,z,g);this.box(.05,6.5,.055,this.light,sign*4.82,1,z+.1,g);this.box(1.1,7,2.6,this.dark,sign*5.7,.6,z-1,g);
      for(let b=0;b<8;b++)this.box(.6,.035,2.3,this.brass,sign*5.06,-2.3+b*.8,z-1,g);
    }this.box(10,.18,.4,this.steel,0,5.4,z,g);this.box(10,.04,.08,this.cool,0,5.28,z,g);this.line([[-5,-3.3,z],[5,-3.3,z]],blue,.22,g);}
    ['O(n)','STACK / QUEUE','PROCESS / THREAD','TCP','SELECT / JOIN','SYSTEM DESIGN'].forEach((word,i)=>{const p=this.text(word,{width:3.8,height:.65,color:i%2?'#aecbd3':'#c7ac86'},g);p.position.set(i%2?3:-3,.7+Math.sin(i)*1.2,3-i*3);p.rotation.y=i%2?-.25:.25;});
    this.box(10,.12,30,this.dark,0,-3.4,-9,g);
  }
  makeFace(g){
    const face=new THREE.Group();g.add(face);const vertices=[],lines=[];
    for(let row=0;row<=32;row++)for(let col=0;col<=30;col++){
      const v=row/32,u=col/30,theta=v*Math.PI,width=Math.pow(Math.sin(theta),.65)*2.3*(1-.17*v),x=(u-.5)*2*width,y=(.5-v)*7.3;
      let z=Math.cos((u-.5)*Math.PI)*Math.sin(theta)*1.45;z+=Math.exp(-Math.pow(x/.38,2)-Math.pow((y+.1)/.85,2))*.9;z-=Math.exp(-Math.pow((Math.abs(x)-.8)/.4,2)-Math.pow((y-.65)/.37,2))*.45;
      vertices.push(new THREE.Vector3(x,y,z));const at=row*31+col;if(col)lines.push(vertices[at-1],vertices[at]);if(row)lines.push(vertices[at-31],vertices[at]);
    }
    face.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lines),new THREE.LineBasicMaterial({color:blue,transparent:true,opacity:.36})));
    face.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(vertices),new THREE.PointsMaterial({size:.035,color:0xc4d8da,transparent:true,opacity:.9})));
    for(const x of [-.84,.84]){const eye=this.ring(.42,.012,gold,face);eye.scale.y=.5;eye.position.set(x,.65,1.25);}
    for(const sign of [-1,1]){
      this.line([[sign*.4,1.14,1.7],[sign*.78,1.27,1.6],[sign*1.2,1.04,1.3]],gold,.8,face);
      this.line([[sign*.3,.95,1.85],[sign*.22,.2,2.25],[sign*.42,-.36,2.1],[0,-.48,2.55]],blue,.85,face);
      this.line([[sign*1.55,.05,.95],[sign*1.25,-.75,1.2],[sign*.82,-1.7,1.2],[0,-2.25,1.1]],blue,.45,face);
    }
    this.line([[-.68,-1.35,1.47],[-.25,-1.23,1.75],[0,-1.31,1.8],[.25,-1.23,1.75],[.68,-1.35,1.47],[.2,-1.56,1.73],[-.2,-1.56,1.73],[-.68,-1.35,1.47]],gold,.75,face);
    this.line([[-.64,-1.45,1.36],[0,-1.6,1.65],[.64,-1.45,1.36]],gold,.7,face);
    const scanner=this.box(6,.014,4,new THREE.MeshBasicMaterial({color:0xa0d0db,transparent:true,opacity:.3}),0,3,1,g);
    scanner.userData.dynamic=true;
    this.ring(5,.014,gold,g).rotation.y=.5;this.ring(5.4,.008,blue,g).rotation.x=.6;this.animations.push({kind:'face',object:face,scanner,index:3});
    this.node('PARTICIPANT A',-6.5,-.4,0,g,{size:.45});this.node('PARTICIPANT B',6.5,-.4,0,g,{size:.45});
    this.line([[-6.5,-.4,0],[-3.8,-.4,0],[-3.8,-3.5,0],[3.8,-3.5,0],[3.8,-.4,0],[6.5,-.4,0]],gold,.5,g);
  }
  makeVoice(g){
    const orb=new THREE.Group();g.add(orb);for(let i=0;i<9;i++){const r=this.ring(3.7+i*.06,.007,i%3?blue:gold,orb);r.rotation.set(i*.35,i*.47,0);}
    const core=new THREE.Mesh(new THREE.IcosahedronGeometry(1.8,1),new THREE.MeshPhysicalMaterial({color:0x203542,metalness:.65,roughness:.14,clearcoat:1}));orb.add(core);
    orb.add(new THREE.LineSegments(new THREE.EdgesGeometry(core.geometry),new THREE.LineBasicMaterial({color:blue,transparent:true,opacity:.75})));
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(160*3),3));
    const wave=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:gold}));wave.position.z=3;g.add(wave);this.animations.push({kind:'voice',object:orb,wave,index:4});
    ['WHISPER','VISION','RESPONSE','VOICE'].forEach((text,i)=>{const a=i*TAU/4+.8;this.node(text,Math.cos(a)*6,Math.sin(a)*4,0,g,{size:.4});});
  }
  makeResearch(g){
    const platform=new THREE.Group();platform.rotation.x=.2;g.add(platform);this.box(7,.08,11,this.dark,0,-2.5,0,platform);
    for(let i=0;i<8;i++)this.box(.06,.018,.65,this.light,0,-2.44,-4.5+i*1.3,platform);
    for(let i=0;i<6;i++){const x=i%2?-1.7:1.7,z=-4+i*1.5;this.box(.9,.45,1.5,this.steel,x,-2.16,z,platform);this.box(.74,.35,.65,this.steel,x,-1.79,z-.12,platform);const box=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.2,1,1.8)),new THREE.LineBasicMaterial({color:i%2?gold:blue,transparent:true,opacity:.8}));box.position.set(x,-1.9,z);platform.add(box);}
    ['YOLOv8','FASTER R-CNN','SSD'].forEach((l,i)=>{const a=i*TAU/3+.5;this.node(l,Math.cos(a)*6,3+Math.sin(a),Math.sin(a)*3,g,{size:.6});});
    for(let i=0;i<5;i++){const r=this.ring(5+i*.15,.006,blue,g);r.rotation.x=Math.PI/2;r.position.y=-3+i*.03;}
  }
  makeFields(g){
    const farm=new THREE.Group();farm.rotation.y=-.3;g.add(farm);
    for(let row=0;row<9;row++){const x=(row-4)*1.1,y=-2+Math.sin(row*.4)*.45;this.box(.72,.4,8,this.green,x,y,0,farm);for(let col=0;col<10;col++){const z=(col-4.5)*.72;this.line([[x,y+.2,z],[x,y+.7,z],[x-.18,y+.55,z],[x,y+.65,z],[x+.16,y+.85,z]],0xa4b893,.7,farm);}}
    this.node('AWS / DEPLOYED',0,4.1,-1,g,{size:1.1,color:gold});
    ['IDENTITY','PRODUCTS','ORDERS','INVOICE'].forEach((word,i)=>{const x=(i-1.5)*3;this.node(word,x,.4,2,g,{size:.4,color:0xabc3a2});this.line([[x,.4,2],[x,2,2],[0,2,2],[0,4,-1]],0xa9bba1,.22,g);});
  }
  makeHospital(g){
    const core=new THREE.Group();g.add(core);
    for(let i=0;i<5;i++){const level=this.box(4.2,.13,3.7,this.steel,0,-2.4+i*1.1,0,core);const edge=new THREE.LineSegments(new THREE.EdgesGeometry(level.geometry),new THREE.LineBasicMaterial({color:i%2?blue:gold,transparent:true,opacity:.55}));edge.position.copy(level.position);core.add(edge);for(let j=0;j<4;j++)this.box(.04,.7,.04,this.brass,(j%2?1:-1)*1.9,-1.96+i*1.1,(j<2?1:-1)*1.6,core);}
    this.text('HMS',{width:3,height:1.1,color:'#d8d8cb'},core).position.set(0,3.4,0);
    this.hospitalNodes=[];
    ['PATIENT','API GATEWAY','LAMBDA','POSTGRESQL','DOCTOR','EMR','PRESCRIPTION','TELEMEDICINE'].forEach((name,i)=>{const a=i*TAU/8,n=this.node(name,Math.cos(a)*7,Math.sin(a)*4.3,Math.sin(a)*2,g,{size:.55,color:i<4?blue:gold});this.hospitalNodes.push(n);this.line([[n.position.x,n.position.y,n.position.z],[n.position.x*.55,n.position.y*.55,n.position.z],[0,0,0]],i<4?blue:gold,.27,g);});
    this.ring(8,.012,blue,g).rotation.x=.75;
    this.request=new THREE.Mesh(new THREE.SphereGeometry(.16,12,12),this.light);this.request.userData.dynamic=true;g.add(this.request);this.request.add(new THREE.PointLight(gold,3,5));this.animations.push({kind:'hospital',object:core,index:7});
  }
  makeTools(g){
    this.toolNodes=[];['CLOUD','DATABASES','BACKEND','INTERFACES','AI / VISION','LANGUAGES'].forEach((name,i)=>{const a=i*TAU/6;this.toolNodes.push(this.node(name,Math.cos(a)*6.5,Math.sin(a)*4,0,g,{size:1,color:i%2?blue:gold}));});
    const axis=new THREE.Mesh(new THREE.OctahedronGeometry(1.8),this.brass);g.add(axis);this.ring(6.5,.015,blue,g).scale.y=.62;
    for(let i=0;i<6;i++){const a=i*TAU/6;this.line([[0,0,0],[Math.cos(a)*6.5,Math.sin(a)*4,0]],gold,.2,g);}this.animations.push({kind:'tools',object:axis,index:8});
  }
  makeArchive(g){
    this.portalMeshes=[];['facemeet','doctorg','agristore','arovita','research'].forEach((id,i)=>{
      const door=new THREE.Group(),a=(i-2)*.3;door.position.set(Math.sin(a)*17,.3,-Math.cos(a)*5+5);door.rotation.y=-a;g.add(door);const w=3.3,h=6.6;
      this.box(.14,h,.32,this.brass,-w/2,0,0,door);this.box(.14,h,.32,this.brass,w/2,0,0,door);this.box(w,.14,.32,this.brass,0,h/2,0,door);
      for(let j=1;j<7;j++)this.line([[-w/2,-h/2,-j*.6],[-w/2,h/2,-j*.6],[w/2,h/2,-j*.6],[w/2,-h/2,-j*.6]],i===2?0xb2b990:blue,.35-j*.035,door);
      const pane=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:i===2?0x527454:0x284956,transparent:true,opacity:.15,side:THREE.DoubleSide}));door.add(pane);pane.userData.project=id;this.pickables.push(pane);
      this.text(`0${i+1}`,{width:1.1,height:.7,color:'#d3bd9b'},door).position.set(0,2.45,.2);
      this.text(['FACEMEET','DOCTORG','AGRISTORE','AROVITA','RESEARCH'][i],{width:3.6,height:.45,color:'#ced8d7'},door).position.set(0,-4,.2);
      const shape=new THREE.Mesh(new THREE.IcosahedronGeometry(.75,i%2),new THREE.MeshStandardMaterial({color:i===2?0xa3ac80:0x8cb6c7,metalness:.7,roughness:.22,wireframe:i%2===0}));shape.position.z=.2;door.add(shape);
      this.box(3.2,.015,7,this.dark,0,-h/2,1,door);this.portalMeshes.push({door,pane,shape});this.animations.push({kind:'portal',object:shape,index:9,pane});
    });
  }
  makeProof(g){
    [['53','ALL INDIA RANK'],['11','CELEBAL ANAVERSE'],['01','BEST PROJECT'],['02','IEEE PUBLICATIONS']].forEach(([n,title],i)=>{
      const frame=new THREE.Group();frame.position.set((i-1.5)*4.4,0,-Math.abs(i-1.5)*1.1);g.add(frame);this.box(3.6,5,.25,this.steel,0,0,0,frame);
      this.text(n,{width:3.3,height:3.6,font:'Instrument Serif',color:'#d8bb8f'},frame).position.z=.15;
      this.text(title,{width:3.8,height:.38,color:'#9eafb6'},frame).position.set(0,-3,.3);
      this.line([[-1.8,-2.5,.16],[-1.8,2.5,.16],[1.8,2.5,.16]],gold,.7,frame);
    });
  }
  makeParticles(){
    this.count=this.mobile?3500:11000;this.shapes=[];
    for(let k=0;k<12;k++){const positions=new Float32Array(this.count*3);
      for(let i=0;i<this.count;i++){
        const u=random(i+1),v=random(i+19001),w=random(i+38001),a=u*TAU;let x,y,z;
        if(k===0||k===11){const r=8+w*1.1;x=Math.cos(a)*r;y=Math.sin(a)*r*.8;z=(v-.5)*1.4;}
        else if(k===1){const r=3.8+w*.5;x=Math.cos(a)*r;y=Math.sin(a)*r;z=(v-.5)*35;}
        else if(k===2){x=(u-.5)*13;y=(v-.5)*9;z=(w-.5)*20;if(i%3)x=Math.sign(x)*5.4;else y=-3.5;}
        else if(k===3){const theta=v*Math.PI,wid=Math.pow(Math.sin(theta),.65)*2.3*(1-.17*v);x=(u-.5)*2*wid;y=(.5-v)*7.3;z=Math.cos((u-.5)*Math.PI)*Math.sin(theta)*1.45;z+=Math.exp(-Math.pow(x/.38,2)-Math.pow((y+.1)/.85,2))*.9;}
        else if(k===4){const phi=Math.acos(2*v-1),r=3.7+Math.sin(a*8)*.2;x=Math.sin(phi)*Math.cos(a)*r;y=Math.sin(phi)*Math.sin(a)*r;z=Math.cos(phi)*r;}
        else if(k===5){x=(u-.5)*9;y=(v-.5)*9;z=(w-.5)*9;const f=i%3;if(f===0)x=Math.sign(x)*4.5;if(f===1)y=Math.sign(y)*4.5;if(f===2)z=Math.sign(z)*4.5;}
        else if(k===6){x=(u-.5)*12;z=(v-.5)*10;y=-2+Math.sin(x*2)*.25+w*.4;}
        else if(k===7){const r=6+Math.sin(a*4)*.5;x=Math.cos(a)*r;y=(v-.5)*7;z=Math.sin(a)*r*.45;}
        else if(k===8){const r=5.8+Math.cos(v*TAU)*.4;x=Math.cos(a)*r;y=Math.sin(a)*r*.6;z=Math.sin(v*TAU)*.5;}
        else if(k===9){const angle=(i%5-2)*.3;x=Math.sin(angle)*17+(u-.5)*3;y=(v-.5)*6.6;z=-Math.cos(angle)*5+5-w*4;}
        else{x=(u-.5)*20;y=(v-.5)*9;z=(w-.5)*6;}positions.set([x,y,z-k*60],i*3);
      }this.shapes.push(new THREE.BufferAttribute(positions,3));
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',this.shapes[0]);geometry.setAttribute('target',this.shapes[1]);const seeds=new Float32Array(this.count);for(let i=0;i<this.count;i++)seeds[i]=random(i+70001);geometry.setAttribute('seed',new THREE.BufferAttribute(seeds,1));
    this.particleMaterial=new THREE.ShaderMaterial({uniforms:{uMix:{value:0},uTime:{value:0},uExplode:{value:0},uPixel:{value:this.renderer.getPixelRatio()},uMotion:{value:this.reduced?0:1}},
      vertexShader:`attribute vec3 target;attribute float seed;uniform float uMix,uTime,uExplode,uPixel,uMotion;varying float vSeed;varying float vAlpha;void main(){vSeed=seed;vec3 p=mix(position,target,uMix);float transit=sin(uMix*3.14159);p.x+=sin(seed*80.+uTime*.12)*transit*3.;p.y+=cos(seed*42.+uTime*.1)*transit*2.;vec3 direction=normalize(vec3(sin(seed*127.),cos(seed*89.),sin(seed*53.)));p+=direction*uExplode*(2.+seed*8.);p+=direction*sin(uTime*.35+seed*40.)*.06*uMotion;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((1.+seed*1.8)*uPixel*24./-mv.z,1.,5.);vAlpha=clamp(1.-(-mv.z)/150.,0.,1.);}`,
      fragmentShader:`varying float vSeed;varying float vAlpha;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;vec3 color=mix(vec3(.4,.65,.78),vec3(.94,.73,.43),step(.77,vSeed));float alpha=pow(1.-d*2.,1.5)*vAlpha*.72;gl_FragColor=vec4(color,alpha);}`,
      transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
    this.particles=new THREE.Points(geometry,this.particleMaterial);this.particles.frustumCulled=false;this.scene.add(this.particles);this.particlePair=-1;
  }
  resize(){this.mobile=innerWidth<761;this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight);this.renderer.setPixelRatio(Math.min(devicePixelRatio,this.mobile?1.15:1.6));if(this.particleMaterial)this.particleMaterial.uniforms.uPixel.value=this.renderer.getPixelRatio();}
  setStory(position,progress=0){this.position=clamp(position,0,11);this.progress=progress;}
  pick(clientX,clientY){if(Math.abs(this.position-9)>.5)return null;this.pointer.set(clientX/innerWidth*2-1,-clientY/innerHeight*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);return this.raycaster.intersectObjects(this.pickables)[0]?.object.userData.project||null;}
  setFocus(project){this.focus=project;this.route=0;}
  setHover(project){this.portalMeshes.forEach(({pane,shape})=>{const active=pane.userData.project===project;pane.material.opacity=active?.34:.15;shape.material.emissive.setHex(active?0x45616d:0x000000);shape.scale.setScalar(active?1.15:1);});}
  frame(ms){
    const t=this.reduced?0:ms*.001,p=this.position,index=Math.min(10,Math.floor(p)),mix=p-index;
    this.explode+=(this.explodeTarget-this.explode)*(this.reduced?1:.085);
    const viewingRoom=Math.max(1-smooth(0,.9,p),smooth(10.7,11,p));const z=20+(this.mobile?13:0)-p*60-Math.min(this.progress,.48)*6;
    this.cameraTarget.set(viewingRoom*10+Math.sin(p*.8)*1.6+(this.reduced?0:this.mouse.x*1.2),viewingRoom*5.8+1.2+(this.reduced?0:this.mouse.y*.5),z);
    this.lookTarget.set(0,viewingRoom*-.9,-p*60-1);
    const focusIndex=this.focus?{facemeet:3,doctorg:4,research:5,agristore:6,arovita:7}[this.focus]:null;
    if(focusIndex!==null){this.cameraTarget.set(this.mobile?0:6,2,focusIndex*-60+(this.mobile?25:16));this.lookTarget.set(this.mobile?0:2.4,0,focusIndex*-60);}
    // Native scrolling already interpolates navigation. Camera lag here would
    // leave a previous world onscreen after a chapter jump.
    this.camera.position.copy(this.cameraTarget);this.look.copy(this.lookTarget);
    this.firstFrame=true;this.camera.lookAt(this.look);this.key.position.set(this.camera.position.x+8,12,this.camera.position.z+8);this.key.target.position.copy(this.look);this.rim.position.set(-10,5,this.camera.position.z-12);this.rim.target.position.copy(this.look);
    this.groups.forEach((g,i)=>{g.visible=focusIndex!==null?i===focusIndex:Math.abs(i-p)<.96;});
    const pair=focusIndex??index;if(pair!==this.particlePair){this.particles.geometry.setAttribute('position',this.shapes[pair]);this.particles.geometry.setAttribute('target',this.shapes[Math.min(11,pair+1)]);this.particlePair=pair;}
    const uniforms=this.particleMaterial.uniforms;uniforms.uMix.value=focusIndex!==null?0:mix;uniforms.uTime.value=t;uniforms.uExplode.value=this.explode;uniforms.uMotion.value=this.reduced?0:1;
    this.animations.forEach(a=>{
      if(!this.groups[a.index]?.visible)return;const o=a.object;
      if(a.kind==='node'){o.rotation.y=t*.13;o.rotation.x=t*.08;a.core.rotation.y=-t*.2;}
      if(a.kind==='face'){o.rotation.y=Math.sin(t*.15)*.15;a.scanner.position.y=3.8-((t*.2)%1)*7.6;}
      if(a.kind==='voice'){o.rotation.y=t*.045;o.rotation.z=t*.025;const attr=a.wave.geometry.attributes.position;for(let i=0;i<attr.count;i++){const x=(i/(attr.count-1)-.5)*12;attr.setXYZ(i,x,Math.sin(x*4+t*2.3)*Math.sin(x*.8-t*.6)*Math.exp(-x*x*.08)*1.25,0);}attr.needsUpdate=true;}
      if(a.kind==='hospital'){o.rotation.y=Math.sin(t*.1)*.12;const step=this.requestStarted!==undefined?Math.min(3.999,Math.max(0,(ms-this.requestStarted)/1100)):t*.27,n=Math.floor(step)%this.hospitalNodes.length;this.request.position.lerpVectors(this.hospitalNodes[n].position,this.hospitalNodes[(n+1)%this.hospitalNodes.length].position,step%1);this.hospitalNodes.forEach((node,i)=>node.scale.setScalar(this.requestStarted!==undefined&&i===n?1.35:1));if(this.requestStarted!==undefined)this.canvas.dataset.requestStep=String(n);}
      if(a.kind==='tools'){o.rotation.set(t*.08,t*.12,0);this.toolNodes.forEach((node,i)=>node.scale.setScalar(i===this.tool?1.18:1));}
      if(a.kind==='portal'){o.rotation.set(t*.15,t*.22,0);o.position.y=Math.sin(t*.6+a.index)*.15;}
      if(a.kind==='room')o.rotation.y=Math.sin(t*.07)*.018;
    });
    this.groups.forEach(g=>{if(!g.visible)return;g.children.forEach((child,j)=>{if(child.userData.dynamic)return;if(!child.userData.home)child.userData.home=child.position.clone();const h=child.userData.home;child.position.set(h.x+Math.sin(j*13.4)*this.explode*1.2,h.y+Math.cos(j*7.1)*this.explode*.8,h.z+Math.sin(j*3.7)*this.explode*1.6);});});
    this.sparks.forEach((spark,i)=>spark.position.copy(this.filament.getPoint((i/this.sparks.length+t*.006)%1)));
    this.renderer.render(this.scene,this.camera);this.canvas.dataset.station=String(Math.round(p));this.canvas.dataset.cameraZ=this.camera.position.z.toFixed(2);this.canvas.dataset.requestPosition=this.request.position.toArray().map(n=>n.toFixed(2)).join(',');this.canvas.dataset.exploded=this.explode>.5?'true':'false';
  }
}
