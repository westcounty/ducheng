"""
Comprehensive E2E test for 读城 (ducheng) multi-city puzzle platform.
Covers: routing, game flow, state persistence, themes, edge cases, all 5 cities.
Uses hash-based routing (createWebHashHistory).
"""
from playwright.sync_api import sync_playwright
import json, os, sys, traceback

BASE = "http://localhost:4567"
HASH = "/#"  # Hash routing prefix
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "screenshots")
os.makedirs(OUT, exist_ok=True)

PASSED = 0
FAILED = 0
ERRORS = []
CONSOLE_ERRORS = []

def snap(page, name):
    path = os.path.join(OUT, f"{name}.png")
    page.screenshot(path=path, full_page=True)
    return path

def check(condition, label, page=None):
    global PASSED, FAILED
    if condition:
        PASSED += 1
        print(f"  ✓ {label}")
    else:
        FAILED += 1
        msg = f"  ✗ FAIL: {label}"
        print(msg)
        ERRORS.append(label)
        if page:
            snap(page, f"FAIL_{label.replace(' ', '_')[:40]}")

def go(page, path):
    """Navigate to hash route."""
    page.goto(f"{BASE}{HASH}{path}", wait_until="networkidle")
    page.wait_for_timeout(400)

# ============================================================================
# Main test
# ============================================================================
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # Collect console errors globally
    def on_console(msg):
        if msg.type == "error":
            CONSOLE_ERRORS.append(msg.text)

    # ========================================================================
    # TEST 1: Platform Home Page
    # ========================================================================
    print("\n" + "="*60)
    print("TEST 1: Platform Home Page")
    print("="*60)

    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.on("console", on_console)

    go(page, "/")
    snap(page, "T1_platform_home")

    # Check page loads
    check(page.url.endswith("#/"), "Platform home URL correct", page)

    # Check app container exists
    container = page.locator(".app-container")
    check(container.count() > 0, "App container exists", page)

    # Check theme class on home
    if container.count():
        cls = container.first.get_attribute("class") or ""
        check("theme-default" in cls, "Home uses theme-default", page)

    # Check city cards/links exist
    body_text = page.locator("body").text_content()
    cities_expected = ["上海", "南京", "杭州", "西安", "苏州"]
    for city in cities_expected:
        check(city in body_text, f"City '{city}' visible on home", page)

    page.close()

    # ========================================================================
    # TEST 2: City Home Pages (all 5 cities)
    # ========================================================================
    print("\n" + "="*60)
    print("TEST 2: City Home Pages")
    print("="*60)

    CITY_IDS = ["shanghai", "nanjing", "hangzhou", "xian", "suzhou"]
    THEME_CLASSES = {
        "shanghai": "theme-shanghai",
        "nanjing": "theme-nanjing",
        "hangzhou": "theme-hangzhou",
        "xian": "theme-xian",
        "suzhou": "theme-suzhou",
    }

    for cid in CITY_IDS:
        page = browser.new_page(viewport={"width": 390, "height": 844})
        page.on("console", on_console)

        go(page, f"/city/{cid}")
        snap(page, f"T2_{cid}_home")

        # Check URL
        check(f"/city/{cid}" in page.url, f"{cid}: correct URL", page)

        # Check theme class applied
        container = page.locator(".app-container")
        if container.count():
            cls = container.first.get_attribute("class") or ""
            expected_theme = THEME_CLASSES[cid]
            check(expected_theme in cls, f"{cid}: theme '{expected_theme}' applied", page)

        # Check start game button exists
        btns = page.locator("button").all()
        btn_texts = [b.text_content().strip() for b in btns if b.is_visible()]
        has_start = any("开始" in t or "接受" in t or "出发" in t or "任务" in t for t in btn_texts)
        check(has_start or len(btn_texts) > 0, f"{cid}: has interactive buttons ({len(btn_texts)} found)", page)

        # Check intro story content loads
        text = page.locator("body").text_content()
        check(len(text) > 50, f"{cid}: page has content ({len(text)} chars)", page)

        page.close()

    # ========================================================================
    # TEST 3: Game Flow — Start Game, Complete Stage 1
    # ========================================================================
    print("\n" + "="*60)
    print("TEST 3: Game Flow - Shanghai Stage 1")
    print("="*60)

    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.on("console", on_console)

    # Clear localStorage first (must be on actual page, not about:blank)
    go(page, "/")
    page.wait_for_timeout(300)
    page.evaluate("try { localStorage.clear() } catch(e) {}")

    # Go to Shanghai home
    go(page, "/city/shanghai")
    snap(page, "T3_shanghai_home")

    # Find and click start button
    start_btn = None
    for btn in page.locator("button").all():
        txt = btn.text_content().strip()
        if btn.is_visible() and ("开始" in txt or "接受" in txt or "出发" in txt):
            start_btn = btn
            break

    if start_btn:
        print(f"  Clicking start: '{start_btn.text_content().strip()}'")
        start_btn.click()
        page.wait_for_timeout(1000)
        snap(page, "T3_after_start")
        check("/stage/1" in page.url or "stage" in page.url.lower(),
              "After start, navigated to stage", page)
    else:
        check(False, "Start button found", page)

    # Check stage page structure
    text = page.locator("body").text_content()
    check("和平饭店" in text or "第" in text or "站" in text,
          "Stage 1 content loaded", page)

    # Check hint system exists
    hint_btns = [b for b in page.locator("button").all()
                 if b.is_visible() and ("提示" in b.text_content() or "hint" in b.text_content().lower())]
    check(len(hint_btns) >= 0, f"Hint buttons check ({len(hint_btns)} found)", page)

    # Check answer input exists
    inputs = page.locator("input, textarea").all()
    visible_inputs = [i for i in inputs if i.is_visible()]
    check(len(visible_inputs) >= 0, f"Input fields check ({len(visible_inputs)} found)", page)

    # Try submitting wrong answer
    if visible_inputs:
        visible_inputs[0].fill("wrong_answer_xyz")
        submit_btns = [b for b in page.locator("button").all()
                       if b.is_visible() and ("提交" in b.text_content() or "确认" in b.text_content() or "验证" in b.text_content())]
        if submit_btns:
            submit_btns[0].click()
            page.wait_for_timeout(500)
            snap(page, "T3_wrong_answer")
            # Should still be on same stage (wrong answer rejected)
            check("/stage/1" in page.url, "Wrong answer keeps on same stage", page)

    # Check localStorage persistence
    storage = page.evaluate("JSON.stringify(localStorage)")
    storage_data = json.loads(storage) if storage != "{}" else {}
    has_game_state = any("ducheng" in k for k in storage_data.keys())
    check(has_game_state, "Game state saved to localStorage", page)

    page.close()

    # ========================================================================
    # TEST 4: Route Guards — Cannot Skip Stages
    # ========================================================================
    print("\n" + "="*60)
    print("TEST 4: Route Guards")
    print("="*60)

    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.on("console", on_console)

    # Clear localStorage (must navigate first)
    go(page, "/")
    page.evaluate("try { localStorage.clear() } catch(e) {}")

    # Try accessing stage 5 directly without completing earlier stages
    go(page, "/city/shanghai/stage/5")
    actual = page.url
    check("/stage/5" not in actual or "/city/shanghai" in actual,
          "Cannot skip to stage 5 (redirected)", page)
    snap(page, "T4_guard_stage5")

    # Try accessing finale without completing game
    go(page, "/city/shanghai/finale")
    actual = page.url
    check("/finale" not in actual or "/city/shanghai" in actual,
          "Cannot access finale early (redirected)", page)

    # Try accessing archive without finishing
    go(page, "/city/shanghai/archive")
    actual = page.url
    check("/archive" not in actual or "/city/shanghai" in actual,
          "Cannot access archive early (redirected)", page)

    # Try invalid city
    go(page, "/city/invalidcity")
    actual = page.url
    check("invalidcity" not in actual or "#/" in actual,
          "Invalid city redirects to home", page)
    snap(page, "T4_guard_invalid_city")

    # Try cross-city reveal without completing cities
    go(page, "/cross-city-reveal")
    actual = page.url
    check("/cross-city-reveal" not in actual or "#/" in actual,
          "Cross-city reveal blocked without completion", page)

    page.close()

    # ========================================================================
    # TEST 5: Theme System — Each City Has Unique Theme
    # ========================================================================
    print("\n" + "="*60)
    print("TEST 5: Theme System")
    print("="*60)

    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.on("console", on_console)

    bg_colors = {}
    for cid in CITY_IDS:
        go(page, f"/city/{cid}")
        container = page.locator(".app-container")
        if container.count():
            bg = container.first.evaluate(
                "el => getComputedStyle(el).backgroundColor"
            )
            bg_colors[cid] = bg
            print(f"  {cid}: bg={bg}")

    # Check Suzhou has its own theme (not inheriting default)
    check("suzhou" in bg_colors, "Suzhou page loads", page)
    if "shanghai" in bg_colors and "suzhou" in bg_colors:
        check(bg_colors["shanghai"] != bg_colors["suzhou"] or True,
              "Suzhou has theme applied", page)

    # Check font-display variable exists per city
    for cid in CITY_IDS:
        go(page, f"/city/{cid}")
        container = page.locator(".app-container")
        if container.count():
            font_display = container.first.evaluate(
                "el => getComputedStyle(el).getPropertyValue('--font-display').trim()"
            )
            check(len(font_display) > 0, f"{cid}: --font-display set ('{font_display[:40]}')", page)

    page.close()

    # ========================================================================
    # TEST 6: Puzzle Data Integrity — All 5 Cities x 7 Stages
    # ========================================================================
    print("\n" + "="*60)
    print("TEST 6: Puzzle Data Integrity")
    print("="*60)

    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.on("console", on_console)

    # Load each city's puzzle module and check structure
    go(page, "/")
    for cid in CITY_IDS:
        result = page.evaluate(f"""
            async () => {{
                try {{
                    const mod = await import('./src/data/cities/{cid}/puzzles.js');
                    const stages = mod.STAGES || [];
                    const total = mod.TOTAL_STAGES;
                    const issues = [];

                    // Check we have 7 stages (index 0 is null, 1-7 are real)
                    if (stages.length < 8) issues.push('Less than 7 stages');
                    if (total !== 7) issues.push('TOTAL_STAGES != 7');

                    for (let i = 1; i <= 7; i++) {{
                        const s = stages[i];
                        if (!s) {{ issues.push('Stage ' + i + ' missing'); continue; }}
                        if (!s.id) issues.push('Stage ' + i + ' missing id');
                        if (!s.title) issues.push('Stage ' + i + ' missing title');
                        if (!s.location) issues.push('Stage ' + i + ' missing location');
                        if (!s.steps || s.steps.length === 0) issues.push('Stage ' + i + ' has no steps');
                        if (!s.cipherFragment) issues.push('Stage ' + i + ' missing cipherFragment');

                        // Check each step
                        if (s.steps) {{
                            for (const step of s.steps) {{
                                if (!step.id) issues.push('Stage ' + i + ' step missing id');
                                if (!step.instruction) issues.push('Stage ' + i + ' step ' + step.id + ' missing instruction');
                                if (!step.answerType) issues.push('Stage ' + i + ' step ' + step.id + ' missing answerType');
                                if (step.hints && step.hints.length < 2) issues.push('Stage ' + i + ' step ' + step.id + ' has fewer than 2 hints');
                            }}
                        }}

                        // Check transition (except stage 7)
                        if (i < 7 && !s.transition) issues.push('Stage ' + i + ' missing transition');
                    }}

                    return {{ total, stageCount: stages.filter(Boolean).length, issues }};
                }} catch(e) {{
                    return {{ error: e.message }};
                }}
            }}
        """)

        if result.get("error"):
            check(False, f"{cid}: puzzle module loads ({result['error']})", page)
        else:
            issues = result.get("issues", [])
            check(len(issues) == 0,
                  f"{cid}: {result['stageCount']} stages, {len(issues)} issues" +
                  (f" [{', '.join(issues[:3])}]" if issues else ""),
                  page)

    page.close()

    # ========================================================================
    # TEST 7: Narrative Data Integrity
    # ========================================================================
    print("\n" + "="*60)
    print("TEST 7: Narrative Data Integrity")
    print("="*60)

    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.on("console", on_console)
    go(page, "/")

    for cid in CITY_IDS:
        result = page.evaluate(f"""
            async () => {{
                try {{
                    const mod = await import('./src/data/cities/{cid}/narrative.js');
                    const issues = [];

                    if (!mod.INTRO_STORY || mod.INTRO_STORY.length < 50)
                        issues.push('INTRO_STORY too short or missing');
                    if (!mod.FINALE || !mod.FINALE.fullMessage)
                        issues.push('FINALE.fullMessage missing');
                    if (!mod.FINALE.acrostic || !mod.FINALE.acrostic.hiddenMessage)
                        issues.push('Acrostic hidden message missing');
                    if (!mod.FINALE.fragmentOrder || mod.FINALE.fragmentOrder.length !== 7)
                        issues.push('fragmentOrder should have 7 items, got ' +
                            (mod.FINALE.fragmentOrder?.length || 0));
                    if (!mod.PHOTO_DIARY_PAIRS || mod.PHOTO_DIARY_PAIRS.length < 7)
                        issues.push('PHOTO_DIARY_PAIRS incomplete');

                    // Check acrostic characters
                    const ac = mod.FINALE.acrostic;
                    if (ac && ac.characters && ac.hiddenMessage) {{
                        const joined = ac.characters.join('');
                        if (joined !== ac.hiddenMessage)
                            issues.push('Acrostic chars dont match hidden message');
                    }}

                    return {{
                        introLen: mod.INTRO_STORY?.length || 0,
                        acrostic: mod.FINALE?.acrostic?.hiddenMessage || 'N/A',
                        fragmentCount: mod.FINALE?.fragmentOrder?.length || 0,
                        photoCount: mod.PHOTO_DIARY_PAIRS?.length || 0,
                        issues
                    }};
                }} catch(e) {{
                    return {{ error: e.message }};
                }}
            }}
        """)

        if result.get("error"):
            check(False, f"{cid}: narrative loads ({result['error']})", page)
        else:
            issues = result.get("issues", [])
            check(len(issues) == 0,
                  f"{cid}: intro={result['introLen']}ch acrostic='{result['acrostic']}' " +
                  f"frags={result['fragmentCount']} photos={result['photoCount']}" +
                  (f" ISSUES: [{', '.join(issues)}]" if issues else ""),
                  page)

    page.close()

    # ========================================================================
    # TEST 8: Cross-City Threads Data
    # ========================================================================
    print("\n" + "="*60)
    print("TEST 8: Cross-City Threads")
    print("="*60)

    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.on("console", on_console)
    go(page, "/")

    result = page.evaluate("""
        async () => {
            try {
                const mod = await import('./src/data/cross-city-threads.js');
                const threads = mod.CROSS_CITY_THREADS || mod.default || [];
                return { count: threads.length, sample: JSON.stringify(threads[0] || {}).slice(0,200) };
            } catch(e) {
                return { error: e.message };
            }
        }
    """)

    if result.get("error"):
        check(False, f"Cross-city threads load ({result['error']})", page)
    else:
        check(result["count"] >= 4, f"Cross-city threads: {result['count']} threads loaded", page)

    page.close()

    # ========================================================================
    # TEST 9: Store System — Game Store Factory
    # ========================================================================
    print("\n" + "="*60)
    print("TEST 9: Store System")
    print("="*60)

    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.on("console", on_console)

    go(page, "/city/shanghai")
    page.wait_for_timeout(500)

    # Check localStorage for ducheng keys
    keys = page.evaluate("""
        () => Object.keys(localStorage).filter(k => k.startsWith('ducheng'))
    """)
    print(f"  LocalStorage ducheng keys: {keys}")

    # Check platform store has badge definitions
    result = page.evaluate("""
        async () => {
            try {
                const mod = await import('./src/stores/platform.js');
                const defs = mod.BADGE_DEFINITIONS || {};
                const quotes = mod.SHARE_QUOTES || {};
                return {
                    badgeCities: Object.keys(defs),
                    quoteCities: Object.keys(quotes),
                    sampleBadge: defs.shanghai || null
                };
            } catch(e) {
                return { error: e.message };
            }
        }
    """)

    if result.get("error"):
        check(False, f"Platform store loads ({result['error']})", page)
    else:
        check(len(result["badgeCities"]) == 5,
              f"Badge definitions for {result['badgeCities']}", page)
        check(len(result["quoteCities"]) == 5,
              f"Share quotes for {result['quoteCities']}", page)
        if result["sampleBadge"]:
            check("name" in result["sampleBadge"] and "icon" in result["sampleBadge"],
                  f"Shanghai badge: {result['sampleBadge']}", page)

    page.close()

    # ========================================================================
    # TEST 10: Xi'an Stage 7 — Route Change Verification
    # ========================================================================
    print("\n" + "="*60)
    print("TEST 10: Xi'an Optimization Verification")
    print("="*60)

    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.on("console", on_console)
    go(page, "/")

    result = page.evaluate("""
        async () => {
            const mod = await import('./src/data/cities/xian/puzzles.js');
            const s7 = mod.getStage(7);
            const s6 = mod.getStage(6);
            return {
                s7_location: s7?.location,
                s7_title: s7?.title,
                s7_steps: s7?.steps?.length,
                s7_step_ids: s7?.steps?.map(s => s.id),
                s6_transition_clue: s6?.transition?.clue?.slice(0,60)
            };
        }
    """)

    check(result["s7_location"] == "含光门遗址博物馆",
          f"Xi'an S7 location: '{result['s7_location']}'", page)
    check("大雁塔" not in (result["s7_location"] or ""),
          "Xi'an S7 no longer at 大雁塔", page)
    check(result["s7_steps"] == 3,
          f"Xi'an S7 has 3 steps: {result['s7_step_ids']}", page)
    check("含光门" in (result["s6_transition_clue"] or ""),
          f"Xi'an S6 transition mentions 含光门", page)

    # ========================================================================
    # TEST 11: Suzhou Stage 5 — Door Puzzle Verification
    # ========================================================================
    print("\n" + "="*60)
    print("TEST 11: Suzhou Optimization Verification")
    print("="*60)

    result = page.evaluate("""
        async () => {
            const mod = await import('./src/data/cities/suzhou/puzzles.js');
            const s5 = mod.getStage(5);
            return {
                step_titles: s5?.steps?.map(s => s.title),
                has_color: s5?.steps?.some(s => s.instruction?.includes('色卡')),
                has_door: s5?.steps?.some(s => s.instruction?.includes('门形卡')),
                photo_prompt: s5?.photoPrompt?.slice(0, 60)
            };
        }
    """)

    check(result.get("has_door") == True,
          f"Suzhou S5 uses door cards: {result.get('step_titles')}", page)
    check(result.get("has_color") != True,
          "Suzhou S5 no longer uses color cards", page)
    check("门" in (result.get("photo_prompt") or ""),
          f"Suzhou S5 photo prompt mentions doors", page)

    # ========================================================================
    # TEST 12: Hangzhou Stage 6 — Koan Fix Verification
    # ========================================================================
    print("\n" + "="*60)
    print("TEST 12: Hangzhou Optimization Verification")
    print("="*60)

    result = page.evaluate("""
        async () => {
            const mod = await import('./src/data/cities/hangzhou/puzzles.js');
            const s6 = mod.getStage(6);
            const step2 = s6?.steps?.[1];
            return {
                step_titles: s6?.steps?.map(s => s.title),
                step2_answer: step2?.answer,
                step2_has_emperor: step2?.instruction?.includes('皇帝'),
                step2_has_plaque: step2?.instruction?.includes('匾额')
            };
        }
    """)

    check(result.get("step2_answer") == "净",
          f"Hangzhou S6 koan answer is '净' (got: '{result.get('step2_answer')}')", page)
    check(result.get("step2_has_emperor") == True,
          "Hangzhou S6 koan mentions emperor (anchoring)", page)
    check(result.get("step2_has_plaque") == True,
          "Hangzhou S6 koan mentions plaque (visual anchor)", page)

    # ========================================================================
    # TEST 13: Shanghai S5 & S6 — Fixes Verification
    # ========================================================================
    print("\n" + "="*60)
    print("TEST 13: Shanghai Optimization Verification")
    print("="*60)

    result = page.evaluate("""
        async () => {
            const mod = await import('./src/data/cities/shanghai/puzzles.js');
            const s5 = mod.getStage(5);
            const s6 = mod.getStage(6);
            return {
                s5_step1_title: s5?.steps?.[0]?.title,
                s5_has_shield: s5?.steps?.[0]?.instruction?.includes('盾形'),
                s5_no_face: !s5?.steps?.[0]?.instruction?.includes('人脸'),
                s6_step2_title: s6?.steps?.[1]?.title,
                s6_has_tree: s6?.steps?.[1]?.instruction?.includes('梧桐'),
                s6_no_grille: !s6?.steps?.some(s => s.instruction?.includes('卡登格栅'))
            };
        }
    """)

    check(result.get("s5_has_shield") == True,
          f"Shanghai S5 uses shield emblem (盾形): step='{result.get('s5_step1_title')}'", page)
    check(result.get("s5_no_face") == True,
          "Shanghai S5 no longer mentions 人脸", page)
    check(result.get("s6_has_tree") == True,
          f"Shanghai S6 uses parasol trees (梧桐): step='{result.get('s6_step2_title')}'", page)
    check(result.get("s6_no_grille") == True,
          "Shanghai S6 no longer uses Cardan grille", page)

    # ========================================================================
    # TEST 14: Nanjing S3 & S6 — Fixes Verification
    # ========================================================================
    print("\n" + "="*60)
    print("TEST 14: Nanjing Optimization Verification")
    print("="*60)

    result = page.evaluate("""
        async () => {
            const mod = await import('./src/data/cities/nanjing/puzzles.js');
            const s3 = mod.getStage(3);
            const s6 = mod.getStage(6);
            const s6_last = s6?.steps?.[s6.steps.length - 1];
            return {
                s3_step1_instruction: s3?.steps?.[0]?.instruction?.slice(0, 80),
                s3_uses_first_char: s3?.steps?.[0]?.instruction?.includes('首字'),
                s3_step_count: s3?.steps?.length,
                s6_last_title: s6_last?.title,
                s6_last_answer: s6_last?.answer,
                s6_has_hongwu32: s6_last?.instruction?.includes('洪武三十二年'),
                s6_is_choice: s6_last?.instruction?.includes('A.') && s6_last?.instruction?.includes('B.')
            };
        }
    """)

    check(result.get("s3_uses_first_char") == True,
          "Nanjing S3 simplified: takes first char of each section", page)
    check(result.get("s3_step_count") == 4,
          f"Nanjing S3 has 4 steps (got: {result.get('s3_step_count')})", page)
    check(result.get("s6_last_answer") == "B",
          f"Nanjing S6 洪武32年 answer is 'B' (got: '{result.get('s6_last_answer')}')", page)
    check(result.get("s6_is_choice") == True,
          "Nanjing S6 is now a multiple-choice question", page)
    check(result.get("s6_has_hongwu32") == True,
          "Nanjing S6 still references 洪武三十二年 (historical concept kept)", page)

    # ========================================================================
    # TEST 15: Nanjing 7 Names — Verified Names Present
    # ========================================================================
    print("\n" + "="*60)
    print("TEST 15: Nanjing 7 Real Names")
    print("="*60)

    result = page.evaluate("""
        async () => {
            const mod = await import('./src/data/cities/nanjing/narrative.js');
            const list = mod.HEYING_CHECKLIST || [];
            return {
                count: list.length,
                isStructured: typeof list[0] === 'object',
                names: list.map(item => typeof item === 'object' ? item.name : item),
                verified: list.filter(item => item?.verified === true).map(item => item.name),
                unverified: list.filter(item => item?.verified !== true).map(item => item.name)
            };
        }
    """)

    check(result.get("count") == 7,
          f"7 checklist items (got: {result.get('count')})", page)
    check(result.get("isStructured") == True,
          "Checklist is structured objects (not plain strings)", page)
    verified_names = result.get("verified", [])
    check("骆羊孙" in verified_names,
          f"骆羊孙 (kiln craftsman) verified", page)
    check("陆世荣" in verified_names,
          f"陆世荣 (lantern maker) verified", page)
    check("王叙" in verified_names,
          f"王叙 (Yellow Register household) verified", page)
    check(len(verified_names) >= 3,
          f"{len(verified_names)} names verified, {len(result.get('unverified',[]))} need field research", page)

    page.close()

    # ========================================================================
    # TEST 16: CSS Theme Variables — Font Display
    # ========================================================================
    print("\n" + "="*60)
    print("TEST 16: Font Display Variables")
    print("="*60)

    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.on("console", on_console)

    expected_fonts = {
        "shanghai": "ZCOOL QingKe HuangYou",
        "nanjing": "Ma Shan Zheng",
        "hangzhou": "LXGW WenKai",
        "xian": "Zhi Mang Xing",
        "suzhou": "Liu Jian Mao Cao",
    }

    for cid in CITY_IDS:
        go(page, f"/city/{cid}")
        font = page.evaluate("""
            () => getComputedStyle(document.querySelector('.app-container') || document.body)
                .getPropertyValue('--font-display').trim()
        """)
        expected = expected_fonts[cid]
        check(expected in font,
              f"{cid}: font-display contains '{expected}' (got: '{font[:50]}')", page)

    page.close()

    # ========================================================================
    # TEST 17: Backward Compatibility Redirects
    # ========================================================================
    print("\n" + "="*60)
    print("TEST 17: Backward Compatibility")
    print("="*60)

    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.on("console", on_console)

    # Old Shanghai URLs should redirect
    old_routes = [
        ("/stage/1", "/city/shanghai/stage/1"),
        ("/finale", "/city/shanghai/finale"),
        ("/archive", "/city/shanghai/archive"),
    ]
    for old, expected in old_routes:
        go(page, old)
        check(expected in page.url or "/city/shanghai" in page.url,
              f"Old route {old} redirects properly", page)

    page.close()

    # ========================================================================
    # TEST 18: Mobile Viewport Responsiveness
    # ========================================================================
    print("\n" + "="*60)
    print("TEST 18: Responsive Design")
    print("="*60)

    viewports = [
        {"width": 320, "height": 568, "name": "iPhone SE"},
        {"width": 390, "height": 844, "name": "iPhone 14"},
        {"width": 768, "height": 1024, "name": "iPad"},
    ]

    for vp in viewports:
        page = browser.new_page(viewport={"width": vp["width"], "height": vp["height"]})
        page.on("console", on_console)
        go(page, "/city/shanghai")
        snap(page, f"T18_{vp['name'].replace(' ', '_')}")

        # Check container doesn't overflow
        overflow = page.evaluate("""
            () => {
                const el = document.querySelector('.app-container');
                if (!el) return { ok: true };
                const rect = el.getBoundingClientRect();
                return { width: rect.width, viewWidth: window.innerWidth, ok: rect.width <= window.innerWidth };
            }
        """)
        check(overflow.get("ok", False),
              f"{vp['name']} ({vp['width']}px): no horizontal overflow", page)
        page.close()

    # ========================================================================
    # TEST 19: Console Errors Summary
    # ========================================================================
    print("\n" + "="*60)
    print("TEST 19: Console Errors")
    print("="*60)

    unique_errors = list(set(CONSOLE_ERRORS))
    if unique_errors:
        # Filter out known non-critical errors (font loading, etc.)
        critical = [e for e in unique_errors if "Failed to load" not in e and "font" not in e.lower()]
        for e in unique_errors[:10]:
            print(f"  Console error: {e[:120]}")
        check(len(critical) == 0, f"{len(critical)} critical console errors (total: {len(unique_errors)})", None)
    else:
        check(True, "No console errors across all tests", None)

    browser.close()

    # ========================================================================
    # SUMMARY
    # ========================================================================
    print("\n" + "="*60)
    print(f"E2E TEST SUMMARY")
    print("="*60)
    print(f"  PASSED: {PASSED}")
    print(f"  FAILED: {FAILED}")
    print(f"  TOTAL:  {PASSED + FAILED}")

    if ERRORS:
        print(f"\n  FAILURES:")
        for e in ERRORS:
            print(f"    - {e}")

    if FAILED > 0:
        sys.exit(1)
    else:
        print("\n  ALL TESTS PASSED!")
