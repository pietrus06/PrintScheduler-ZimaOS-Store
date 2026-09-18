FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY source.part*.b64 /tmp/source-parts/

RUN python - <<'PY'
from pathlib import Path
import base64
import hashlib

parts = sorted(Path('/tmp/source-parts').glob('source.part*.b64'))
encoded = ''.join(p.read_text(encoding='utf-8').strip() for p in parts)
data = base64.b64decode(encoded, validate=True)
digest = hashlib.sha256(data).hexdigest()
expected = 'fd86909b8720edf851b0683ef4f3908e06acca324dc06cdf540f88595171a581'
if digest != expected:
    raise SystemExit(f'Source archive checksum mismatch: {digest}')
Path('/tmp/source.zip').write_bytes(data)
PY

RUN python -c "import zipfile; zipfile.ZipFile('/tmp/source.zip').extractall('/tmp/src')"

RUN python - <<'PY'
from pathlib import Path

p = Path('/tmp/src/app/exporter.py')
s = p.read_text(encoding='utf-8')

old_url = '''            url = (
                f"{self.amazon_base_url}/gp/css/order-history"
                f"?orderFilter=year-{options.year}&startIndex={start_index}&disableCsd=no-js"
            )
'''
new_url = '''            url = (
                f"{self.amazon_base_url}/your-orders/orders"
                f"?timeFilter=year-{options.year}&startIndex={start_index}"
            )
'''
if old_url not in s:
    raise SystemExit('Expected legacy order-history URL block not found')
s = s.replace(old_url, new_url)

old_login = '''            normalized = normalize_text(body_text)
            if "/ap/signin" in current or "identifiez-vous" in normalized[:1500] or "sign in" in normalized[:1200]:
                raise RuntimeError("La session Amazon n'est pas connectée. Ouvre Chromium et connecte-toi à Amazon.fr.")

            page_orders = unique_order_ids(body_text)
'''
new_login = '''            normalized = normalize_text(body_text)
            if "/ap/signin" in current or "identifiez-vous" in normalized[:1500] or "sign in" in normalized[:1200]:
                raise RuntimeError("La session Amazon n'est pas connectée. Ouvre Chromium et connecte-toi à Amazon.fr.")

            # Amazon can silently fall back to "3 derniers mois". Abort instead
            # of producing an incomplete annual export.
            expected_filter = f"timefilter=year-{options.year}"
            if expected_filter not in current:
                raise RuntimeError(
                    f"Amazon n'a pas appliqué le filtre {options.year}. "
                    "L'export est arrêté pour éviter de prendre seulement les 3 derniers mois."
                )
            if page_index == 0:
                self.log(f"Filtre Amazon vérifié : année {options.year}.")

            page_orders = unique_order_ids(body_text)
'''
if old_login not in s:
    raise SystemExit('Expected login/order scan block not found')
s = s.replace(old_login, new_login)

old_menu = '''    async def _open_invoice_menu(self, scope) -> None:
        selectors = [
            "a:has-text('Facture')",
            "button:has-text('Facture')",
            "span:has-text('Facture')",
            "a:has-text('Invoice')",
            "button:has-text('Invoice')",
        ]
        for selector in selectors:
            try:
                locators = scope.locator(selector)
                count = await locators.count()
                for i in range(min(count, 6)):
                    loc = locators.nth(i)
                    txt = normalize_text(await loc.inner_text(timeout=1000))
                    if any(word in txt for word in UNAVAILABLE_WORDS):
                        continue
                    try:
                        await loc.click(timeout=2500)
                        await asyncio.sleep(0.25)
                        return
                    except Exception:
                        continue
            except Exception:
                continue

'''
new_menu = '''    async def _open_invoice_menu(self, scope) -> None:
        # Amazon.fr exposes invoice links through an AUI popover. The real
        # invoice.pdf href is injected asynchronously after clicking "Facture".
        selectors = [
            ".a-popover-trigger:has-text('Facture')",
            ".a-popover-trigger:has-text('Invoice')",
            "a:has-text('Facture')",
            "button:has-text('Facture')",
            "span:has-text('Facture')",
            "a:has-text('Invoice')",
            "button:has-text('Invoice')",
        ]
        for selector in selectors:
            try:
                locators = scope.locator(selector)
                count = await locators.count()
                for i in range(min(count, 10)):
                    loc = locators.nth(i)
                    try:
                        txt = normalize_text(await loc.inner_text(timeout=1000))
                    except Exception:
                        continue
                    if not txt or any(word in txt for word in UNAVAILABLE_WORDS):
                        continue
                    if "facture" not in txt and "invoice" not in txt:
                        continue

                    try:
                        await loc.scroll_into_view_if_needed(timeout=2000)
                    except Exception:
                        pass

                    clicked = False
                    try:
                        await loc.click(timeout=5000)
                        clicked = True
                    except Exception:
                        try:
                            await loc.evaluate("el => el.click()")
                            clicked = True
                        except Exception:
                            pass
                    if not clicked:
                        continue

                    page = loc.page
                    invoice_links = page.locator(
                        "[id^='a-popover-content-'] a[href*='invoice.pdf'], "
                        "[id^='a-popover-content-'] a[href]:has-text('Facture'), "
                        ".a-popover:visible a[href*='invoice.pdf']"
                    )
                    try:
                        await invoice_links.first.wait_for(state="attached", timeout=10_000)
                    except Exception:
                        await asyncio.sleep(1.5)
                    return
            except Exception:
                continue

'''
if old_menu not in s:
    raise SystemExit('Expected invoice menu block not found')
s = s.replace(old_menu, new_menu)

p.write_text(s, encoding='utf-8')

m = Path('/tmp/src/app/main.py')
ms = m.read_text(encoding='utf-8')
m.write_text(ms.replace('version="1.0.0"', 'version="1.0.3"'), encoding='utf-8')
PY

RUN python -m py_compile /tmp/src/app/exporter.py /tmp/src/app/main.py \
    && pip install --no-cache-dir -r /tmp/src/requirements.txt \
    && cp -a /tmp/src/app /app/app \
    && rm -rf /tmp/source.zip /tmp/src /tmp/source-parts

EXPOSE 8787

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8787"]
