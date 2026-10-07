(() => {
  'use strict';
  const canvas=document.querySelector('#fire'),ctx=canvas.getContext('2d',{alpha:false});
  const hero=document.querySelector('.hero'),layers=[...document.querySelectorAll('[data-depth]')],button=document.querySelector('#motion');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let w=1400,h=950,frame=0,paused=false,visible=true,start=0,last=0,time=0,scroll=0,target=0;
  const rand=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
  // Deterministic particles make a smooth 24-second cycle with no random resets.
  const coals=Array.from({length:80},(_,i)=>({x:rand(i+1),y:rand(i+97),r:18+rand(i+234)*48,a:rand(i+401)}));
  function paint(t){
    const s=Math.sin(t*Math.PI*2/24),c=Math.cos(t*Math.PI*2/24);
    ctx.fillStyle='#151a14';ctx.fillRect(0,0,w,h);
    const glow=ctx.createRadialGradient(w*.72,h*.73,0,w*.72,h*.73,w*.65);
    glow.addColorStop(0,'#74391f');glow.addColorStop(.4,'#382b1b');glow.addColorStop(1,'#141a14');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    ctx.save();ctx.translate(w*.68,h*.79);ctx.rotate(-.28);ctx.scale(1.12+s*.016,1.12+s*.016);
    for(let i=0;i<coals.length;i++){
      const a=coals[i],x=(a.x-.5)*w*1.15,y=(a.y-.5)*h*.7,r=a.r*w/1400;
      ctx.save();ctx.translate(x,y);ctx.rotate(a.a*6.28);ctx.shadowBlur=r*.55;ctx.shadowColor=`rgba(226,93,29,${.2+.15*Math.sin(t*Math.PI/12+a.a*6.28)})`;
      ctx.fillStyle='#ba592a';ctx.beginPath();for(let j=0;j<7;j++){const angle=j*Math.PI*2/7,rad=r*(.8+rand(i*9+j)*.3);ctx.lineTo(Math.cos(angle)*rad,Math.sin(angle)*rad*.7)}ctx.closePath();ctx.fill();
      ctx.shadowBlur=0;ctx.scale(.93,.91);ctx.fillStyle=i%3===0?'#31302a':'#242521';ctx.fill();ctx.strokeStyle='#4a4435';ctx.lineWidth=1;ctx.stroke();ctx.restore();
    }
    for(let i=-12;i<15;i++){const x=i*w/23;const g=ctx.createLinearGradient(x,0,x+13,0);g.addColorStop(0,'#0b100e');g.addColorStop(.5,'#555346');g.addColorStop(.7,'#292c23');g.addColorStop(1,'#0d120f');ctx.fillStyle=g;ctx.fillRect(x,-h,13*w/1400,h*2)}
    ctx.restore();
    // Soft translucent smoke plumes, each fading before wrapping.
    for(let i=0;i<12;i++){const p=(t/24+i/12)%1,alpha=Math.sin(p*Math.PI)**2*.08;const x=w*(.5+rand(i+700)*.46)+Math.sin(p*6.28+i)*w*.08;const y=h*(1.15-p*1.4),r=w*(.10+p*.12);const fog=ctx.createRadialGradient(x,y,0,x,y,r);fog.addColorStop(0,`rgba(213,212,187,${alpha})`);fog.addColorStop(1,'rgba(213,212,187,0)');ctx.fillStyle=fog;ctx.fillRect(x-r,y-r,r*2,r*2)}
    for(let i=0;i<35;i++){const p=(t/24+rand(i+900))%1,x=w*(.40+rand(i+990)*.58)+Math.sin(p*6.28+i)*20,y=h*(1.1-p*1.25);ctx.globalAlpha=Math.sin(p*Math.PI)**2*.85;ctx.fillStyle=i%3?'#e3a65d':'#edce94';ctx.beginPath();ctx.ellipse(x,y,1.2*w/1400,3*w/1400,-.3,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
    const vignette=ctx.createRadialGradient(w*.65,h*.5,w*.2,w*.5,h*.5,w*.85);vignette.addColorStop(0,'transparent');vignette.addColorStop(1,'#0b120fe6');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
  }
  function resize(){const r=hero.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,1.5);w=Math.round(r.width*1.2*d);h=Math.round(r.height*1.36*d);canvas.width=w;canvas.height=h;paint(time);onScroll()}
  function onScroll(){target=Math.min(hero.offsetHeight,Math.max(0,-hero.getBoundingClientRect().top));kick()}
  function tick(now){frame=0;if(!last)last=now;const delta=Math.min(now-last,50);last=now;if(!paused&&!reduced.matches&&visible&&!document.hidden){time=(time+delta/1000)%24;paint(time);scroll+=(target-scroll)*.09;layers.forEach(el=>{const factor=Number(el.dataset.depth)*(innerWidth<600?.5:1);el.style.transform=`translate3d(0,${scroll*factor}px,0)`});frame=requestAnimationFrame(tick)}}
  function kick(){if(!frame&&!paused&&!reduced.matches&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(tick)}}
  function sync(){cancelAnimationFrame(frame);frame=0;button.hidden=reduced.matches;button.textContent=paused?'Play animation':'Pause animation';button.setAttribute('aria-pressed',String(paused));if(reduced.matches||paused){layers.forEach(el=>el.style.transform='none');paint(reduced.matches?8:time)}else kick()}
  button.addEventListener('click',()=>{paused=!paused;sync()});reduced.addEventListener('change',sync);
  addEventListener('resize',resize,{passive:true});addEventListener('scroll',onScroll,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else kick()});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)kick();else{cancelAnimationFrame(frame);frame=0}},{threshold:0}).observe(hero);
  resize();sync();
})();
