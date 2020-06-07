
import {queryMongo} from "./";


export const insertOne = (eventStreamObject: ProjectEventStreamObject) => {
                
    const {timestamp_key, event_name, event_payload: {project_uuid}} = eventStreamObject
    const timestamp_group = timestamp_key.match(/(\d+)-/)
    const timestamp = timestamp_group && parseInt(timestamp_group[1])
    queryMongo(client => (new Promise((resolve, reject) => {
        client.db('projections')
        .collection('projects.log')
        .insertOne(
            {project_uuid, timestamp, event_name},
            (err:any, result:any) => err
            ? reject(err)
            : resolve(result)
        )
        
    })).then((res: any) => console.log('mongo log insert', res.result)))
}