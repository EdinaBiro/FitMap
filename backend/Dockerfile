FROM python:3.11-slim
WORKDIR /app

RUN pip install --upgrade pip
COPY requirements.txt .


RUN pip install --no-cache-dir -r requirements.txt
COPY fitmap-449621-6a3bd03735b5.json .
COPY . . 

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]