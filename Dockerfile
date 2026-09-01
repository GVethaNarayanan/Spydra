FROM python:3.11-slim
WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir -e .
CMD sh -c "python -m varden.cli demo --host 0.0.0.0 --port ${PORT:-10000} --no-browser"
