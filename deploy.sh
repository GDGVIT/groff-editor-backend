docker stack rm groff
docker-compose pull
docker stack deploy -c docker-compose.yml 
