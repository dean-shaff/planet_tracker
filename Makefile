image-build:
	docker build -t planet-tracker:latest .

image-tag:
	docker tag planet-tracker:latest dshaff/planet-tracker:latest

image-tag-aws:
	docker tag planet-tracker:latest 215567678864.dkr.ecr.us-east-1.amazonaws.com/planet-tracker:latest

image-deploy:
	docker push dshaff/planet-tracker:latest

image-deploy-aws:
	docker push 215567678864.dkr.ecr.us-east-1.amazonaws.com/planet-tracker:latest
