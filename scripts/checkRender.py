# Проверка в настоящем браузере (Chromium): обрезка текста и тесные места. Нужен Playwright.
# npx tsx scripts/dumpBlocks.ts > /tmp/blocks.json && python3 scripts/checkRender.py /tmp/blocks.json [shots_dir]
import json,sys,os
from playwright.sync_api import sync_playwright
W={'desktop':1440,'tablet':768,'mobile':390}
CSS="""*{box-sizing:border-box}body{margin:0;background:#fff}.blk{position:relative;background:#fff;overflow:hidden}
.el{position:absolute;display:flex;align-items:center;white-space:pre-wrap;overflow:hidden;box-sizing:border-box;font:500 16px/1.3 Inter,system-ui,sans-serif;color:#0F172A}
.el.rect{border:1.5px solid #1E293B;background:rgba(255,255,255,.6);padding:10px;align-items:flex-start}
.el.img{border:1.5px dashed #64748B;background:#E2E8F0;padding:10px;align-items:center;justify-content:center;text-align:center}
.el.btn{border-radius:8px;background:#0F172A;color:#fff;justify-content:center;font-weight:600}
.el.input{border:1.5px solid #94A3B8;border-radius:6px;padding:0 12px;color:#64748B;background:#fff}"""
def html(b,d):
    p=[]
    for e in b['els'][d]:
        st=f"left:{e['x']}px;top:{e['y']}px;width:{e['w']}px;height:{e['h']}px;"
        if e.get('fs'):st+=f"font-size:{e['fs']}px;"
        if e.get('b'):st+="font-weight:700;"
        al=e.get('al')
        if al=='c':st+="justify-content:center;text-align:center;"
        if al=='r':st+="justify-content:flex-end;text-align:right;"
        t=(e.get('text') or '').replace('&','&amp;').replace('<','&lt;')
        p.append(f'<div class="el {e["t"]}" style="{st}">{t}</div>')
    return f'<div class="blk" style="width:{W[d]}px;height:{b["h"][d]}px">{"".join(p)}</div>'
JS="""()=>[...document.querySelectorAll('.el')].filter(e=>!e.classList.contains('img')&&e.textContent.trim()&&(e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1)).map(e=>e.textContent.trim().slice(0,28)+' ('+e.clientWidth+'x'+e.clientHeight+' < '+e.scrollWidth+'x'+e.scrollHeight+')')"""
blocks=json.load(open(sys.argv[1]));shots=sys.argv[2] if len(sys.argv)>2 else None
if shots:os.makedirs(shots,exist_ok=True)
bad=0;rep=[]
with sync_playwright() as p:
    br=p.chromium.launch();pg=br.new_page()
    for b in blocks:
        for d in W:
            pg.set_viewport_size({'width':W[d],'height':800});pg.set_content(f'<style>{CSS}</style>'+html(b,d));pg.evaluate('document.fonts.ready')
            r=pg.evaluate(JS)
            if r:bad+=1;rep.append(f"{b['name']} [{d}]: "+'; '.join(r[:3]))
            if shots:pg.locator('.blk').screenshot(path=os.path.join(shots,f"{b['name'].replace('/','_').replace(':','')}_{d}.png"))
    br.close()
print(f'блоков: {len(blocks)}, макетов с обрезкой: {bad}');print('\n'.join(rep))
