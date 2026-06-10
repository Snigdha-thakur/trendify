gsap.registerPlugin(ScrollTrigger);

/* ── ANIMATED BACKGROUND CANVAS ── */
(function(){
  const c=document.getElementById('particles');
  const ctx=c.getContext('2d');
  let W,H;
  function resize(){W=c.width=window.innerWidth;H=c.height=window.innerHeight;init();}
  window.addEventListener('resize',resize);

  /* ── CIRCUIT TRACES ── */
  let traces=[];
  let pulses=[];

  function init(){
    W=c.width=window.innerWidth;
    H=c.height=window.innerHeight;
    traces=[];
    pulses=[];
    buildCircuits();
  }

  function buildCircuits(){
    const count=18;
    for(let i=0;i<count;i++){
      const pts=[];
      let x=Math.random()*W;
      let y=Math.random()*H;
      pts.push({x,y});
      const steps=Math.floor(Math.random()*6)+4;
      for(let s=0;s<steps;s++){
        const dir=Math.floor(Math.random()*4);
        const len=Math.random()*180+60;
        if(dir===0)x+=len;
        else if(dir===1)x-=len;
        else if(dir===2)y+=len;
        else y-=len;
        pts.push({x,y});
      }
      traces.push({
        pts,
        col:Math.random()>.5?'167,124,255':'0,229,200',
        alpha:Math.random()*.08+.03
      });
    }
    /* spawn pulses along traces */
    traces.forEach((tr,ti)=>{
      setTimeout(()=>spawnPulse(ti),Math.random()*3000);
    });
  }

  function spawnPulse(ti){
    pulses.push({ti,seg:0,t:0,speed:Math.random()*.018+.008,col:traces[ti].col,life:1});
    setTimeout(()=>spawnPulse(ti),Math.random()*2000+1000);
  }

  /* ── WAVE RINGS ── */
  let rings=[];
  function spawnRing(){
    rings.push({
      x:Math.random()*W,y:Math.random()*H,
      r:0,maxR:Math.random()*200+100,
      speed:Math.random()*1.2+.6,
      col:Math.random()>.5?'167,124,255':'0,229,200',
      alpha:Math.random()*.15+.08
    });
  }
  for(let i=0;i<4;i++)spawnRing();
  setInterval(spawnRing,1800);

  /* ── SCAN LINE ── */
  let scanY=0;

  /* ── AURORA BANDS ── */
  let auroraT=0;

  function draw(){
    ctx.clearRect(0,0,W,H);
    auroraT+=.003;
    scanY=(scanY+.8)%H;

    /* aurora bands */
    for(let i=0;i<3;i++){
      const bx=W*(0.2+i*0.3+Math.sin(auroraT+i*1.2)*.12);
      const by=H*(0.3+Math.cos(auroraT*0.7+i)*.2);
      const gr=ctx.createRadialGradient(bx,by,0,bx,by,W*.35);
      const col=i%2===0?'123,94,167':'0,180,160';
      gr.addColorStop(0,`rgba(${col},.07)`);
      gr.addColorStop(.5,`rgba(${col},.03)`);
      gr.addColorStop(1,`rgba(${col},0)`);
      ctx.beginPath();ctx.ellipse(bx,by,W*.35,H*.25,auroraT*.1+i,0,Math.PI*2);
      ctx.fillStyle=gr;ctx.fill();
    }

    /* circuit traces */
    traces.forEach(tr=>{
      ctx.beginPath();
      ctx.moveTo(tr.pts[0].x,tr.pts[0].y);
      for(let i=1;i<tr.pts.length;i++)ctx.lineTo(tr.pts[i].x,tr.pts[i].y);
      ctx.strokeStyle=`rgba(${tr.col},${tr.alpha})`;
      ctx.lineWidth=1;
      ctx.stroke();
      /* junction dots */
      tr.pts.forEach(p=>{
        ctx.beginPath();ctx.arc(p.x,p.y,2,0,Math.PI*2);
        ctx.fillStyle=`rgba(${tr.col},${tr.alpha*2})`;ctx.fill();
      });
    });

    /* pulses travelling along traces */
    pulses.forEach(p=>{
      const tr=traces[p.ti];
      if(!tr)return;
      p.t+=p.speed;
      if(p.t>=1){p.t=0;p.seg++;}
      if(p.seg>=tr.pts.length-1){p.seg=0;}
      const a=tr.pts[p.seg],b=tr.pts[p.seg+1];
      if(!a||!b)return;
      const px=a.x+(b.x-a.x)*p.t;
      const py=a.y+(b.y-a.y)*p.t;
      /* trail */
      const trail=8;
      for(let i=0;i<trail;i++){
        const tt=p.t-i*.012;
        if(tt<0)continue;
        const tx=a.x+(b.x-a.x)*tt;
        const ty=a.y+(b.y-a.y)*tt;
        const o=(1-i/trail)*.9;
        ctx.beginPath();ctx.arc(tx,ty,2.5-i*.2,0,Math.PI*2);
        ctx.fillStyle=`rgba(${p.col},${o})`;ctx.fill();
      }
      /* head glow */
      const hg=ctx.createRadialGradient(px,py,0,px,py,10);
      hg.addColorStop(0,`rgba(${p.col},1)`);
      hg.addColorStop(.4,`rgba(${p.col},.4)`);
      hg.addColorStop(1,`rgba(${p.col},0)`);
      ctx.beginPath();ctx.arc(px,py,10,0,Math.PI*2);
      ctx.fillStyle=hg;ctx.fill();
    });

    /* expanding rings */
    for(let i=rings.length-1;i>=0;i--){
      const r=rings[i];
      r.r+=r.speed;
      const o=r.alpha*(1-r.r/r.maxR);
      if(o<=0){rings.splice(i,1);continue;}
      ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,Math.PI*2);
      ctx.strokeStyle=`rgba(${r.col},${o})`;
      ctx.lineWidth=1;
      ctx.stroke();
      /* inner ring */
      if(r.r>20){
        ctx.beginPath();ctx.arc(r.x,r.y,r.r*.6,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${r.col},${o*.5})`;
        ctx.lineWidth=.5;
        ctx.stroke();
      }
    }

    /* scan line */
    const sg=ctx.createLinearGradient(0,scanY-40,0,scanY+40);
    sg.addColorStop(0,'rgba(167,124,255,0)');
    sg.addColorStop(.5,'rgba(167,124,255,.04)');
    sg.addColorStop(1,'rgba(167,124,255,0)');
    ctx.fillRect(0,scanY-40,W,80);
    ctx.fillStyle=sg;
    ctx.fillRect(0,scanY-40,W,80);

    requestAnimationFrame(draw);
  }

  init();
})();

/* ── CURSOR ── */
const cur=document.getElementById('c'),ring=document.getElementById('cr');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px'});
(function t(){rx+=(mx-rx)*.09;ry+=(my-ry)*.09;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(t)})();
document.querySelectorAll('a,button').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('h'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('h'));
});

/* ── SCROLL PROGRESS ── */
const prog=document.getElementById('prog');
window.addEventListener('scroll',()=>{prog.style.transform=`scaleX(${window.scrollY/(document.body.scrollHeight-window.innerHeight)})`},{passive:true});

/* ── NAV ── */
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>nav.classList.toggle('s',window.scrollY>60),{passive:true});

/* ── HERO (index only) ── */
if(document.getElementById('hh1')){
  const tl=gsap.timeline({defaults:{ease:'expo.out'}});
  tl.fromTo('#hew',{opacity:0,y:20},{opacity:1,y:0,duration:1},0.1)
    .fromTo('#hh1',{opacity:0,y:80,skewY:2},{opacity:1,y:0,skewY:0,duration:1.5},0.3)
    .fromTo('#hsplit',{opacity:0,y:32},{opacity:1,y:0,duration:1.1},0.75)
    .fromTo('#hstats .hs-item',{opacity:0,y:20},{opacity:1,y:0,duration:.7,stagger:.1},1.0)
    .fromTo('#hvis',{opacity:0,y:70,rotateX:10,transformPerspective:1200},{opacity:1,y:0,rotateX:0,duration:1.8,ease:'power4.out'},1.1);

  gsap.to('#hvis',{yPercent:-10,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:1.5}});

  window.addEventListener('mousemove',e=>{
    const x=(e.clientX/window.innerWidth-.5)*28,y=(e.clientY/window.innerHeight-.5)*18;
    document.querySelector('.hl1').style.transform=`translateX(calc(-50% + ${x}px)) translateY(${y}px)`;
    document.querySelector('.hl2').style.transform=`scale(1) translateX(${-x*.6}px) translateY(${-y*.5}px)`;
    document.querySelector('.hl3').style.transform=`scale(1) translateX(${x*.4}px) translateY(${y*.6}px)`;
  });
}

/* ── ECONOMY ── */
if(document.getElementById('economy')){
  gsap.fromTo('.eco-h2',{opacity:0,y:60},{opacity:1,y:0,duration:1.2,ease:'power3.out',
    scrollTrigger:{trigger:'#economy',start:'top 80%'}});
  gsap.fromTo('.eco-body p',{opacity:0,y:20},{opacity:1,y:0,duration:.8,stagger:.15,ease:'power3.out',
    scrollTrigger:{trigger:'#economy',start:'top 72%'}});
  ['#ef1','#ef2','#ef3'].forEach((id,i)=>{
    gsap.fromTo(id,{opacity:0,y:30,x:-10},{opacity:1,y:0,x:0,duration:1,delay:i*.15,ease:'power3.out',
      scrollTrigger:{trigger:'#economy',start:'top 70%'}});
  });
}

/* ── MANIFESTO ── */
if(document.getElementById('manifesto')){
  ['#ml1','#ml2','#ml3','#ml4'].forEach((id,i)=>{
    gsap.fromTo(id,{opacity:0,y:70,skewY:1},{opacity:1,y:0,skewY:0,duration:1.1,delay:i*.12,ease:'expo.out',
      scrollTrigger:{trigger:'#manifesto',start:'top 78%'}});
  });
  gsap.fromTo('#mfsub',{opacity:0,y:24},{opacity:1,y:0,duration:1,ease:'power3.out',
    scrollTrigger:{trigger:'#manifesto',start:'top 55%'}});
}

/* ── PLATFORM CHAPTERS ── */
if(document.getElementById('chap1')){
  ['#chap1','#chap2','#chap3'].forEach((id,i)=>{
    const dir=i%2===0?40:-40;
    gsap.fromTo(`${id} .chap-l`,{opacity:0,x:-dir},{opacity:1,x:0,duration:1,ease:'power3.out',
      scrollTrigger:{trigger:id,start:'top 82%'}});
    gsap.fromTo(`${id} .chap-r`,{opacity:0,x:dir},{opacity:1,x:0,duration:1,ease:'power3.out',
      scrollTrigger:{trigger:id,start:'top 82%'}});
  });
}

/* ── ECOSYSTEM ROWS ── */
if(document.getElementById('ecr1')){
  ['#ecr1','#ecr2','#ecr3','#ecr4','#ecr5','#ecr6'].forEach((id,i)=>{
    gsap.fromTo(id,{opacity:0,y:24},{opacity:1,y:0,duration:.9,ease:'power3.out',
      scrollTrigger:{trigger:id,start:'top 88%'}});
  });
}

/* ── VOICES ── */
if(document.getElementById('voices')){
  gsap.fromTo('.voices-h',{opacity:0,y:50},{opacity:1,y:0,duration:1.1,ease:'power3.out',
    scrollTrigger:{trigger:'#voices',start:'top 80%'}});
  ['#vc1','#vc2','#vc3'].forEach((id,i)=>{
    gsap.fromTo(id,{opacity:0,y:40},{opacity:1,y:0,duration:1,delay:i*.15,ease:'power3.out',
      scrollTrigger:{trigger:'#voices',start:'top 75%'}});
  });
  gsap.fromTo('#vpq',{opacity:0,x:-40},{opacity:1,x:0,duration:1.1,ease:'power3.out',
    scrollTrigger:{trigger:'#voices',start:'top 70%'}});
}

/* ── PRICING ── */
if(document.getElementById('pricing')){
  gsap.fromTo('.pr-header',{opacity:0,y:40},{opacity:1,y:0,duration:1,ease:'power3.out',
    scrollTrigger:{trigger:'#pricing',start:'top 80%'}});
  ['#pcol1','#pcol2','#pcol3'].forEach((id,i)=>{
    gsap.fromTo(id,{opacity:0,y:50},{opacity:1,y:0,duration:.9,delay:i*.15,ease:'power3.out',
      scrollTrigger:{trigger:'#pricing',start:'top 75%'}});
  });
}

/* ── FINALE ── */
if(document.getElementById('finale')){
  gsap.fromTo('#finh',{opacity:0,y:100,skewY:1},{opacity:1,y:0,skewY:0,duration:1.8,ease:'expo.out',
    scrollTrigger:{trigger:'#finale',start:'top 75%'}});
  gsap.fromTo('.fin-r',{opacity:0,x:40},{opacity:1,x:0,duration:1.2,ease:'power3.out',
    scrollTrigger:{trigger:'#finale',start:'top 70%'}});
}

/* ── MAGNETIC BUTTONS ── */
document.querySelectorAll('.btn-a,.btn-nav,.btn-nav-ghost').forEach(btn=>{
  btn.addEventListener('mousemove',e=>{
    const r=btn.getBoundingClientRect();
    btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.2}px,${(e.clientY-r.top-r.height/2)*.28}px)`;
  });
  btn.addEventListener('mouseleave',()=>{
    btn.style.transition='transform .8s cubic-bezier(.23,1,.32,1)';
    btn.style.transform='';
    setTimeout(()=>btn.style.transition='',800);
  });
});

