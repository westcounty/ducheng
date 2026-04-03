"""Deeper recon: understand actual DOM structure of each page."""
from playwright.sync_api import sync_playwright
import os

BASE = "http://localhost:3000"
OUT = os.path.join(os.path.dirname(__file__), "screenshots")
os.makedirs(OUT, exist_ok=True)

def snap(page, name):
    path = os.path.join(OUT, f"{name}.png")
    page.screenshot(path=path, full_page=True)
    print(f"  [SNAP] {path}")

def dump_dom(page, label):
    """Dump key DOM elements."""
    print(f"\n--- {label} ---")
    print(f"  URL: {page.url}")
    print(f"  Title: {page.title()}")
    # Get root class
    root = page.locator("#app > *").first
    if root.count():
        cls = root.evaluate("el => el.className")
        tag = root.evaluate("el => el.tagName")
        print(f"  Root: <{tag} class='{cls}'>")
    # All visible text blocks
    headings = page.locator("h1, h2, h3, .title, .stage-title, .city-name").all()
    for h in headings[:5]:
        if h.is_visible():
            print(f"  Heading: {h.text_content().strip()[:60]}")
    # All buttons
    btns = page.locator("button").all()
    visible_btns = [b for b in btns if b.is_visible()]
    print(f"  Visible buttons ({len(visible_btns)}):")
    for b in visible_btns:
        txt = b.text_content().strip()[:40]
        cls = b.evaluate("el => el.className")[:40]
        print(f"    [{cls}] {txt}")
    # All links
    links = page.locator("a[href]").all()
    visible_links = [l for l in links if l.is_visible()]
    print(f"  Visible links ({len(visible_links)}):")
    for l in visible_links[:10]:
        href = l.get_attribute("href")
        txt = l.text_content().strip()[:40]
        print(f"    {href} => {txt}")
    # Inputs
    inputs = page.locator("input, textarea, select").all()
    visible_inputs = [i for i in inputs if i.is_visible()]
    print(f"  Visible inputs ({len(visible_inputs)})")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})

    # 1. Platform Home
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_timeout(1000)
    snap(page, "01_home")
    dump_dom(page, "Platform Home /")

    # Scroll down to see more
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(300)
    snap(page, "01_home_bottom")

    # 2. Check what "推开门" does
    print("\n=== Clicking '推开门' ===")
    btn = page.locator("button:has-text('推开门')")
    if btn.count():
        btn.first.click()
        page.wait_for_timeout(1000)
        snap(page, "02_after_push_door")
        dump_dom(page, "After '推开门'")

    # 3. Check all route patterns
    print("\n=== Direct route navigation ===")
    routes = [
        ("/", "root"),
        ("/city/shanghai", "shanghai_home"),
        ("/city/shanghai/stage/1", "shanghai_s1"),
        ("/city/shanghai/transit/1/2", "shanghai_transit"),
        ("/city/shanghai/finale", "shanghai_finale"),
        ("/city/shanghai/archive", "shanghai_archive"),
        ("/city/nanjing", "nanjing_home"),
        ("/city/suzhou", "suzhou_home"),
        ("/city/xian", "xian_home"),
        ("/city/hangzhou", "hangzhou_home"),
    ]
    for route, name in routes:
        page.goto(f"{BASE}{route}", wait_until="networkidle")
        page.wait_for_timeout(500)
        snap(page, f"03_{name}")
        actual = page.url.replace(BASE, "")
        redirected = " (REDIRECTED)" if actual != route else ""
        visible_text = page.locator("body").text_content()[:100].strip().replace("\n", " ")
        print(f"  {route} => {actual}{redirected} | '{visible_text[:60]}...'")

    # 4. Check the app container for theme classes
    print("\n=== Theme classes ===")
    for city in ["shanghai", "nanjing", "hangzhou", "xian", "suzhou"]:
        page.goto(f"{BASE}/city/{city}", wait_until="networkidle")
        page.wait_for_timeout(300)
        app_cls = page.locator(".app-container, #app > div").first.evaluate("el => el.className") if page.locator(".app-container, #app > div").count() else "N/A"
        print(f"  {city}: {app_cls}")

    # 5. Check console errors
    print("\n=== Console errors check ===")
    errors = []
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    for city in ["shanghai", "nanjing", "hangzhou", "xian", "suzhou"]:
        page.goto(f"{BASE}/city/{city}", wait_until="networkidle")
        page.wait_for_timeout(300)
    if errors:
        print(f"  ERRORS FOUND ({len(errors)}):")
        for e in errors[:10]:
            print(f"    {e[:120]}")
    else:
        print("  No console errors")

    browser.close()
    print("\n=== Recon2 Complete ===")
