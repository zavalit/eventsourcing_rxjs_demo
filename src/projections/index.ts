
import * as redis from 'redis'

import {Observable, BehaviorSubject, zip, from, of,  ConnectableObservable} from 'rxjs'
import {filter, tap, mergeMap, flatMap, share} from 'rxjs/operators'
import {ProjectEvents} from '../events'
import { insertOne as insertOneProject, updateOne as updateOneProject } from './mongo/projects'
import { insertOne as insertOneProjectLog } from './mongo/projects.log'
import { appendToAggregateCache } from '../aggregate'



type StreamToken = [string, Array<string>]
type RedisTuple = [string, Array<StreamToken>]



const connectToRedis = (): redis.RedisClient => {
    console.log('connect to redis')
    return redis.createClient()
}

const streamRedisClient$ = new BehaviorSubject<redis.RedisClient>(connectToRedis())


const readPromise = (client: redis.RedisClient, record_id: string): Promise<RedisTuple[]> => new Promise((resolve, reject) => {
    client.xread(
        'BLOCK', 
        '1000',  
        'STREAMS', 
        'project',  
        record_id, 
        (err:Error | null, data: RedisTuple[]) => err ? reject(err): resolve(data))
})


const projectStream$ = (record_id: string): Observable<RedisTuple[]> => 
    zip(from(streamRedisClient$), of(record_id))
        .pipe(
            mergeMap(([client, record_id]) => from(readPromise(client, record_id)))
        )


const obtainIds = (data: RedisTuple[], prev_ids: string[]): string[] => 
    (typeof(data) === "undefined" || data === null || !Array.isArray(data)) 
    ? prev_ids
    : data.map((tuple:RedisTuple) => tuple[1]).map(tokens => tokens[tokens.length -1][0])



const recordIds$ = new BehaviorSubject(['$'])


const streamConsumer$ = recordIds$.pipe(
    
    mergeMap(ids => 
         zip(from(projectStream$(ids[0])), of(ids))
    ),

    tap((record: [RedisTuple[], string[]]) => 
        recordIds$.next( obtainIds(...record))
    ),
    
    filter(([data, ]: [RedisTuple[], string[]]) => 
        data !== null),
    
    flatMap(([data, ]: [RedisTuple[], string[]]) => 
        data),
)



const projectHotObservable$: Observable<ProjectEventStreamObject> = streamConsumer$
    .pipe(
        flatMap(([stream, data]: RedisTuple) => 
            data.map(([timestamp_key, [event_name, event_payload]]) => 
                ({stream, timestamp_key, event_name, event_payload: JSON.parse(event_payload)}))
            ),
        share()    
) as ConnectableObservable<ProjectEventStreamObject>


projectHotObservable$
    .subscribe({  
        next : appendToAggregateCache
    })


projectHotObservable$.pipe( filter(event => event.event_name ===  ProjectEvents.PROJECT_CREATED))
    .subscribe({
        next: insertOneProject
    })


projectHotObservable$.pipe( filter(event => event.event_name ===  ProjectEvents.PROJECT_UPDATED))
    .subscribe({  
        next: updateOneProject
    })


projectHotObservable$
    .subscribe({
        next: insertOneProjectLog
    })


   