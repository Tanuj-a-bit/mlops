# Use the official uv image as a source for the binary
FROM python:3.11-slim

# Copy the uv binary from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy the project files
COPY . /app

# Install project dependencies using uv
RUN uv sync --frozen

# Expose ports for FastAPI (8000) and Prometheus (8081)
EXPOSE 8000
EXPOSE 8081

# Command to run the application
CMD ["uv", "run", "uvicorn", "src.serving.app:app", "--host", "0.0.0.0", "--port", "8000"]
