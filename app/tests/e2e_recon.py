"""Reconnaissance: screenshot every key page and dump DOM structure."""
from playwright.sync_api import sync_playwright
import json, os

BASE = "http://localhost:3000"
OUT = "/d/work/shanghaitrip/app/tests/screenshots"
os.makedirs(OUT, exist_ok=True)

def snap(page, name):
    page.screenshot(path=f"{OUT}/{name}.png", full_page=True)
    print(f"  [SNAP] {name}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})

    # 1. Platform Home
    print("=== Platform Home ===")
    page.goto(BASE)
    page.wait_for_load_state("networkidle")
    snap(page, "01_platform_home")
    # Dump all clickable elements
    cards = page.locator(".city-card, [class*=city], a, button").all()
    print(f"  Found {len(cards)} interactive elements")
    for c in cards[:10]:
        tag = c.evaluate("el => el.tagName + ' | ' + el.className + ' | ' + (el.textContent||'').slice(0,40)")
        print(f"    {tag}")

    # 2. Try each city home page
    cities = ["shanghai", "nanjing", "hangzhou", "xian", "suzhou"]
    for city in cities:
        print(f"\n=== City: {city} ===")
        page.goto(f"{BASE}/city/{city}")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)
        snap(page, f"02_{city}_home")
        btns = page.locator("button").all()
        print(f"  Buttons: {[b.text_content().strip()[:30] for b in btns]}")

    # 3. Try entering Shanghai stage 1
    print("\n=== Shanghai Stage 1 ===")
    page.goto(f"{BASE}/city/shanghai")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(500)
    # Click start button
    start_btns = page.locator("button").all()
    for b in start_btns:
        txt = b.text_content().strip()
        if "开始" in txt or "接受" in txt or "出发" in txt:
            print(f"  Clicking: {txt}")
            b.click()
            break
    page.wait_for_timeout(1000)
    snap(page, "03_shanghai_stage1")
    print(f"  URL: {page.url}")

    # 4. Check stage page structure
    print("\n=== Stage Page DOM ===")
    content = page.content()
    # Look for answer input, hint button, narrative text
    has_input = "input" in content.lower() or "textarea" in content.lower()
    has_hint = "提示" in content or "hint" in content.lower()
    print(f"  Has input: {has_input}")
    print(f"  Has hint reference: {has_hint}")
    all_btns = page.locator("button").all()
    print(f"  Buttons: {[b.text_content().strip()[:30] for b in all_btns]}")
    all_inputs = page.locator("input, textarea").all()
    print(f"  Inputs: {len(all_inputs)}")

    # 5. Try invalid routes
    print("\n=== Edge: Invalid Routes ===")
    for route in ["/city/fakecity", "/city/shanghai/stage/99", "/city/shanghai/finale", "/cross-city-reveal"]:
        page.goto(f"{BASE}{route}")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(300)
        print(f"  {route} => URL: {page.url}")

    # 6. Check localStorage
    print("\n=== LocalStorage ===")
    storage = page.evaluate("() => { const s = {}; for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i); s[k]=localStorage.getItem(k)?.slice(0,80)} return s }")
    for k, v in storage.items():
        print(f"  {k}: {v}")

    browser.close()
    print("\n=== Recon Complete ===")
