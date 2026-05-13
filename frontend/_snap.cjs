const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    defaultViewport: {width:1400, height:900, deviceScaleFactor: 1.6},
    args:['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await page.evaluate(async () => {
    const r = await fetch('/api/login', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:'test@test.com', password:'test123'})});
    const d = await r.json();
    localStorage.setItem('token', d.access_token);
    localStorage.setItem('finance-auth', JSON.stringify({ state: { token: d.access_token, user: { email: 'test@test.com' } }, version: 0 }));
  });
  await page.goto('http://localhost:3000/reports', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2200));
  await page.screenshot({ path: 'C:/Users/HP/AppData/Local/Temp/finance-tracker-shots/rail-centered.png', clip: { x: 0, y: 200, width: 360, height: 300 } });
  await browser.close();
  console.log('done');
})();
