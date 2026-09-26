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
        
        # -> Fill the email field with gura3497@gmail.com, fill the password field with gurarawr@#01, and click the 'Masuk Sekarang' button to submit the login form.
        # nama@email.com email field
        elem = page.get_by_role("textbox", name="nama@email.com")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("gura3497@gmail.com")
        
        # -> Fill the email field with gura3497@gmail.com, fill the password field with gurarawr@#01, and click the 'Masuk Sekarang' button to submit the login form.
        # •••••••• password field
        elem = page.get_by_role("textbox", name="••••••••")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("gurarawr@#01")
        
        # -> Fill the email field with gura3497@gmail.com, fill the password field with gurarawr@#01, and click the 'Masuk Sekarang' button to submit the login form.
        # Masuk Sekarang button
        elem = page.get_by_role("button", name="Masuk Sekarang")
        await elem.click(timeout=10000)
        
        # -> Click the 'Kebiasaan' link in the top navigation to open the Habits page.
        # Kebiasaan link
        elem = page.get_by_role("link", name="Kebiasaan")
        await elem.click(timeout=10000)
        
        # -> Click the 'Tambah Kebiasaan' button to open the habit creation flow.
        # Tambah Kebiasaan button
        elem = page.get_by_role("button", name="Tambah Kebiasaan")
        await elem.click(timeout=10000)
        
        # -> Enter 'Morning water' in the Nama Kebiasaan field, then select the 'Health' category, choose difficulty 'Sedang', and select the frequency 'Setiap Hari' so the UI can update.
        # Misal: Belajar Coding, Minum Air 2L, Baca Buku text field
        elem = page.get_by_role("textbox", name="Misal: Belajar Coding, Minum")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Morning water")
        
        # -> Enter 'Morning water' in the Nama Kebiasaan field, then select the 'Health' category, choose difficulty 'Sedang', and select the frequency 'Setiap Hari' so the UI can update.
        # Health button
        elem = page.locator("form").get_by_role("button", name="Health")
        await elem.click(timeout=10000)
        
        # -> Enter 'Morning water' in the Nama Kebiasaan field, then select the 'Health' category, choose difficulty 'Sedang', and select the frequency 'Setiap Hari' so the UI can update.
        # Sedang +15 XP button
        elem = page.get_by_role("button", name="Sedang +15 XP")
        await elem.click(timeout=10000)
        
        # -> Enter 'Morning water' in the Nama Kebiasaan field, then select the 'Health' category, choose difficulty 'Sedang', and select the frequency 'Setiap Hari' so the UI can update.
        # 📅 Setiap Hari button
        elem = page.get_by_role("button", name="📅 Setiap Hari")
        await elem.click(timeout=10000)
        
        # -> Select the 'Kesehatan' icon and the 'Emerald' color, then click the 'Tanam Kebiasaan 🌱' button to save the habit and later verify 'Morning water' appears in the active list.
        # Kesehatan button
        elem = page.get_by_role("button", name="Kesehatan")
        await elem.click(timeout=10000)
        
        # -> Select the 'Kesehatan' icon and the 'Emerald' color, then click the 'Tanam Kebiasaan 🌱' button to save the habit and later verify 'Morning water' appears in the active list.
        # Emerald button
        elem = page.get_by_role("button", name="Emerald")
        await elem.click(timeout=10000)
        
        # -> Select the 'Kesehatan' icon and the 'Emerald' color, then click the 'Tanam Kebiasaan 🌱' button to save the habit and later verify 'Morning water' appears in the active list.
        # Tanam Kebiasaan 🌱 button
        elem = page.get_by_role("button", name="Tanam Kebiasaan 🌱")
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The newly created habit 'Morning water' appears in the active habits list.
        # Assert-outcome: passed
        # Assert: Verified the active habits list contains the habit titled 'Morning water'.
        await expect(page.get_by_role("main").nth(0)).to_contain_text("Morning water", timeout=15000), "Verified the active habits list contains the habit titled 'Morning water'."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    