docker-run: 
	# Image creation
	docker image build -t sn-frontend ./frontend
	docker image build -t sn-backend ./backend
	# Creates a volume so data is persisted. No data loss when containers are closed
	docker volume create --name sn-dbvolume --opt type=none --opt device=/${PWD}/backend/db/ --opt o=bind
	# Runs containers, exposes ports
	docker container run -p 8080:8080 -v sn-dbvolume:/backend/db/ --detach --name sn-backend sn-backend
	docker container run -p 3000:3000 --detach --name sn-frontend sn-frontend

docker-remove:
	docker container stop sn-backend
	docker container rm sn-backend
	docker image rm sn-backend
	docker container stop sn-frontend
	docker container rm sn-frontend
	docker image rm sn-frontend
	docker volume rm sn-dbvolume