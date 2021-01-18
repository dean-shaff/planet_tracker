image-build:
	docker build -t planet-tracker:latest .

image-tag:
	docker tag planet-tracker:latest dshaff/planet-tracker:latest

image-deploy:
	docker push dshaff/planet-tracker:latest
