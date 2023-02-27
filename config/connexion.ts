import { DataSource } from "typeorm"

export const myDataSource = new DataSource({})
export const Manager = myDataSource.manager
// export const UserRepository = myDataSource.getRepository(UserEntity)
// export const PhotoRepository = myDataSource.getRepository(PhotoEntity)