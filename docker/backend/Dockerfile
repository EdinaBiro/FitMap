FROM python:3.11.6

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY ../../backend/requirements.txt .
COPY ../../backend/fitmap-449621-6a3bd03735b5.json ./db/ 
RUN pip install --no-cache-dir -r requirements.txt

COPY ../../backend .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]