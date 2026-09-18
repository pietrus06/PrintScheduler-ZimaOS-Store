FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY source-v1.0.0.zip /tmp/source.zip
RUN python -c "import zipfile; zipfile.ZipFile('/tmp/source.zip').extractall('/tmp/src')" \
    && pip install --no-cache-dir -r /tmp/src/requirements.txt \
    && cp -a /tmp/src/app /app/app \
    && rm -rf /tmp/source.zip /tmp/src

EXPOSE 8787

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8787"]
