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
        
        # -> Fill the 'EMAIL' field with gura3497@gmail.com, fill the 'PASSWORD' field with gurarawr@#01, then click the 'Masuk Sekarang' button to submit the login form.
        # nama@email.com email field
        elem = page.get_by_role("textbox", name="nama@email.com")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("gura3497@gmail.com")
        
        # -> Fill the 'EMAIL' field with gura3497@gmail.com, fill the 'PASSWORD' field with gurarawr@#01, then click the 'Masuk Sekarang' button to submit the login form.
        # •••••••• password field
        elem = page.get_by_role("textbox", name="••••••••")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("gurarawr@#01")
        
        # -> Fill the 'EMAIL' field with gura3497@gmail.com, fill the 'PASSWORD' field with gurarawr@#01, then click the 'Masuk Sekarang' button to submit the login form.
        # Masuk Sekarang button
        elem = page.get_by_role("button", name="Masuk Sekarang")
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The Today's Habits section is visible and contains a habit item ('Study').
        # Assert-outcome: passed
        # Assert: Verifies a habit item labeled 'Study' is shown in the today's habits list.
        await expect(page.locator("xpath=/html/body/div[2]/main/div/section[2]/div[1]/div[2]/div[1]/div/div[2]/div[1]/span[1]").nth(0)).to_have_text("Study", timeout=15000), "Verifies a habit item labeled 'Study' is shown in the today's habits list."
        
        # --> The habits progress counter for today is shown (2/4).
        # Assert-outcome: passed
        # Assert: Verifies the today's habits progress counter displays '2/4'.
        await expect(page.locator("xpath=/html/body/div[2]/main/div/section[2]/div[1]/div[1]/div[1]/div/span").nth(0)).to_have_text("2\n/\n4", timeout=15000), "Verifies the today's habits progress counter displays '2/4'."
        
        # --> The dashboard summary displays the streak badge, the user's level label, and XP indicator.
        # Assert-outcome: passed
        # Assert: Verifies the streak badge is present in the summary area.
        await expect(page.get_by_role("main").nth(0)).to_contain_text("Streak", timeout=15000), "Verifies the streak badge is present in the summary area."
        # Assert-outcome: passed
        # Assert: Verifies the user's level label ('Lvl') is shown in the summary.
        await expect(page.get_by_role("main").nth(0)).to_contain_text("Lvl", timeout=15000), "Verifies the user's level label ('Lvl') is shown in the summary."
        
        # --> The Recent Achievements section is present with a 'Lihat Semua' link.
        # Assert-outcome: passed
        # Assert: Verifies the recent achievements section includes a 'Lihat Semua' link.
        await expect(page.locator("xpath=/html/body/div[2]/main/div/section[2]/div[2]/div[2]/div[1]/a").nth(0)).to_have_text("Lihat Semua", timeout=15000), "Verifies the recent achievements section includes a 'Lihat Semua' link."
        
        # --> A tree preview is shown with a health percentage indicator.
        # Assert-outcome: passed
        # Assert: Verifies the tree preview displays a health percentage indicator.
        await expect(page.get_by_role("main").nth(0)).to_contain_text("%", timeout=15000), "Verifies the tree preview displays a health percentage indicator."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    