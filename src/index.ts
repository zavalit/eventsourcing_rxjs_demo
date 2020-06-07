import express from "express";
import writeAPI from "./api/write"
import readAPI from './api/read'
import "./projections"


const app = express();
app.use(express.json()) 

writeAPI(app)
readAPI(app)

const port = 8089; 



app.listen( port, () => {

    console.log( `server started at http://localhost:${ port }` );
} );
