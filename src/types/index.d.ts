

declare interface ProjectEventStreamObject {
    stream: string,
    timestamp_key: string
    event_name: string
    event_payload: {project_uuid: string} & any
}


