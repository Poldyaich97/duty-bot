build:
	docker build -t duty-bot .

run:
	docker run -d -p 3000:3000 --name duty-bot --rm duty-bot