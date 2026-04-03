"""Quick verification test: confirm Home.vue bug fix and all key optimizations."""
from playwright.sync_api import sync_playwright
import os

BASE = "http://localhost:4590"
HASH = "/#"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "screenshots")
os.makedirs(OUT, exist_ok=True)

PASSED = FAILED = 0
ERRORS = []

def check(cond, label, page=None):
    global PASSED, FAILED
    if cond:
        PASSED += 1; print(f"  ✓ {label}")
    else:
        FAILED += 1; ERRORS.append(label); print(f"  ✗ FAIL: {label}")
        if page: page.screenshot(path=os.path.join(OUT, f"VFAIL_{label[:30].replace(' ','_')}.png"), full_page=True)

def go(page, path):
    page.goto(f"{BASE}{HASH}{path}", wait_until="networkidle")
    page.wait_for_timeout(400)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # ── FIX VERIFY: Home.vue shows correct city title ──
    print("\n=== Home.vue Dynamic Title Fix ===")
    expected_titles = {
        "shanghai": ("第七封密电", "上海"),
        "nanjing":  ("金陵刻痕",  "南京"),
        "hangzhou": ("断桥不断",  "杭州"),
        "xian":     ("长安译",    "西安"),
        "suzhou":   ("姑苏折子",  "苏州"),
    }
    for cid, (title, city_name) in expected_titles.items():
        page = browser.new_page(viewport={"width": 390, "height": 844})
        go(page, f"/city/{cid}")
        page.screenshot(path=os.path.join(OUT, f"VF_{cid}_home.png"), full_page=True)
        text = page.locator("body").text_content()
        check(title in text, f"{cid}: title '{title}' shown", page)
        check(city_name in text, f"{cid}: city name '{city_name}' shown", page)

        # Check text-display class used for title
        h1 = page.locator("h1")
        if h1.count():
            cls = h1.first.get_attribute("class") or ""
            check("text-display" in cls, f"{cid}: h1 uses text-display class", page)
        page.close()

    # ── Suzhou theme verification ──
    print("\n=== Suzhou Theme ===")
    page = browser.new_page(viewport={"width": 390, "height": 844})
    go(page, "/city/suzhou")
    container = page.locator(".app-container")
    bg = container.first.evaluate("el => getComputedStyle(el).backgroundColor")
    accent = container.first.evaluate("el => getComputedStyle(el).getPropertyValue('--accent').trim()")
    check("248, 245, 240" in bg, f"Suzhou bg is #f8f5f0 (宣纸白): {bg}", page)
    check(accent == "#4a6fa5", f"Suzhou accent is indigo #4a6fa5: {accent}", page)
    page.close()

    # ── All puzzle data loads without errors ──
    print("\n=== Puzzle Data Integrity (all 5 cities) ===")
    page = browser.new_page(viewport={"width": 390, "height": 844})
    go(page, "/")
    for cid in ["shanghai", "nanjing", "hangzhou", "xian", "suzhou"]:
        result = page.evaluate(f"""
            async () => {{
                try {{
                    const puz = await import('./src/data/cities/{cid}/puzzles.js');
                    const nar = await import('./src/data/cities/{cid}/narrative.js');
                    const issues = [];
                    for (let i = 1; i <= 7; i++) {{
                        const s = puz.STAGES[i];
                        if (!s) issues.push('S'+i+' missing');
                        else if (!s.steps?.length) issues.push('S'+i+' no steps');
                    }}
                    if (!nar.FINALE?.fullMessage) issues.push('no finale message');
                    if (nar.FINALE?.fragmentOrder?.length !== 7) issues.push('fragments != 7');
                    return {{ ok: issues.length === 0, issues }};
                }} catch(e) {{ return {{ ok: false, issues: [e.message] }}; }}
            }}
        """)
        check(result["ok"], f"{cid}: all data OK" + (f" ({result['issues']})" if not result["ok"] else ""), page)
    page.close()

    # ── Badge & Share data ──
    print("\n=== Badge & Share System ===")
    page = browser.new_page(viewport={"width": 390, "height": 844})
    go(page, "/")
    result = page.evaluate("""
        async () => {
            const mod = await import('./src/stores/platform.js');
            return {
                badges: Object.keys(mod.BADGE_DEFINITIONS),
                quotes: Object.keys(mod.SHARE_QUOTES),
                shanghaiIcon: mod.BADGE_DEFINITIONS.shanghai?.icon,
                suzhouColor: mod.BADGE_DEFINITIONS.suzhou?.color,
            };
        }
    """)
    check(len(result["badges"]) == 5, f"5 badge defs: {result['badges']}", page)
    check(len(result["quotes"]) == 5, f"5 share quotes: {result['quotes']}", page)
    check(result["shanghaiIcon"] == "密", f"Shanghai badge icon: {result['shanghaiIcon']}", page)
    check(result["suzhouColor"] == "#4a6fa5", f"Suzhou badge color: {result['suzhouColor']}", page)
    page.close()

    browser.close()

    print(f"\n{'='*50}")
    print(f"VERIFICATION: {PASSED} passed, {FAILED} failed")
    if ERRORS:
        for e in ERRORS: print(f"  ✗ {e}")
    else:
        print("  ALL CHECKS PASSED!")