/* ── HOVER SPOTLIGHT ── */
document.querySelectorAll('.ec-row,.v-cell,.v-pullquote,.pr-col').forEach(el=>{
  el.addEventListener('mousemove',e=>{
    const r=el.getBoundingClientRect();
    const x=((e.clientX-r.left)/r.width)*100;
    const y=((e.clientY-r.top)/r.height)*100;
    el.style.setProperty('--mx',x+'%');
    el.style.setProperty('--my',y+'%');
    el.style.backgroundImage=`radial-gradient(circle at var(--mx) var(--my),rgba(123,94,167,.08) 0%,transparent 60%)`;
  });
  el.addEventListener('mouseleave',()=>el.style.backgroundImage='');
});

/* ── COUNTER ANIMATION ── */
function animateCount(el,target,prefix='',suffix=''){
  const isDecimal=target%1!==0;
  gsap.fromTo({v:0},{v:target,duration:2,ease:'power2.out',
    onUpdate:function(){
      el.textContent=prefix+(isDecimal?this.targets()[0].v.toFixed(1):Math.round(this.targets()[0].v))+suffix;
    }
  });
}
ScrollTrigger.create({trigger:'#economy',start:'top 70%',once:true,onEnter:()=>{
  document.querySelectorAll('.eco-fig-n').forEach(el=>{
    const txt=el.textContent;
    if(txt.includes('₹'))animateCount(el,3926,'₹','Cr');
    else if(txt.includes('M+'))animateCount(el,80,'','M+');
    else if(txt.includes('%'))animateCount(el,20.5,'','%');
  });
}});

