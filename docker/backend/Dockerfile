FROM python:3.11.6

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY ../../backend/requirements.txt .
COPY ../../backend/fitmap-449621-6a3bd03735b5.json ./db/ 
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY ../../backend .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]