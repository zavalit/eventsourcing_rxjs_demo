
import * as redis from 'redis'
import { from, of, Subject, Unsubscribable, using, fromEvent, throwError, merge} from 'rxjs'
import {flatMap, reduce, map, takeUntil, mergeMap, filter, catchError, tap} from 'rxjs/operators'
import {ProjectEvents} from './events'

const hashMapRedisClient = redis.createClient()


export const appendToAggregateCache = (event: ProjectEventStreamObject) => {
    const {timestamp_key, event_payload: {project_uuid}} = event
    hashMapRedisClient.hmset(`project:${project_uuid}`, timestamp_key, JSON.stringify(event))
}

export const queryProjectEventsHashMap = (project_uuid: string): Promise<{[key: string]: string}> => 
    new Promise((resolve, reject) =>
        hashMapRedisClient.hgetall(`project:${project_uuid}`, (err:any, data:{[key: string]: string}) =>
            err
            ? reject(err)
            : resolve(data)
        )
)

const hashMapToSortedEvents = (hashmap: {[key: string]: string} | null) => {

    return hashmap
    ? Object.keys(hashmap)
    .map((key: string) => key.match(/(\d+)-(\d+)/))
    .map((match: RegExpMatchArray | null)  => {
            const [key, timestamp, iter] = match as Array<string>
            const fullkey = parseInt(timestamp+iter)
            return [fullkey, JSON.parse(hashmap[key])]
        }).sort((a, b) => a[0] - b[0])
        .map((e) => e[1])
    :[]
}

const buildSet = (data: any, set: object = {}): object => {
                    
    if (data.project_name){
        const {project_name, ...rest} = data
        return buildSet(rest, {...set, project_name})
    }
    else return set
}


const projectAggregate = (state: {}, event: any) => {
    switch(event.event_name) {
        case ProjectEvents.PROJECT_CREATED:
            return event.event_payload
        case ProjectEvents.PROJECT_UPDATED:
            return {...state, ...buildSet(event.event_payload)}
    }
    return state
}

export const projectState$ = (project_uuid: string) => 
    from(queryProjectEventsHashMap(project_uuid))
        .pipe(
            flatMap(res => hashMapToSortedEvents(res)),
            reduce((acc, e) => projectAggregate(acc, e), {})
        )


