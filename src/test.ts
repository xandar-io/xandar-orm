import { DataSource } from "typeorm"
import {AppDataSource} from '../config/connexion'

const db =  new AppDataSource(
    {
        type: "postgres",
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT ?? "5432"),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [__dirname + '/../models/*.ts'],
        synchronize: true,
      }
)
db.initialize()
.then(() => {
    console.log("Data Source has been initialized!")
})
.catch((err) => {
    console.error("Error during Data Source initialization", err)
})



