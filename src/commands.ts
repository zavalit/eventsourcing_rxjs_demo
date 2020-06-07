
import * as redis from 'redis'
import { from, of} from 'rxjs'
import {tap, mergeMap} from 'rxjs/operators'
import { ProjectEvents } from './events'
import { projectState$ } from './aggregate'

export const redisClient = redis.createClient()



interface ErrorMessage {
    status: number,
    msg: string
}

class CommandError extends Error {
    
    status: number
    msg: string
    
    constructor({status, msg}: ErrorMessage) {
        super()
        this.status = status
        this.msg = msg
     
    }
}        


export interface ProjectState {
    project_uuid: string
    project_name: string

}

/**
 * 
 * CREATE COMMAND
 */


export interface ProjectCreatePayload extends ProjectState {

}

export function isProjectCreatePayload(arg: any): arg is ProjectCreatePayload {
    return arg && arg.project_uuid && arg.project_name
} 


export const createProjectCommand = (payload: ProjectCreatePayload): Promise<null> => 
    of(isProjectCreatePayload(payload))
    .pipe(
        tap(valid => {
            if(!valid){
                throw new CommandError({status: 400, msg:"wrong format"})
            }
        }),
        
        mergeMap(_ => from(projectState$(payload.project_uuid))),
        
        tap(({project_uuid}) =>  {
            if (project_uuid === payload.project_uuid){
                throw new CommandError({status: 400, msg:"project already exists"})
            }
        }),
        
        tap(_ => appendEvent(ProjectEvents.PROJECT_CREATED, payload)),
            
    ).toPromise() 

    

    

/**
 * 
 * UPDATE COMMAND
 */


export interface ProjectUpdatePayload extends ProjectState {

}


export function isProjectUpdatePayload(arg: any): arg is ProjectUpdatePayload {
    return arg && arg.project_uuid && arg.project_name
} 

const isUpdateable = (state: any, payload: any) => 
    state.project_name && state.project_name !== payload.project_name


export const updateProjectCommand = (payload: any): Promise<any> => of(isProjectUpdatePayload(payload)).pipe(
        tap(valid => {
            if(!valid){
                throw new CommandError({status: 400, msg:"wrong format"})                
            }
        }),

        mergeMap(_ => from(projectState$(payload.project_uuid))),
        
        tap((state) => {
            if(!isUpdateable(state, payload)){                
                throw new CommandError({status: 400, msg:"could not be updated"})
            }}),
        
        tap(_ => appendEvent(ProjectEvents.PROJECT_UPDATED, payload)),
    

    ).toPromise()


/**
 * 
 * APPEND EVENT
 */

    

const appendEvent = (event_name: string, event_payload: object) : Promise<string> => 
    new Promise((resolve, reject) => 
        redisClient
            .xadd(`project`, '*', event_name, JSON.stringify(event_payload), (err: Error, id: string) => 
                (err)
                ? reject(new CommandError({status: 500, msg: err.message}))
                : resolve(id)))

