# Eventsourcing Demo App

## Setup

bootsrap first afordable persistance layers (redis, mongodb) as well as `redis commander` for debugging:
```sh
docker-compose up -d
```


## Run

start an app 
```sh
npm run start
````


and send a few requests to see the results:
```sh
curl -X POST \
  http://localhost:8089/projects \
  -H 'Content-Type: application/json' \
  -d '{
	"project_uuid": "1234-1u2u-uuid",
	"project_name": "Project 1"
}'



curl -X PUT \
  http://localhost:8089/projects/1234-1u2u-uuid \
  -H 'Content-Type: application/json' \
  -d '{
	"project_name": "Project 1 (updated)"
}'


curl -X GET \
  http://localhost:8089/projects

````




## Check persisting


You can use an `redis-commander` to take a look what and how was stored in redis. For that just open `http://localhost:8091/` in your Browser

In order to check what was stored in mongodb, you can use (MongoDB Compass)[https://www.mongodb.com/download-center/compass]. For connection use following credentials: `mongodb://projector:projector@localhost:27027/`



