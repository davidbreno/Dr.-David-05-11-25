# Dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

# Requisitos
COPY requirements.txt /app/requirements.txt
# Garante whitenoise instalado mesmo se faltar no requirements.txt
RUN pip install --no-cache-dir -r requirements.txt whitenoise

# Código
COPY . /app

# Pasta onde os estáticos coletados ficarão
RUN mkdir -p /app/staticfiles

# Coleta os estáticos na imagem
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

CMD ["sh", "-c", "python manage.py collectstatic --noinput && python manage.py runserver 0.0.0.0:8000"]
