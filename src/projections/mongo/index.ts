
import {MongoClient} from "mongodb";

const  MONGO_URL = "mongodb://projector:projector@localhost:27027"

export const queryMongo = async (callback: (client: MongoClient) => Promise<any>) => {
    
    return await MongoClient.connect(MONGO_URL!, ({ useUnifiedTopology: true }))
       .then((client:MongoClient) => (async() => {
           await callback(client).catch(err => {
               console.error("error", err)               
           })
           client.close()
        })())
}