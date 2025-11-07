.PHONY: venv install run makemig mig makemigdc migdc superuser up down test roles
venv:
	python -m venv .venv
install:
	pip install -r requirements.txt
run:
	python manage.py runserver 0.0.0.0:8000
makemig:
	python manage.py makemigrations
mig:
	python manage.py migrate
makemigdc:
	docker compose exec web python manage.py makemigrations
migdc:
	docker compose exec web python manage.py migrate
superuser:
	python manage.py createsuperuser
roles:
	python manage.py setup_roles
up:
	docker compose up --build
down:
	docker compose down
test:
	python manage.py test
