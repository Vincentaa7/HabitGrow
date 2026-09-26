import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:3000/login")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Fill the 'EMAIL' field with gura3497@gmail.com, fill the 'PASSWORD' field with the provided password, then click the 'Masuk Sekarang' button to submit the login form.
        # nama@email.com email field
        elem = page.get_by_role("textbox", name="nama@email.com")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("gura3497@gmail.com")
        
        # -> Fill the 'EMAIL' field with gura3497@gmail.com, fill the 'PASSWORD' field with the provided password, then click the 'Masuk Sekarang' button to submit the login form.
        # •••••••• password field
        elem = page.get_by_role("textbox", name="••••••••")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("gurarawr@#01")
        
        # -> Fill the 'EMAIL' field with gura3497@gmail.com, fill the 'PASSWORD' field with the provided password, then click the 'Masuk Sekarang' button to submit the login form.
        # Masuk Sekarang button
        elem = page.get_by_role("button", name="Masuk Sekarang")
        await elem.click(timeout=10000)
        
        # -> Click the 'Tandai bersih bersih kamar selesai' button to mark the habit complete and trigger completion feedback.
        # Tandai bersih bersih kamar selesai button
        elem = page.get_by_role("button", name="Tandai bersih bersih kamar")
        await elem.click(timeout=10000)
        
        # -> Click the 'Tandai nonton podcast bermanfaat 1 jam selesai' button to mark that habit complete.
        # Tandai nonton podcast bermanfaat 1 jam selesai button
        elem = page.get_by_role("button", name="Tandai nonton podcast")
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Celebratory completion feedback (banner/emoji) is visible on the dashboard.
        await page.get_by_text("🎉", exact=True).nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The celebratory emoji/banner element is visible on the dashboard.
        await expect(page.get_by_text("🎉", exact=True).nth(0)).to_be_visible(timeout=15000), "The celebratory emoji/banner element is visible on the dashboard."
        
        # --> The habit cards show a completed state (they display '✓ Selesai' and the completion button is disabled).
        # Assert-outcome: passed
        # Assert: The habit card shows the 'Selesai' label indicating completion.
        await expect(page.get_by_role("main").nth(0)).to_contain_text("Selesai", timeout=15000), "The habit card shows the 'Selesai' label indicating completion."
        # Assert-outcome: passed
        # Assert: The habit's completion button is disabled in the DOM after completion.
        await expect(page.get_by_role("button", name="Tandai bersih bersih kamar").nth(0)).to_have_attribute("disabled", "true", timeout=15000), "The habit's completion button is disabled in the DOM after completion."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    