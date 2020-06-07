import {Express, Request, Response} from "express";
import {createProjectCommand, updateProjectCommand} from "../commands"




export default (app: Express) => {
    
    app.post("/projects", (req: Request, response: Response) => 
        createProjectCommand(req.body)
            .catch(({status, msg}) => {
                console.error(msg)
                response.status(status ? status : 500)
                response.send()
            })
            .then(() => {
                response.status(201)
                response.send()
            })
        )


    app.put("/projects/:project_uuid", (req: Request, response: Response) =>
        updateProjectCommand({...req.body, project_uuid: req.params.project_uuid})
            .catch(({status, msg}) => {
                console.error(msg)
                response.status(status ? status : 500 )
                response.send()
            })
            .then(() => {
                response.status(200)
                response.send()
            })
        )
    
    
    
}
