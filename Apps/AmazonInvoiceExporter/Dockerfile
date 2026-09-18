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
expected = 'fb8ee4e3d65ae78b2acf1f5fa8d8a147858607854a9e6fd56a21f7b900c2e435'
if digest != expected:
    raise SystemExit(f'Source archive checksum mismatch: {digest}')
Path('/tmp/source.zip').write_bytes(data)
PY

RUN python -c "import zipfile; zipfile.ZipFile('/tmp/source.zip').extractall('/tmp/src')"

RUN python - <<'PY'
from pathlib import Path

p = Path('/tmp/src/app/exporter.py')
s = p.read_text(encoding='utf-8')
old = '''    async def _open_invoice_menu(self, scope) -> None:
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
new = '''    async def _open_invoice_menu(self, scope) -> None:
        # On Amazon.fr, "Facture" is usually an AUI popover trigger.
        # The real invoice.pdf link is injected asynchronously after the click.
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
                    # Historical and current Amazon.fr implementations expose
                    # invoice links inside #a-popover-content-N.  Wait for the
                    # asynchronous content instead of assuming it is immediate.
                    invoice_links = page.locator(
                        "[id^='a-popover-content-'] a[href*='invoice.pdf'], "
                        "[id^='a-popover-content-'] a[href]:has-text('Facture'), "
                        ".a-popover:visible a[href*='invoice.pdf']"
                    )
                    try:
                        await invoice_links.first.wait_for(state="attached", timeout=10_000)
                    except Exception:
                        # Give slower Marketplace/AUI responses a final grace period.
                        await asyncio.sleep(1.5)
                    return
            except Exception:
                continue

'''
if old not in s:
    raise SystemExit('Expected _open_invoice_menu block not found')
p.write_text(s.replace(old, new), encoding='utf-8')

m = Path('/tmp/src/app/main.py')
ms = m.read_text(encoding='utf-8')
m.write_text(ms.replace('version="1.0.1"', 'version="1.0.3"'), encoding='utf-8')
PY

RUN pip install --no-cache-dir -r /tmp/src/requirements.txt \
    && cp -a /tmp/src/app /app/app \
    && rm -rf /tmp/source.zip /tmp/src /tmp/source-parts

EXPOSE 8787

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8787"]
