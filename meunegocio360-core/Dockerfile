# Imagem do microsserviço Núcleo (RNF-100): multi-stage, sem depender de arquivos fora desta pasta.

FROM python:3.13-slim AS build
COPY --from=ghcr.io/astral-sh/uv:0.13.8 /uv /bin/uv
WORKDIR /app
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=never
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev --no-install-project
COPY src src
COPY alembic.ini ./
COPY migrations migrations
RUN uv sync --locked --no-dev

FROM python:3.13-slim
WORKDIR /app
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1
COPY --from=build /app /app
USER 1001
EXPOSE 8080
# Aplica as migrations pendentes e sobe a aplicação na porta informada pelo Render (RNF-101).
CMD ["sh", "-c", "alembic upgrade head && exec uvicorn --factory meunegocio360_core.main:create_app --host 0.0.0.0 --port ${PORT:-8080} --proxy-headers --forwarded-allow-ips='*' --no-access-log"]
