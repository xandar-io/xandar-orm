# Xandar ORM
Xandar ORM Package is a lightweight and easy-to-use ORM (Object-Relational Mapping) package for TypeORM. It provides a simple and intuitive interface for performing CRUD operations on database records and includes support for relationships between tables.

## Installation
You can install Xandar ORM Package using `npm`:

```perl
npm install xandar-orm
```

## Usage

Here's an example of how to use Xandar ORM Package to define a `User` model:

```typescript
import { Column, Entity } from 'typeorm';
import { Model } from 'my-orm-package';

@Entity()
export class User extends Model {
  @Column()
  public name: string;

  @Column()
  public email: string;

  public static getFields(): object {
    return {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    };
  }
}

```

In this example, we've defined a `User` model that extends the `Model` class provided by Xandar ORM Package. We've also defined the name and email fields and overridden the getFields method to define the schema for the User model.

Here's an example of how to use Xandar ORM Package to perform CRUD operations on a User model:

```typescript
import { User } from './models/User';

// Create a new user
const user = new User();
user.name = 'John Doe';
user.email = 'john.doe@example.com';
await user.save();

// Get a user by ID
const user = await User.get(1);

// Update a user
user.name = 'Jane Doe';
await user.save();

// Delete a user
await user.delete();

```

In this example, we've created a new User object and saved it to the database using the save method. We've also retrieved a user by ID using the get method, updated the user's name, and deleted the user from the database using the delete method.

Xandar ORM Package also includes support for relationships between tables. Here's an example of how to define a Post model with a User relationship:

```typescript
import { Column, Entity, ManyToOne } from 'typeorm';
import { Model } from 'my-orm-package';
import { User } from './User';

@Entity()
export class Post extends Model {
  @Column()
  public title: string;

  @Column()
  public content: string;

  @ManyToOne(() => User, user => user.posts)
  public user: User;

  public static getFields(): object {
    return {
      title: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      user: {
        type: 'reference',
        model: User,
        required: true,
      },
    };
  }
}

```



In this example, we've defined a Post model with title and content fields, and a user relationship with the User model using the @ManyToOne decorator. We've also defined the schema for the Post model and included the user field as a reference to the User model.

Here's an example of how to use Xandar ORM Package to retrieve a post and its related user:

```typescript
import { Post } from './models/Post';

const post = await Post.get(1);
const user = await post.getRelated('user');
console.log(post, user);

```

In this example, we've retrieved a post by ID using the `get` method, and then retrieved the related user using the `getRelated` method.

Xandar ORM Package includes several other methods for working with related records, including `addRelated`, `removeRelated`, and `setRelated`.

## API

### Model

The `Model` class provides a base implementation for all database models. It includes several methods for performing CRUD operations on records in the database.

#### Properties

- `id` (`number`) - The primary key of the record.
- `createdAt` (`Date`) - The date and time the record was created.
- `updatedAt` (`Date`) - The date and time the record was last updated.

#### Methods

- `async save(): Promise<Model>` - Saves the record to the database.
- `async delete(): Promise<void>` - Deletes the record from the database.
- `static async get(id: number): Promise<Model>` - Retrieves a record by its primary key.
- `static async getAll(): Promise<Model[]>` - Retrieves all records for the model.
- `static async query(query: string): Promise<any[]>` - Executes a raw SQL query against the database.
- `static getFields(): object` - Returns an object representing the schema for the model.

### RelatedModel

The `RelatedModel` class provides a base implementation for all models that have relationships to other models. It includes several methods for working with related records.

#### Methods

- `async getRelated(modelName: string): Promise<Model | Model[]>` - Retrieves the related record or records for the specified model.
- `async addRelated(modelName: string, related: Model | Model[]): Promise<void>` - Adds a related record or records for the specified model.
- `async removeRelated(modelName: string, related: Model | Model[]): Promise<void>` - Removes a related record or records for the specified model.
- `async setRelated(modelName: string, related: Model | Model[]): Promise<void>` - Sets the related record or records for the specified model.

## License

Xandar ORM Package is open source software licensed under the MIT license.

## Contributions

Contributions are welcome! If you find a bug or would like to add a new feature, please open an issue or submit a pull request.