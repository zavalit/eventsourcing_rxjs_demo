import {queryMongo} from './mongo'


const projects = (resp: any) => resp.map(({_id, ...body}) => body)

export const readProjects = (response: (projects: []) => void) =>
    queryMongo(client => new Promise((resolve, reject) => client.db('projections')
            .collection('projects')
            .find()
            .toArray((err:any, result:any) => 
                err
                    ? reject(err)
                    : resolve(result)
            ))
            .then(projects)
            .then(response)
    )