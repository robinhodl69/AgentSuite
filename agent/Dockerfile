FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000

WORKDIR /app

COPY pyproject.toml ./
COPY src ./src
COPY skills ./skills
COPY examples ./examples

RUN pip install --upgrade pip && pip install .

EXPOSE 8000

CMD ["agentsuite-agent"]
