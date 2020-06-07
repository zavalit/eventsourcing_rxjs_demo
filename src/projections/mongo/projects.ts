import {queryMongo} from "./";

const buildSet = (data: any, set: object = {}): object => {
                    
    if (data.project_name){
        const {project_name, ...rest} = data
        return buildSet(rest, {...set, project_name})
    }
    else return set
}

export const insertOne =  (eventStreamObject: ProjectEventStreamObject) => {
              
    const { event_payload } = eventStreamObject

    const {project_uuid} = event_payload
       
        queryMongo(client => (new Promise((resolve, reject) => {
            client.db('projections')
            .collection('projects')
            .insertOne(buildSet(event_payload, {project_uuid}), 
            (err:any, result:any) => err
                    ? reject(err)
                    : resolve(result)
            )                    
        })).then((res: any) => console.log('mongo insert', res.ops)))
        return

    }



export const updateOne = (eventStreamObject: ProjectEventStreamObject) => {
    
    const { event_payload } = eventStreamObject

    const {project_uuid, ...update} = event_payload

    queryMongo(client => (new Promise((resolve, reject) => {
        client.db('projections')
        .collection('projects')
        .updateOne(
            {project_uuid: `${project_uuid}`}, 
            {
                $set: buildSet(update)
            },
            (err:any, result:any) => err
            ? reject(err)
            : resolve(result)
        )
        
    })).then((res: any) => console.log('mongo update', res.result)))
    return

}

