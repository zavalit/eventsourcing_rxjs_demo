import {Express, Response} from "express";
import {readProjects} from "../projections/repository"




export default (app: Express) => {
    
    app.get("/projects",  (_, response: Response) => {
   
        readProjects((projects) => {
            response.send(projects)
        }).catch(_ => {
            response.status(500)
            response.send()
        })
                
    })
}
