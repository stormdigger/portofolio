// One canvas, one active environment. Scroll changes depth; time adds quiet movement.
export class World {
  constructor(canvas, reducedMotion) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.reduced = reducedMotion;
    this.kind = 'room';
    this.progress = 0;
    this.tool = 0;
    this.mouse = { x: 0, y: 0 };
    this.dust = Array.from({ length: 75 }, (_, i) => ({ x: this.rand(i + 1), y: this.rand(i + 110), size: .3 + this.rand(i + 200) * 1.3 }));
    this.resize();
  }
  rand(seed) { const n = Math.sin(seed * 127.1) * 43758.5453; return n - Math.floor(n); }
  resize() {
    this.w = innerWidth; this.h = innerHeight;
    this.mobile = this.w < 761;
    this.dpr = Math.min(devicePixelRatio || 1, this.mobile ? 1.25 : 1.7);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.ctx?.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }
  line(points, color = '#9abfcf', alpha = .3, width = 1) {
    const c = this.ctx; c.beginPath(); c.strokeStyle = color; c.globalAlpha = alpha; c.lineWidth = width;
    points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.globalAlpha = 1;
  }
  circle(x, y, r, color, alpha = 1, fill = false) {
    const c = this.ctx; c.beginPath(); c.arc(x, y, Math.max(.1, r), 0, Math.PI * 2); c.globalAlpha = alpha;
    if (fill) { c.fillStyle = color; c.fill(); } else { c.strokeStyle = color; c.lineWidth = .8; c.stroke(); } c.globalAlpha = 1;
  }
  label(text, x, y, alpha = .7, color = '#a4c2ca', size = 9, align = 'left') {
    const c = this.ctx; c.globalAlpha = alpha; c.fillStyle = color; c.font = `${size}px "IBM Plex Mono", monospace`; c.textAlign = align; c.fillText(text, x, y); c.globalAlpha = 1;
  }
  glow(x, y, radius, color) {
    const c = this.ctx; const g = c.createRadialGradient(x, y, 0, x, y, radius); g.addColorStop(0, color); g.addColorStop(1, 'transparent'); c.fillStyle = g; c.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  project(x, y, z) {
    const scale = 520 / (520 + z);
    return [this.cx + x * scale, this.cy + y * scale];
  }
  frame(time) {
    if (!this.ctx) return;
    this.t = this.reduced ? 0 : time * .001;
    this.cx = this.w * (this.mobile ? .66 : .74) + (this.reduced ? 0 : this.mouse.x * 8);
    this.cy = this.h * (this.mobile ? .39 : .49) + (this.reduced ? 0 : this.mouse.y * 5);
    this.scale = Math.min(this.w * (this.mobile ? .65 : .29), this.h * .4);
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.ctx.save();
    if (this.mobile && this.kind !== 'room') this.ctx.globalAlpha = .55;
    const draw = { room: 'room', code: 'code', corridor: 'corridor', face: 'face', voice: 'voice', research: 'research', fields: 'fields', hospital: 'hospital', tools: 'tools', archive: 'archive', proof: 'proof' }[this.kind];
    if (draw) this[draw]();
    this.ctx.restore();
    this.particles();
  }
  particles() {
    const count = this.mobile ? 25 : this.dust.length;
    for (let i = 0; i < count; i++) {
      const d = this.dust[i]; const x = (d.x * this.w + Math.sin(this.t * .1 + i) * 15);
      const y = ((d.y * this.h - this.t * (1 + d.size) * 2) % this.h + this.h) % this.h;
      this.circle(x, y, d.size, this.kind === 'room' ? '#d6b78e' : '#a2bec7', .18 + Math.sin(i + this.t * .5) * .08, true);
    }
  }
  room() { this.glow(this.w * .6, this.h * .55, this.h * .36, '#ce9a4e0b'); }
  code() {
    this.glow(this.cx, this.cy, this.scale * 1.6, '#5a91aa12');
    const words = ['if (curious)', 'return answer;', 'while (learning)', 'function build()', 'try {', 'const idea = new Idea();', '} catch (error) {', 'for (let attempt = 0;)', 'Hello World_', 'learn(error);', 'build(again);', 'else', 'continue;', 'understand();'];
    for (let i = 0; i < 48; i++) {
      const z = ((i * 101 - this.progress * 600 - this.t * 9) % 1700 + 1700) % 1700;
      const x = (this.rand(i + 60) - .5) * 1600; const y = (this.rand(i + 90) - .5) * 1100;
      const [px, py] = this.project(x, y, z); const fade = (1 - z / 1900) * (px < this.w * .48 ? .2 : .7);
      this.label(words[i % words.length], px, py, fade, i % 9 === 0 ? '#d6b78e' : '#89a8b4', Math.max(8, 19 * 520 / (520 + z)));
    }
    const success = this.progress > .42;
    this.label(success ? 'BUILD SUCCESSFUL' : 'ERROR: TRY AGAIN', this.cx - 90, this.cy + this.scale * .78, .85, success ? '#b8ccb0' : '#d09882', 11);
    this.line([[this.cx - 100, this.cy + this.scale * .84], [this.cx + 130, this.cy + this.scale * .84]], success ? '#b8ccb0' : '#d09882', .3);
  }
  corridor() {
    const c = this.ctx;
    this.glow(this.cx, this.cy, this.h * .65, '#bf9e6920');
    const advance = this.progress * 230;
    for (let i = 12; i >= 0; i--) {
      const z = i * 190 + 30 - advance % 190;
      if (z < 0) continue;
      const a = Math.max(.04, .46 - i * .032);
      const pts = [[-360,-320],[360,-320],[360,290],[-360,290],[-360,-320]].map(([x,y])=>this.project(x,y,z));
      this.line(pts,'#abafa5',a);
      if (i % 2 === 0) {
        const window = [[270,-265],[350,-265],[350,100],[270,100]].map(([x,y])=>this.project(x,y,z));
        c.beginPath();window.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=`rgba(222,194,140,${a*.15})`;c.fill();this.line([...window,window[0]],'#dbc29b',a);
        this.line([this.project(-275,-280,z),this.project(275,-280,z)],'#d6b78e',a*.7,2);
      }
    }
    for (const x of [-360,-180,0,180,360]) this.line([this.project(x,290,0),this.project(x,290,2700)],'#a9b6b6',.15);
    const words=['O(n)','stack → queue','process / thread','TCP','SELECT · JOIN','class → system'];
    words.forEach((word,i)=>{const [x,y]=this.project(i%2?210:-260,-140+i*48,200+i*40);this.label(word,x,y,.55,'#b4c3bd',10);});
    // A receding human silhouette gives the architectural scale.
    const [sx,sy]=this.project(40,120,600);this.circle(sx,sy,7,'#273032',.95,true);
    c.fillStyle='#1a2428';c.fillRect(sx-8,sy+8,16,40);this.line([[sx-4,sy+45],[sx-7,sy+75]],'#1a2428',1,5);this.line([[sx+4,sy+45],[sx+9,sy+75]],'#1a2428',1,5);
  }
  face() {
    const s=this.scale*.79,x=this.cx,y=this.cy;
    this.glow(x,y,s*1.8,'#6096b21c');
    const rows=[];
    for(let row=0;row<19;row++){
      const v=row/18, theta=v*Math.PI, width=Math.sin(theta)*s*.68;
      const points=[];
      for(let col=0;col<13;col++){
        const u=col/12,xx=(u-.5)*2*width;
        const yy=(v-.5)*s*2+Math.sin(u*Math.PI)*Math.sin(v*Math.PI)*s*.06;
        const depth=Math.cos((u-.5)*Math.PI)*Math.sin(theta);
        const px=x+xx+Math.sin(this.t*.15)*depth*12,py=y+yy;
        points.push([px,py]);this.circle(px,py,col%3===0?1.5:.8,'#b1ced8',.5,true);
        if(row>0)this.line([rows[row-1][col],[px,py]],'#88aec2',.17);
      }
      rows.push(points);this.line(points,'#9bbdd0',.2);
    }
    const scan=y-s+((this.t*.17+this.progress)%1)*s*2;
    this.line([[x-s*.9,scan],[x+s*.9,scan]],'#c6dce0',.6);
    this.glow(x,scan,s*.65,'#9dcad00c');
    const corners=[[-1,-1],[1,-1],[-1,1],[1,1]];
    corners.forEach(([a,b])=>{const px=x+a*s*.83,py=y+b*s*1.08;this.line([[px-a*20,py],[px,py],[px,py-b*20]],'#c2d7dd',.65);});
    this.label('LANDMARKS DETECTED',x-s*.82,y+s*1.22,.65,'#afc7ce',8);
    this.label('●  IDENTITY CONFIRMED',x-s*.82,y+s*1.38,.85,'#d6b78e',9);
    this.circle(x-s*.3,y-s*.17,s*.11,'#d6b78e',.8);this.circle(x+s*.3,y-s*.17,s*.11,'#d6b78e',.8);
  }
  voice() {
    const x=this.cx,y=this.cy,s=this.scale*.76;
    this.glow(x,y,s*1.8,'#5b9cb721');
    this.circle(x,y,s,'#8bbccc',.35);this.circle(x,y,s*.89,'#9abaca',.15);this.circle(x,y,s*1.25,'#9abaca',.1);
    for(let i=0;i<100;i++){
      const angle=i/100*Math.PI*2, pulse=(Math.sin(i*.8+this.t*1.7)+Math.sin(i*.24-this.t))*s*.055;
      const inner=s*1.04, outer=s*1.11+Math.abs(pulse);
      this.line([[x+Math.cos(angle)*inner,y+Math.sin(angle)*inner],[x+Math.cos(angle)*outer,y+Math.sin(angle)*outer]],'#a7c9d2',.5);
    }
    const wave=[];for(let i=0;i<=150;i++){const xx=(i/150-.5)*s*2.4;const envelope=Math.exp(-Math.pow(xx/(s*.55),2));wave.push([x+xx,y+Math.sin(i*.28+this.t*2.5)*Math.sin(i*.062-this.t*.7)*s*.38*envelope]);}
    this.line(wave,'#d7c6a8',.95,1.2);
    this.label('LISTENING / INTERPRETING',x,y+s*.65,.65,'#a1c0ca',8,'center');
    ['WHISPER','VISION','RESPONSE','VOICE'].forEach((word,i)=>{this.label(word,x-s*1.1+i*s*.73,y+s*1.54,.7,i===Math.floor(this.t*.5)%4?'#d6b78e':'#8cabb5',8,'center');});
  }
  research() {
    const x=this.cx,y=this.cy,s=this.scale;
    this.glow(x,y,s*1.5,'#8c9c9920');
    for(let i=-6;i<=6;i++){this.line([[x+i*s/6,y-s],[x+i*s/6,y+s]],'#92a7af',.1);this.line([[x-s,y+i*s/6],[x+s,y+i*s/6]],'#92a7af',.1);}
    this.line([[x-s*.9,y+s],[x-s*.13,y-s*.7],[x+s*.13,y-s*.7],[x+s*.9,y+s]],'#a2b0b1',.45);
    for(let i=0;i<9;i++){const yy=y-s*.55+i*i*s*.018;this.line([[x,yy],[x,yy+5+i*1.7]],'#d6b78e',.6);}
    const boxes=[[-.55,-.1,.27,.3],[.2,-.4,.22,.27],[.4,.3,.34,.32]];
    boxes.forEach(([a,b,w,h],i)=>{
      const xx=x+a*s,yy=y+b*s;const points=[[xx,yy],[xx+w*s,yy],[xx+w*s,yy+h*s],[xx,yy+h*s],[xx,yy]];
      this.line(points,i===1?'#d6b78e':'#9cbdc3',.75);
      if(i===1){this.circle(xx+w*s/2,yy+h*s/2,w*s*.26,'#d6b78e',.7);this.label('30',xx+w*s/2,yy+h*s*.61,.7,'#d6b78e',12,'center');}
      else {this.line([[xx+w*s*.15,yy+h*s*.7],[xx+w*s*.15,yy+h*s*.35],[xx+w*s*.8,yy+h*s*.35],[xx+w*s*.9,yy+h*s*.7]],'#a3b6b7',.4);}
      this.label(['VEHICLE','TRAFFIC SIGN','VEHICLE'][i],xx,yy-9,.7,'#acbebf',7);
    });
    this.label('ONE ENVIRONMENT. THREE APPROACHES.',x-s,y+s*1.17,.6,'#d6b78e',8);
    ['YOLOv8','FASTER R-CNN','SSD'].forEach((label,i)=>this.label(label,x-s+i*s*.76,y+s*1.3,.8,'#aec2c5',8));
  }
  fields() {
    const x=this.cx,y=this.cy,s=this.scale;
    this.glow(x,y,s*1.7,'#8c956825');
    for(let row=0;row<9;row++){
      const z=150+row*100-this.progress*90;
      this.line([this.project(-450,230,z),this.project(450,230,z)],'#bac095',.2);
      for(let col=-5;col<=5;col++){
        const [px,py]=this.project(col*78,220,z),scale=520/(520+z);
        this.line([[px,py],[px,py-40*scale]],'#9cae84',.65);
        this.line([[px-10*scale,py-30*scale],[px,py-20*scale],[px+12*scale,py-37*scale]],'#9cae84',.65);
      }
    }
    this.network(['AUTHENTICATE','PRODUCTS','ORDER','INVOICE'],x,y-s*.4,s*.75,'#b5c49a');
    this.label('AWS / APPLICATION IN THE CLOUD',x,y-s*.9,.7,'#c8c5a3',8,'center');
    this.line([[x,y+s*.1],[x,y+s*.37]],'#b6c398',.4);
  }
  network(labels,x,y,size,color='#a1c6d4') {
    const points=labels.map((_,i)=>[x+(i%2-.5)*size*1.25,y+(Math.floor(i/2)-.5)*size*.85]);
    for(let i=0;i<points.length-1;i++){
      const [ax,ay]=points[i],[bx,by]=points[i+1];
      this.line([[ax,ay],[bx,by]],color,.25);
      const f=(this.t*.22+i*.23+this.progress*.2)%1;
      this.circle(ax+(bx-ax)*f,ay+(by-ay)*f,2.2,'#e6d0ab',.9,true);
    }
    points.forEach(([px,py],i)=>{
      this.glow(px,py,70,'#79a0b410');this.circle(px,py,27,color,.3);this.circle(px,py,20,color,.15);
      this.circle(px,py,3,'#d6b78e',.8,true);this.label(labels[i],px,py+48,.8,color,8,'center');
    });
  }
  hospital() {
    const x=this.cx,y=this.cy,s=this.scale;
    this.glow(x,y,s*1.8,'#6f9fa321');
    for(let i=0;i<6;i++){
      const z=100+i*200;
      this.line([[-380,220],[380,220],[380,-250],[-380,-250],[-380,220]].map(([a,b])=>this.project(a,b,z)),'#82a5ae',.15-i*.018);
    }
    this.network(['PATIENT','API GATEWAY','LAMBDA','POSTGRESQL'],x,y,s*.85);
    this.label('AROVITA / MULTI-TENANT HMS',x,y-s*.95,.85,'#c0d0cd',9,'center');
    this.label('COGNITO · JWT · MFA',x,y+s*.9,.75,'#d6b78e',9,'center');
    this.line([[x-s*.78,y+s*1.04],[x+s*.78,y+s*1.04]],'#a2c0c3',.3);
    this.label('DOCTOR / NURSE / RECEPTION / PATIENT',x,y+s*1.18,.65,'#9eb4b8',7,'center');
    const wave=[];for(let i=0;i<100;i++){let yy=0;const n=(i+this.t*8)%40;if(n>15&&n<22)yy=Math.sin((n-15)/7*Math.PI*2)*22;wave.push([x-s*.75+i*s*.015,y+s*.68+yy]);}this.line(wave,'#b3cbc2',.45);
  }
  tools() {
    const labels=[['REQUEST','API GATEWAY','LAMBDA','RDS'],['SELECT','JOIN','INDEX','RESULT'],['CLIENT','REST API','SERVICE','200 OK'],['DATA','ROLE','INTERFACE','PERSON'],['IMAGE / VOICE','MODEL','INFERENCE','RESPONSE'],['QUESTION','LOGIC','CODE','BUILD']][this.tool];
    this.glow(this.cx,this.cy,this.scale*1.5,'#9ca18c17');
    for(let i=0;i<7;i++){const z=i*150+100;this.line([this.project(-380,280,z),this.project(380,280,z)],'#9ba7a5',.17);}
    this.network(labels,this.cx,this.cy,this.scale*.85,'#b9c3b4');
    this.circle(this.cx,this.cy,this.scale*1.07,'#b7bca4',.14);
    this.label(`WORKSTATION 0${this.tool+1}`,this.cx,this.cy-this.scale*1.2,.5,'#d6b78e',9,'center');
  }
  archive() {
    this.glow(this.w*.5,this.h*.55,this.w*.7,'#7c989b0c');
    for(let i=0;i<14;i++){
      const y=this.h*.64+i*i*2.5;
      this.line([[0,y],[this.w,y]],'#91a7b1',.065);
    }
    for(let i=-8;i<9;i++)this.line([[this.w*.5+i*40,this.h*.55],[this.w*.5+i*160,this.h]],'#9aadb0',.065);
  }
  proof() {
    this.glow(this.w*.65,this.h*.45,this.h*.8,'#b0a1800e');
    for(let i=0;i<7;i++){const x=this.w*.22+i*this.w*.16;this.line([[x,0],[x,this.h]],'#b8b19e',.035);}
  }
}
