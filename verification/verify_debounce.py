from playwright.sync_api import sync_playwright

def verify_dashboard_debounce():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to Dashboard
        try:
            print("Navigating to http://localhost:5173")
            page.goto("http://localhost:5173")

            # Check if redirected to login
            print(f"Current URL: {page.url}")
            if "login" in page.url or "Connexion" in page.content():
                print("Redirected to login. Attempting to login...")
                # Fill email
                print("Filling email...")
                page.fill("input[type='email']", "test@example.com")

                # Fill password
                print("Filling password...")
                page.fill("input[type='password']", "password")

                # Click submit
                print("Clicking submit...")
                page.click("button[type='submit']")

                # Wait for navigation
                print("Waiting for navigation...")
                page.wait_for_url("**/", timeout=5000)

            # Wait for dashboard to load
            print("Waiting for 'Tableau de bord'...")
            page.wait_for_selector("text=Tableau de bord", timeout=5000)

            # Find search input
            print("Finding search input...")
            search_input = page.get_by_placeholder("Rechercher par lieu, contaminant ou date...")

            # Type slowly to trigger potential debounce (though script execution is fast)
            print("Typing search term...")
            search_input.type("Test Search", delay=100)

            # Take screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/dashboard_search.png")
            print("Screenshot taken at verification/dashboard_search.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            print("Error screenshot taken at verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_dashboard_debounce()
