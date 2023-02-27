import { FindOneOptions, getRepository, Repository } from 'typeorm';
import  AppDataSource  from '../config/database'

export abstract class SQLModel {
  // [key: string]: any;
  public id!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  public async save(): Promise<SQLModel> {
    if (this.id) {
      this.updatedAt = new Date();
      return this.update();
    } else {
      this.createdAt = new Date();
      return this.insert();
    }
  }

  public async insert(): Promise<SQLModel> {
    const repo = AppDataSource.getRepository(this.constructor as typeof SQLModel);
    const entity = repo.create(this);
    const result = await repo.save(entity);
    this.id = result.id;
    return this;
  }

  public async update(): Promise<SQLModel> {
    const repo = AppDataSource.getRepository(this.constructor as typeof SQLModel);
    const entity = repo.create(this);
    await repo.update(this.id, entity);
    return this;
  }

  public async delete(): Promise<boolean> {
    const repo = AppDataSource.getRepository(this.constructor as typeof SQLModel);
    const result = await repo.delete(this.id);
    if (result && result.affected != null) {
        return result.affected > 0;
      }
      return false;
  }

  public async getRelated(relation: string): Promise<SQLModel | SQLModel[]> {
    const repo = AppDataSource.getRepository(this.constructor as typeof SQLModel);
    const entity = await repo.findOne({ where: { id: this.id }, relations: [relation] });
    if (entity === null) {
      throw new Error(`No entity found with ID ${this.id}`);
    }
    return entity[relation];
  }

  public async setRelated(relation: string, related: SQLModel | SQLModel[]): Promise<void> {
    const repo = AppDataSource.getRepository(this.constructor as typeof SQLModel);
    const entity = await repo.findOne({ where: { id: this.id }, relations: [relation] });
    if (entity === null) {
      throw new Error(`No entity found with ID ${this.id}`);
    }
    entity[relation] = related;
    await repo.save(entity);
  }

  public static defineRelations(): void {}

  public static async get(id: FindOneOptions<SQLModel>): Promise<SQLModel | null> {
    const repo = AppDataSource.getRepository(this as typeof SQLModel);
    const entity = await repo.findOne(id);
    return entity;
  }

  public static async getAll(): Promise<SQLModel[]> {
    const repo = AppDataSource.getRepository(this as typeof SQLModel);
    const entities = await repo.find();
    return entities;
  }

  public static async query(query: string): Promise<any[]> {
    const repo = AppDataSource.getRepository(this as typeof SQLModel);
    return repo.query(query);
  }

  public static tableName(): string {
    return (this as any).name.toLowerCase();
  }
}