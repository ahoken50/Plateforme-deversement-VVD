from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console logs to debug
        page.on("console", lambda msg: print(f"Console: {msg.text}"))

        try:
            # Go to dashboard
            page.goto("http://localhost:3000/")
            page.wait_for_load_state("networkidle")

            # Wait a bit for initial render
            page.wait_for_timeout(1000)

            # Count elements
            items = page.locator('li.group')
            print(f"Initial items count: {items.count()}")

            if items.count() != 20:
                print("Error: Expected 20 items initially.")
            else:
                print("Initial count verification passed.")

            # Scroll to bottom
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")

            # Wait for intersection observer to trigger and load more
            page.wait_for_timeout(1000)

            # Count elements again
            items = page.locator('li.group')
            print(f"Items count after scroll: {items.count()}")

            if items.count() > 20:
                print("Infinite scroll verification passed.")
            else:
                print("Error: Infinite scroll did not load more items.")

            # Take a screenshot
            page.screenshot(path="verification/dashboard_scrolled.png")
            print("Scrolled screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
