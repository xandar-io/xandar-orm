import { Model } from '../Model';

export class User extends Model {
  public id!: string;
  public name!: string;
  public email!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}