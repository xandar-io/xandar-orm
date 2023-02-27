import { DataSource } from "typeorm"


class CustomAppDataSource extends DataSource{
    
}

const source = new CustomAppDataSource();
source.initialize()
.then(() => {
    console.log("Data Source has been initialized!")
})
.catch((err) => {
    console.error("Error during Data Source initialization", err)
})