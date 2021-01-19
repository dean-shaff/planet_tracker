FROM python:3.7.3-stretch

RUN apt-get update && apt-get install -y curl

RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -
ENV PATH="/root/.poetry/bin:${PATH}"

WORKDIR /planet-tracker
COPY . /planet-tracker

RUN poetry install

EXPOSE 8080

CMD ["poetry", "run", "gunicorn", "app:app", "--worker-class", "aiohttp.GunicornWebWorker", "--bind", "0.0.0.0:8080"]
