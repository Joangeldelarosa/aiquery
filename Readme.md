# AIQuery

AIQuery is a powerful TypeScript library that simplifies the process of interacting with a MongoDB database by allowing users to make advanced queries using natural language text. It utilizes the OpenAI GPT-3 model by default to generate executable TypeScript code based on the given query, roles, schemas, and database type, allowing for flexible and dynamic database interactions.

## Features

- Perform complex database operations using natural language queries
- Role-based access control for secure and controlled database interactions
- Utilizes OpenAI GPT-3 model by default for code generation
- Supports MongoDB with Mongoose
- Easily extensible for different databases and AI models in the future

## Installation

```bash
npm install aiquery
```

## Usage

```typescript
import { MongoClient } from 'mongodb'
import AIQuery from 'aiquery'

// Connect to your MongoDB instance
const client = new MongoClient('mongodb://localhost:27017')
await client.connect()

// Define your schemas and roles
const schemas = {
  users: {
    name: String,
    age: Number
  }
}

const roles = ['admin', 'user']

// Instantiate AIQuery
const apiKey = 'your_openai_api_key'
const query = new AIQuery(
  apiKey,
  client,
  schemas,
  roles,
  'mongodb',
  'default',
  'None'
)

// Process a natural language query
const result = await query.processQuery(
  'Find all users with age greater than 20',
  'admin'
)
console.log(result)
```

## Future Updates

- Support for different databases and AI models
- Improved validation and security for generated code
- Enhanced error handling and debugging

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue to discuss any improvements or suggestions.

## License

AIQuery is released under the MIT License.
