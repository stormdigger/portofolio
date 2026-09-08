import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, access } from 'node:fs/promises';
import { resolve } from 'node:path';

const output=resolve('test-results');
await mkdir(output,{recursive:true});
const localBrowser=process.env.LOCALAPPDATA?resolve(process.env.LOCALAPPDATA,'ms-playwright/chromium-1234/chrome-win64/chrome.exe'):'';
let executablePath=process.env.CHROMIUM_PATH;
if(!executablePath&&localBrowser){try{await access(localBrowser);executablePath=localBrowser;}catch{}}
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader'],...(executablePath?{executablePath}: {})});
const errors=[];
const page=await browser.newPage({viewport:{width:1440,height:960},deviceScaleFactor:1});
page.on('pageerror',e=>errors.push(e.message));
const base=process.env.TEST_URL||'http://localhost:4173';
async function jump(id,progress=.12){
  await page.evaluate(({id,progress})=>{const el=document.getElementById(id);window.scrollTo({top:el.offsetTop+Math.max(0,el.offsetHeight-innerHeight)*progress,behavior:'instant'});},{id,progress});
  await page.waitForTimeout(150);
}
try{
  await page.goto(base,{waitUntil:'networkidle'});
  await page.waitForTimeout(1800);
  assert.equal(await page.locator('.scene').count(),12,errors.join('\n')||'All twelve story scenes must load');
  assert.equal(await page.locator('#world').getAttribute('data-engine'),'webgl','The main experience must render actual 3D, not silently fall back');
  assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'false');
  assert.equal(await page.locator('.identity').getAttribute('aria-hidden'),'true');
  const image=await page.request.get(`${base}/assets/room.webp`);assert.equal(image.status(),200);
  await page.screenshot({path:resolve(output,'01-opening-desktop.png')});
  await page.locator('#disassemble').click();await page.waitForTimeout(1100);
  assert.equal(await page.locator('#world').getAttribute('data-exploded'),'true');
  await page.screenshot({path:resolve(output,'00-exploded-world.png')});
  await page.locator('#disassemble').click();await page.waitForTimeout(1100);
  assert.equal(await page.locator('#world').getAttribute('data-exploded'),'false');
  const startCamera=Number(await page.locator('#world').getAttribute('data-camera-z'));
  await page.evaluate(()=>scrollTo({top:150,behavior:'instant'}));await page.waitForTimeout(250);
  assert.ok(Number(await page.locator('#world').getAttribute('data-camera-z'))<startCamera,'A small scroll must move the camera immediately');

  await page.locator('#quick-view').click();
  assert.equal(await page.locator('#quick-dialog').evaluate(d=>d.open),true);
  assert.match(await page.locator('#quick-content').innerText(),/Arovita Care/);
  await page.locator('#quick-dialog [data-project="arovita"]').click();
  assert.equal(await page.locator('#detail-title').innerText(),'Arovita HMS');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#quick-dialog').evaluate(d=>d.open),true);
  await page.screenshot({path:resolve(output,'02-quick-view.png')});
  await page.locator('#quick-close').click();

  for(const id of ['machine','university','facemeet','doctorg','research','agristore','arovita','toolbox','archive','proof']){
    await jump(id,.35);
    assert.equal(await page.locator(`#${id}`).evaluate(el=>getComputedStyle(el.firstElementChild).opacity),'1',`Chapter ${id} should be readable`);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false,`${id}: horizontal overflow`);
    await page.screenshot({path:resolve(output,`scene-${id}.png`)});
  }
  await jump('toolbox');
  await page.locator('#tool-0').focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#tool-1').getAttribute('aria-selected'),'true');
  assert.match(await page.locator('#tool-panel').innerText(),/PostgreSQL/);
  await jump('arovita');
  await page.locator('#send-request').click();
  await page.waitForTimeout(250);
  const requestStart=await page.locator('#world').getAttribute('data-request-position');
  await page.waitForTimeout(1350);
  assert.notEqual(await page.locator('#world').getAttribute('data-request-position'),requestStart,'The visible request must move through the 3D system');
  assert.match(await page.locator('#request-status').innerText(),/API GATEWAY|LAMBDA|POSTGRESQL/);

  await jump('archive');
  await page.mouse.click(720,460);
  assert.equal(await page.locator('#detail-title').innerText(),'AgriStore','The actual 3D door must be clickable');
  await page.keyboard.press('Escape');
  const prior=await page.evaluate(()=>scrollY);
  for(const id of ['facemeet','doctorg','agristore','arovita','research']){
    await page.locator(`.portal[data-project="${id}"]`).click();
    assert.equal(await page.locator('#detail-dialog').evaluate(d=>d.open),true);
    assert.equal(await page.locator('#detail-content h3').count(),3);
    if(id==='facemeet')await page.screenshot({path:resolve(output,'03-project-detail.png')});
    await page.locator('#detail-back').click();
    assert.ok(Math.abs(await page.evaluate(()=>scrollY)-prior)<2,'Project exit must preserve scroll');
    assert.equal(await page.evaluate(()=>document.activeElement.dataset.project),id);
  }
  await page.locator('#chapter-toggle').click();
  assert.equal(await page.locator('#chapter-toggle').getAttribute('aria-expanded'),'true');
  await page.keyboard.press('Escape');assert.equal(await page.locator('#chapter-menu').isVisible(),false);
  await jump('present',.85);
  assert.equal(await page.locator('.identity').getAttribute('aria-hidden'),'false');
  await page.waitForTimeout(700);
  await page.screenshot({path:resolve(output,'04-ending.png')});
  await page.locator('#sound').click();assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'true');
  await page.locator('#sound').click();assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'false');

  await page.setViewportSize({width:390,height:844});
  await jump('curiosity',0);await page.waitForTimeout(500);
  await page.screenshot({path:resolve(output,'05-opening-mobile.png')});
  for(const id of ['university','toolbox','archive','proof','present']){
    await jump(id,id==='present'?.8:0);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`Mobile ${id}: overflow`);
    await page.screenshot({path:resolve(output,`mobile-${id}.png`)});
  }
  await jump('archive');
  await page.locator('.portal[data-project="research"]').click();
  assert.equal(await page.locator('#detail-title').innerText(),'Research');
  await page.keyboard.press('Escape');
  await page.emulateMedia({reducedMotion:'reduce'});
  await jump('facemeet');
  assert.equal(await page.locator('.cursor').first().evaluate(el=>getComputedStyle(el).animationName),'none');
  await page.locator('#quick-view').click();
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>!!document.activeElement.closest('#quick-dialog')),true);
  await page.keyboard.press('Escape');
  await page.goto(`${base}/resume.html`);
  assert.match(await page.locator('main').innerText(),/Balwinder Singh/);
  await page.goto(`${base}/dist/`,{waitUntil:'networkidle'});
  await page.waitForTimeout(700);
  assert.equal(await page.locator('#world').getAttribute('data-engine'),'webgl','The production build must contain the 3D engine and assets');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS: 12 scenes, 5 project flows, exact scroll restoration, nested quick view, keyboard tabs, chapter menu, sound toggle, final reveal, mobile overflow, reduced motion, résumé.');
  console.log(`Screenshots: ${output}`);
}finally{await browser.close();}
