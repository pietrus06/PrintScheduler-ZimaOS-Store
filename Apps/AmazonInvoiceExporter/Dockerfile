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
RUN python -c "import zipfile; zipfile.ZipFile('/tmp/source.zip').extractall('/tmp/src')" \
    && pip install --no-cache-dir -r /tmp/src/requirements.txt \
    && cp -a /tmp/src/app /app/app \
    && rm -rf /tmp/source.zip /tmp/src /tmp/source-parts

EXPOSE 8787

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8787"]
