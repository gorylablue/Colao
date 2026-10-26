// Prueba del aviso de En El Mapa en Colao' con toques REALES por coordenadas.
// Uso: node prueba_aviso.js http://127.0.0.1:8811/index.html  (con un servidor local en la carpeta)
const { chromium } = require('playwright');
const URL = process.argv[2];
const SIZES = [['iPhone', 390, 844, true], ['iPad', 820, 1180, true], ['laptop', 1366, 768, false], ['grande', 1920, 1080, false]];
const ABIERTO = "!!([...document.body.children].find(e => e.shadowRoot && e.shadowRoot.querySelector('.hoja')))";
const sleep = (pg, ms) => pg.waitForTimeout(ms);
async function gesto(pg, touch, dy) {
  if (touch) {
    // dedo real: touchStart, varios touchMove, touchEnd (dedo sube = página baja)
    const c = await pg.context().newCDPSession(pg);
    const x = 200, y0 = 600, n = 12, step = Math.min(dy, 450) / n;
    let done = 0;
    while (done < dy) {
      const d = Math.min(450, dy - done), st = d / n;
      await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] });
      for (let i = 1; i <= n; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 - st * i }] }); await pg.waitForTimeout(16); }
      await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      done += d; await pg.waitForTimeout(120);
    }
  }
  else { await pg.mouse.move(400, 400); await pg.mouse.wheel(0, dy); }
}
const tocar = (pg, touch, x, y) => touch ? pg.touchscreen.tap(x, y) : pg.mouse.click(x, y);
const caja = (pg, sel) => pg.evaluate((sel) => {
  const h = [...document.body.children].find(e => e.shadowRoot && e.shadowRoot.querySelector('.hoja')); if (!h) return null;
  const el = h.shadowRoot.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2, href: el.getAttribute('href'), target: el.getAttribute('target') };
}, sel);
const quien = (pg, x, y) => pg.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && e.shadowRoot ? 'aviso' : (e ? (e.id || e.className || e.tagName) : 'nada'); }, [x, y]);
(async () => {
  let fallos = 0;
  const b = await chromium.launch();
  for (const [name, w, h, touch] of SIZES) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch });
    const pg = await ctx.newPage(); const errs = [], posts = [], popups = [];
    pg.on('pageerror', e => errs.push(e.message)); ctx.on('page', np => popups.push(np));
    await ctx.route('**/*', async (route) => {
      const rq = route.request();
      if (rq.method() === 'POST') { posts.push(Object.fromEntries(new URLSearchParams(rq.postData() || ''))); return route.fulfill({ status: 200, body: 'ok' }); }
      if (!rq.url().startsWith('http://127.0.0.1') && !/cdnjs|fonts\./.test(rq.url())) return route.fulfill({ status: 200, body: '' });
      return route.continue();
    });
    await pg.goto(URL + '?lang=es'); await sleep(pg, 1500);
    const r = {};
    r['no sale al cargar'] = !(await pg.evaluate(ABIERTO)) ? 'ok' : 'SALIÓ ANTES';
    await gesto(pg, touch, 300); await sleep(pg, 1200);
    r['sale al bajar'] = (await pg.evaluate(ABIERTO)) ? 'ok' : 'NO SALE';
    let x = await caja(pg, '.x');
    r['X encima'] = (await quien(pg, x.x, x.y)) === 'aviso' ? 'ok' : 'TAPADA';
    const cm = await pg.evaluate(() => { const r = document.getElementById('cupMeter').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
    const qcm = await quien(pg, cm[0], cm[1]);
    r['tacita debajo del aviso'] = qcm === 'aviso' ? 'ok' : `tacita encima (${qcm})`;
    const y0 = await pg.evaluate('scrollY');
    await gesto(pg, touch, 600); await sleep(pg, 700);
    r['página de atrás bloqueada'] = Math.abs((await pg.evaluate('scrollY')) - y0) < 2 ? 'ok' : 'SE MOVIÓ';
    await tocar(pg, touch, 8, h - 8); await sleep(pg, 400);
    r['tocar fondo no cierra'] = (await pg.evaluate(ABIERTO)) ? 'ok' : 'CERRÓ';
    const tel = await caja(pg, '.cta.tel'), ig = await caja(pg, '.cta.ig');
    r['teléfono 787-920-4410'] = tel && tel.href === 'tel:+17879204410' ? 'ok' : 'MAL';
    r['Instagram @enelmapapr'] = ig && ig.href.includes('instagram.com/enelmapapr') && ig.target === '_blank' ? 'ok' : 'MAL';
    r['Instagram tocable'] = (await quien(pg, ig.x, ig.y)) === 'aviso' ? 'ok' : 'TAPADO';
    await tocar(pg, touch, ig.x, ig.y); await sleep(pg, 1200);
    r['Instagram abre pestaña'] = popups.length ? 'ok' : 'NO ABRE';
    await pg.bringToFront();
    // la X espera 2 s
    await pg.goto(URL + '?lang=es'); await sleep(pg, 1500);
    await gesto(pg, touch, 300); await sleep(pg, 500);
    x = await caja(pg, '.x');
    await tocar(pg, touch, x.x, x.y); await sleep(pg, 300);
    r['X espera 2 s'] = (await pg.evaluate(ABIERTO)) ? 'ok' : 'CERRÓ ANTES';
    await sleep(pg, 2200);
    await tocar(pg, touch, x.x, x.y); await sleep(pg, 800);
    r['X cierra'] = !(await pg.evaluate(ABIERTO)) ? 'ok' : 'NO CIERRA';
    const y1 = await pg.evaluate('scrollY');
    await gesto(pg, touch, 700); await sleep(pg, 900);
    r['página baja después'] = (await pg.evaluate('scrollY')) > y1 + 100 ? 'ok' : 'NO BAJA';
    r['no vuelve a salir'] = !(await pg.evaluate(ABIERTO)) ? 'ok' : 'VOLVIÓ';
    const st = await pg.evaluate(() => { const s = ScrollTrigger.getAll().find(s => s.pin); return [s.start, s.end]; });
    await pg.evaluate((y) => scrollTo(0, y), st[0] + (st[1] - st[0]) / 2); await sleep(pg, 1200);
    const t = await pg.evaluate("Math.round(document.getElementById('placeFig').getBoundingClientRect().top)");
    r['recorrido sigue fijo'] = t === 0 ? 'ok' : `top=${t}`;
    if (!touch) {
      await pg.goto(URL + '?lang=es'); await sleep(pg, 1500);
      await gesto(pg, touch, 300); await sleep(pg, 2800);
      await pg.keyboard.press('Escape'); await sleep(pg, 700);
      r['Esc cierra'] = !(await pg.evaluate(ABIERTO)) ? 'ok' : 'NO';
    }
    await pg.evaluate(() => { window.dispatchEvent(new Event('pagehide')); }); await sleep(pg, 800);
    const ok = posts.filter(q => q['form-name'] === 'enelmapa-estadisticas' && q.sitio === 'colao');
    r['estadísticas se envían'] = ok.length ? 'ok' : `NO (${posts.length})`;
    if (ok.length) { const u = ok[ok.length - 1]; r['estadística vio y cerró'] = u.vio === '1' && u.cerro === '1' ? 'ok' : JSON.stringify(u); }
    const ov = await pg.evaluate('document.documentElement.scrollWidth - innerWidth');
    r['sin desborde'] = ov <= 0 ? 'ok' : ov + 'px';
    const malos = Object.fromEntries(Object.entries(r).filter(([k, v]) => v !== 'ok'));
    fallos += Object.keys(malos).length + errs.length;
    console.log(name.padEnd(7), Object.keys(malos).length || errs.length ? 'FALLAN: ' + JSON.stringify(malos) + ' ' + errs.join(' | ') : `TODO BIEN (${Object.keys(r).length} pruebas)`);
    await ctx.close();
  }
  { // ?yo=1 no cuenta
    const ctx = await b.newContext({ viewport: { width: 1366, height: 768 } }); const pg = await ctx.newPage(); const posts = [];
    await ctx.route('**/*', (route) => route.request().method() === 'POST' ? (posts.push(1), route.fulfill({ status: 200, body: 'ok' })) : route.continue());
    await pg.goto(URL + '?yo=1'); await sleep(pg, 1200);
    await pg.mouse.move(400, 400); await pg.mouse.wheel(0, 300); await sleep(pg, 1500);
    await pg.evaluate(() => window.dispatchEvent(new Event('pagehide'))); await sleep(pg, 600);
    console.log('?yo=1  ', posts.length ? 'CONTÓ MI VISITA' : 'no cuenta mis visitas: ok'); fallos += posts.length ? 1 : 0;
    await ctx.close();
  }
  await b.close();
  console.log('RESULTADO:', fallos ? fallos + ' FALLOS' : 'PASA');
})();
