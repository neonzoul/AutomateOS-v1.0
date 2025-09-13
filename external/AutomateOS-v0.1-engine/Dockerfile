FROM python:3.11-slim
WORKDIR /app

# Install system dependencies that are commonly needed for building Python deps
# (psycopg2-binary works without these, but keeping lightweight base image clean)

COPY external/AutomateOS-v0.1-engine/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY external/AutomateOS-v0.1-engine/app /app/app
COPY external/AutomateOS-v0.1-engine/main.py /app/main.py

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
