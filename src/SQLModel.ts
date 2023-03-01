import { FindOneOptions, Repository } from 'typeorm';
import { CustomAppDataSource }  from '../config/connection'

interface EntityWithRelation<T> {
  [key: string]: T | undefined;
}

export abstract class SQLModel {
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
    const repo = CustomAppDataSource.prototype.getRepository(this.constructor as typeof SQLModel);
    const entity = repo.create(this);
    const result = await repo.save(entity);
    this.id = result.id;
    return this;
  }

  public async update(): Promise<SQLModel> {
    const repo = CustomAppDataSource.prototype.getRepository(this.constructor as typeof SQLModel);
    const entity = repo.create(this);
    await repo.update(this.id, entity);
    return this;
  }

  public async delete(): Promise<boolean> {
    const repo = CustomAppDataSource.prototype.getRepository(this.constructor as typeof SQLModel);
    const result = await repo.delete(this.id);
    if (result && result.affected != null) {
        return result.affected > 0;
      }
      return false;
  }

  public async getRelated<T extends SQLModel | SQLModel[]>(relation: string): Promise<T> {
    const repo = CustomAppDataSource.prototype.getRepository(this.constructor as typeof SQLModel);
    const entity = await repo.findOne({ where: { id: this.id }, relations: [relation] });
    if (entity === undefined) {
      throw new Error(`No entity found with ID ${this.id}`);
    }
    const entityWithRelation = entity as unknown as EntityWithRelation<T>;
    return entityWithRelation[relation]!;
}

public async setRelated<T>(relation: string, related: T): Promise<void> {
  const repo = CustomAppDataSource.prototype.getRepository(this.constructor as typeof SQLModel);
  const entity = await repo.findOne({ where: { id: this.id }, relations: [relation] });
  if (entity === null) {
    throw new Error(`No entity found with ID ${this.id}`);
  }
  const entityWithRelation = entity as unknown as EntityWithRelation<T>;
  entityWithRelation[relation] = related;
  await repo.save(entityWithRelation);
}

  public static defineRelations(): void {}

  public static async get(id: FindOneOptions<SQLModel>): Promise<SQLModel | null> {
    const repo = CustomAppDataSource.prototype.getRepository(this as typeof SQLModel);
    const entity = await repo.findOne(id);
    return entity;
  }

  public static async getAll(): Promise<SQLModel[]> {
    const repo = CustomAppDataSource.prototype.getRepository(this as typeof SQLModel);
    const entities = await repo.find();
    return entities;
  }

  public static async query(query: string): Promise<any[]> {
    const repo = CustomAppDataSource.prototype.getRepository(this as typeof SQLModel);
    return repo.query(query);
  }

  public static tableName(): string {
    return (this as any).name.toLowerCase();
  }
}