
// ===== 子页 -> 父页: postMessage 协议 =====
const SKILLCHECK_CH = "skillcheck:v1";

// 允许父页通过 ?origin=... 传入可信源（强烈建议父页传入自己的 origin）
// 若没传则退化为 "*"（开发期方便，正式环境请务必传 origin）
const PARENT_ORIGIN = new URLSearchParams(location.search).get("origin") || "*";

// 可选：从 URL 读取初始难度/参数，例如 ?diff=hard&total=14
const PARAMS = Object.fromEntries(new URLSearchParams(location.search).entries());

function reportToParent(status, extra = {}) {
  try {
    window.parent?.postMessage(
      { channel: SKILLCHECK_CH, status, ...extra },
      PARENT_ORIGIN
    );
  } catch (e) {
    console.error("postMessage failed:", e);
  }
}


(function(){
  const TAU = Math.PI * 2;
  const $ = sel => document.querySelector(sel);
  const $log = $('#log');
  const $bar = $('#progressBar');
  const $progressText = $('#progressText');
  const $streak = $('#hud-streak');
  const $fail = $('#hud-fail');
  const $left = $('#hud-left');
  const $perfect = $('#hud-perfect');
  const $speed = $('#hud-speed');
  const $window = $('#hud-window');
  const $diff = $('#hud-diff');
  const $float = $('#floatMsg');
  const $stage = $('#stage');
  const $sfxGood = $('#sfx-good');
  const $sfxBad = $('#sfx-bad');
  const $needle = $('#needle');
  const $windowGroup = $('#windowGroup');
  const $ticks = $('#ticks');

  // ===== Game State =====
  const state = {
    running:false, paused:false,
    progress:0, baseSpeed:120, speed:120, angle:0,
    windowStart:0, windowSize:36, windowActive:false,
    totalWindows:12, windowsLeft:12, // 可触发窗口上限
    streak:0, fail:0, perfect:0, protect:true, diff:'normal',
    lastT:performance.now(),
  };

  // 刻度
  function drawTicks(){
    const parts=24, r1=78, r2=88; let html='';
    for(let i=0;i<parts;i++){
      const a=(i/parts)*TAU, x1=100+Math.sin(a)*r1, y1=100-Math.cos(a)*r1, x2=100+Math.sin(a)*r2, y2=100-Math.cos(a)*r2;
      const thick=(i%6===0)?2.4:1.2, col=(i%6===0)?'#7aa2ff':'#415089';
      html+=`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${col}" stroke-width="${thick}" stroke-linecap="round"/>`;
    }
    $ticks.innerHTML=html;
  }
  drawTicks();

  // SVG 弧段
  function arcSVG(cx,cy,r, a0Deg,a1Deg, {fill='none', stroke='#fff', width=6, opacity=1}={}){
    const a0=(a0Deg-90)*Math.PI/180, a1=(a1Deg-90)*Math.PI/180;
    const x0=cx+r*Math.cos(a0), y0=cy+r*Math.sin(a0), x1=cx+r*Math.cos(a1), y1=cy+r*Math.sin(a1);
    const large=((a1Deg-a0Deg)%360>180)?1:0;
    const d=`M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
    return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" opacity="${opacity}"/>`;
  }
  function defsGradient(){
    return `<defs>
      <linearGradient id="winGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#a7f3d0"/><stop offset="100%" stop-color="#34d399"/></linearGradient>
      <linearGradient id="perfectGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#fde68a"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient>
    </defs>`;
  }
  function drawPerfect(){
    const center=state.windowStart+state.windowSize/2, half=state.windowSize*0.15; // 30%
    const s=center-half, e=center+half;
    return arcSVG(100,100,84,s,e,{fill:'none',stroke:'url(#perfectGrad)',width:12,opacity:.95});
  }

  // 生成窗口（会消耗一次）
  function spawnWindow(){
    if(state.windowsLeft<=0){
      if(state.progress<100){ endFail('修机失败：次数耗尽'); }
      return;
    }
    state.windowActive=true;
    state.windowStart=Math.random()*360;
    $windowGroup.innerHTML =
      arcSVG(100,100,84,state.windowStart,state.windowStart+state.windowSize,{fill:'none',stroke:'url(#winGrad)',width:10})
      + defsGradient()
      + drawPerfect();
    state.windowsLeft--; // 生成即消耗
    $left.textContent=state.windowsLeft;
  }

  // 命中判断
  function hitQuality(){
    const norm=x=> (x%360+360)%360, ang=norm(state.angle), s=norm(state.windowStart), e=norm(state.windowStart+state.windowSize);
    const inWindow=(s<e)?(ang>=s && ang<=e):(ang>=s || ang<=e);
    if(!state.windowActive || !inWindow) return 'miss';
    const center=norm(state.windowStart+state.windowSize/2);
    const delta=Math.min(Math.abs(ang-center), 360-Math.abs(ang-center));
    const perfectHalf=state.windowSize*0.15;
    return (delta<=perfectHalf)?'perfect':'good';
  }

  function doHit(){ if(!state.running || state.paused) return; const q=hitQuality(); (q==='miss')?fail():success(q); }

  function success(kind){
    playSFX('good'); state.streak++; $streak.textContent=`${state.streak} 连`;
    if(kind==='perfect'){ state.perfect++; flashFloat('完美校准 +20%'); addProgress(20); log('★ 完美校准 +20%','good'); }
    else { addProgress(14); log('√ 校准成功 +14%','good'); }
    state.windowActive=false; $windowGroup.innerHTML='';
    state.speed*=1.04; updateHUD();
    nextStep();
  }

  function fail(){
    playSFX('bad'); state.fail++; state.streak=0; $fail.textContent=state.fail; $streak.textContent='0 连';
    log('× 校准失败 -12%（短暂眩晕）','bad'); addProgress(-12); shake($stage);
    state.paused=true; setTimeout(()=>{ state.paused=false; }, 500);
    state.windowActive=false; $windowGroup.innerHTML='';
    nextStep();
  }

  function nextStep(){
  if(state.progress>=100){
    state.running=false;
    log('✔ 破译完成！','good');
    flashFloat('破译完成！');

    reportToParent("win", { progress: state.progress }); // ★ 新增：告诉父页“胜利”

    return;
  }
  if(state.windowsLeft<=0){
    if(state.progress<100){ endFail('修机失败：次数耗尽'); }
    return;
  }
  const delay = rand(700,1500);
  setTimeout(spawnWindow, delay);
}


  function addProgress(x){
    let p = state.progress + x;
    if(state.protect) p = Math.max(0, p);
    state.progress = Math.min(100, Math.max(0, p));
    $bar.style.width = state.progress.toFixed(1)+'%';
    $progressText.textContent = state.progress.toFixed(0)+'%';
  }

  function endFail(msg){
  state.running=false;
  log(`✖ ${msg}`,'bad');
  flashFloat('修机失败');

  reportToParent("lose", { reason: msg }); // ★ 新增：告诉父页“失败”
}


  function log(text, cls){ const p=document.createElement('p'); if(cls) p.classList.add(cls); p.textContent=`[${(new Date()).toLocaleTimeString(undefined,{hour12:false})}] ${text}`; $log.prepend(p); }
  function flashFloat(text){ $float.textContent=text; $float.style.display='block'; $float.style.opacity='1'; setTimeout(()=>{$float.style.opacity='0'},550); setTimeout(()=>{$float.style.display='none'},880); }
  function shake(el){ el.classList.remove('danger'); void el.offsetWidth; el.classList.add('danger'); }
  function playSFX(kind){ if(!$('#toggle-sfx').checked) return; const a=(kind==='good')?$sfxGood:$sfxBad; try{ a.currentTime=0; a.play(); }catch(e){} }
  function rand(a,b){ return Math.random()*(b-a)+a; }

  // ===== 主循环 =====
  function loop(t){
    if(state.running && !state.paused){
      const dt=(t-state.lastT)/1000;
      state.angle=(state.angle + state.speed*dt)%360;
      $needle.style.transform=`rotate(${state.angle}deg)`;
    }
    state.lastT=t; requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ===== 开始/重置/难度 =====
  function resetGame(){
    state.running=false; state.paused=false;
    state.progress=0; state.angle=0; state.streak=0; state.fail=0; state.perfect=0;
    state.windowActive=false; $windowGroup.innerHTML='';
    if(state.diff==='easy'){ state.baseSpeed=95;  state.windowSize=52; state.totalWindows=10; }
    else if(state.diff==='hard'){ state.baseSpeed=155; state.windowSize=28; state.totalWindows=14; }
    else { state.baseSpeed=120; state.windowSize=36; state.totalWindows=12; } // 普通
    state.speed=state.baseSpeed; state.windowsLeft=state.totalWindows;

    $bar.style.width='0%'; $progressText.textContent='0%';
    $streak.textContent='0 连'; $fail.textContent='0'; $left.textContent=state.windowsLeft;
    updateHUD(); $log.innerHTML='';
    log('新一局开始：次数会随每个窗口消耗，用尽未满即失败。','warn');
  }

  function startGame(){ resetGame(); state.running=true; spawnWindow(); }
  function setDiff(d){ state.diff=d; $diff.textContent = d==='easy'?'简单':(d==='hard'?'困难':'普通'); }
  function updateHUD(){ $speed.textContent=state.speed.toFixed(0); $window.textContent=state.windowSize.toFixed(0); const perfectRate=state.totalWindows===0?0:(state.perfect/state.totalWindows*100); $perfect.textContent=perfectRate.toFixed(0)+'%'; }
  function togglePause(){ if(!state.running) return; state.paused=!state.paused; log(state.paused?'⏸ 已暂停 (按 P 恢复)':'▶ 已恢复'); }

  // 事件
  document.addEventListener('keydown', e=>{
    if(e.code==='Space'){ e.preventDefault(); doHit(); }
    if(e.code==='KeyP'){ togglePause(); }
  }, {passive:false});
  $('#btn-hit').addEventListener('click', doHit);
  $('#btn-start').addEventListener('click', startGame);
  $('#btn-pause').addEventListener('click', togglePause);
  $('#btn-easy').addEventListener('click', ()=>{ setDiff('easy'); resetGame(); });
  $('#btn-normal').addEventListener('click', ()=>{ setDiff('normal'); resetGame(); });
  $('#btn-hard').addEventListener('click', ()=>{ setDiff('hard'); resetGame(); });

  // 初始化
  setDiff('normal'); resetGame();
})();
