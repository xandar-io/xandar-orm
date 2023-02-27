import { getRepository, MongoRepository, Repository } from 'typeorm';
import  { AppDataSource }  from '../config/connexion'
import mongoose, { Model as MongooseModel } from 'mongoose';

export abstract class Model {
  public id!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  public async save(): Promise<Model> {
    if (this.id) {
      this.updatedAt = new Date();
      return this.update();
    } else {
      this.createdAt = new Date();
      return this.insert();
    }
  }

  public async insert(): Promise<Model> {
    if (process.env.DB_TYPE === 'mongodb') {
      const model = await (
        this.constructor as typeof Model
      ).mongooseModel.create(this);
      this.id = model._id;
      return this;
    } else {
      const repo = AppDataSource.getRepository(this.constructor as typeof Model);
      const entity = repo.create(this);
      const result = await repo.insert(entity);
      this.id = result.identifiers[0].id;
      return this;
    }
  }

  public async update(): Promise<Model> {
    if (process.env.DB_TYPE === 'mongodb') {
      await (this.constructor as typeof Model).mongooseModel.updateOne(
        { _id: this.id },
        this,
      );
      return this;
    } else {
      const repo = AppDataSource.getRepository(this.constructor as typeof Model);
      const entity = repo.create(this);
      await repo.update(this.id, entity);
      return this;
    }
  }

  public async delete(): Promise<boolean> {
    if (process.env.DB_TYPE === 'mongodb') {
      await (this.constructor as typeof Model).mongooseModel.deleteOne({
        _id: this.id,
      });
      return true;
    } else {
      const repo = AppDataSource.getRepository(this.constructor as typeof Model);
      const result = await repo.delete(this.id);
      if (result && result.affected != null) {
        return result.affected > 0;
      }
      return false;
    }
  }

  public async getRelated(relation: string): Promise<Model | Model[]> {
    if (process.env.DB_TYPE === 'mongodb') {
      const model = (await (
        this.constructor as typeof Model
      ).mongooseModel.findById(this.id)) as MongooseModel<any, any, any>;
      const related = await model.populate(relation).execPopulate();
      return related[relation];
    } else {
      const repo = AppDataSource.getRepository(this.constructor as typeof Model);
      const entity = await repo.findOne(this.id, { relations: [relation]});
      return entity[relation];
    }
  }

  public async setRelated(
    relation: string,
    related: Model | Model[],
  ): Promise<void> {
    if (process.env.DB_TYPE === 'mongodb') {
      const ids = Array.isArray(related)
        ? related.map((r) => r.id)
        : [related.id];
      await (this.constructor as typeof Model).mongooseModel.updateOne(
        { _id: this.id },
        { [relation]: ids },
      );
    } else {
      const repo = AppDataSource.getRepository(this.constructor as typeof Model);
      const entity = await repo.findOne(this.id, { relations: [relation] });
      entity[relation] = related;
      await repo.save(entity);
    }
  }

  public static defineRelations(): void {}

  public static async get(id: string): Promise<Model> {
    if (process.env.DB_TYPE === 'mongodb') {
      const model = await (this as typeof Model).mongooseModel.findById(id);
      return model ? new (this as typeof Model)(model.toObject()) : null;
    } else {
      const repo = AppDataSource.getRepository(this as typeof Model);
      const entity = await repo.findOne(id);
      return entity;
    }
  }

  public static async getAll(): Promise<Model[]> {
    if (process.env.DB_TYPE === 'mongodb') {
      const models = await (this as typeof Model).mongooseModel.find();
      return models.map((m) => new (this as typeof Model)(m.toObject()));
    } else {
      const repo = getRepository(this as typeof Model);
      const entities = await repo.find();
      return entities;
    }
  }

  public static async query(query: string): Promise<any[]> {
    if (process.env.DB_TYPE === 'mongodb') {
      const connection = mongoose.connection;
      return connection.db.collection(this.collectionName()).find({}).toArray();
    } else {
      const repo = AppDataSource.getRepository(this as typeof Model);
      return repo.query(query);
    }
  }

  public static collectionName(): string {
    return (this as any).tableName();
  }

  protected static get mongooseModel(): MongooseModel<any, any, any> {
    const schema = (this as any).buildMongooseSchema();
    const modelName = (this as any).tableName();
    return mongoose.model(modelName, schema);
  }
}
