import * as redis from "redis"

declare module "redis" {

    interface StreamKeyCommand<T, U> {
        (qeury_op: T, query_op_value: T, op_id: 'STREAMS', stream1: T, key1: T, cb: Callback<U>): void;
        (qeury_op: T, query_op_value: T, op_id: 'STREAMS', stream1: T, key1: T,  stream2: T, key2: T, cb: Callback<U>): void;
        (qeury_op: T, query_op_value: T, op_id: 'STREAMS', stream1: T, key1: T,  stream2: T, key2: T,  stream3: T, key3: T, cb: Callback<U>): void;
        
    }
    
    export interface StreamAddCommand<T, U> {
        
        (stream: string, key: string, ...args: Array<T | Callback<U>>): void;
        (stream: string, key: string, arg1: T, arg2: T, cb: Callback<U>): void;
        (stream: string, key: string, arg1: T, arg2: T, arg3: T, arg4: T, cb?: Callback<U>): void;        
        (stream: string, key: string, arg1: T, arg2: T, arg3: T, arg4: T, arg5: T, arg6: T, cb: Callback<U>): void;
    }
    

    export interface RedisClient {
        xread: StreamKeyCommand<string, any>
        xadd: StreamAddCommand<string, any>
    }
}