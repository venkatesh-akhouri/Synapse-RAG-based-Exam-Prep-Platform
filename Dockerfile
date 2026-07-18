FROM python:3.11-slim

WORKDIR /app

RUN pip install uv

COPY pyproject.toml .

RUN uv pip install --system -- no-cache -r pyproject.toml

RUN python -c "from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction; SentenceTransformerEmbeddingFunction(model_name='all-mpnet-base-v2')"

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]