/* ── LIVE TX TICKER ── */
if(document.getElementById('txlist')){
  const txData=[
    ['Vikram Nair','Stock Trading Masterclass','₹5,999'],
    ['Deepa Krishnan','Yoga for Beginners','₹1,499'],
    ['Rahul Gupta','Creator Pro Membership','₹599'],
    ['Ananya Bose','Canva Templates Bundle','₹399'],
    ['Siddharth Rao','Python Bootcamp 2025','₹3,999'],
    ['Pooja Menon','Business Writing Course','₹2,499'],
    ['Riya Shah','Instagram Growth Workshop','₹999'],
  ];
  let ti=0;
  setInterval(()=>{
    const d=txData[ti++%txData.length];
    const feed=document.getElementById('txlist');
    const row=document.createElement('div');row.className='tx';
    row.innerHTML=`<div><div class="tx-n">${d[0]}</div><div class="tx-p">${d[1]}</div></div><div><div class="tx-v">+${d[2]}</div><div class="tx-t">just now</div></div>`;
    feed.insertBefore(row,feed.firstChild);
    feed.querySelectorAll('.tx-t').forEach((t,i)=>{
      t.textContent=i===0?'just now':i===1?'3 min ago':i===2?'7 min ago':'11 min ago';
    });
    while(feed.children.length>4)feed.removeChild(feed.lastChild);
  },3800);
}
