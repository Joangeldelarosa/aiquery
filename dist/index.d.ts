import { MongoClient } from "mongodb";
/**
 * ANCHOR: AIQuery
 * AIQuery is a class that simplifies the process of interacting with a MongoDB database
 * by allowing users to make advanced queries using natural language text. It utilizes
 * the OpenAI GPT-4 model to generate executable TypeScript code based on the given query,
 * roles, schemas, and database type, allowing for flexible and dynamic database interactions.
 *
 * The class requires an API key for OpenAI, a connected MongoClient instance, a set of JSON schemas, a list of allowed roles,
 * a database type, and any additional logic to be provided upon instantiation. The main functionality
 * is provided through the `processQuery` method, which takes a natural language query
 * as input and returns the result of the database operation.
 *
 * The process involves creating a detailed and specific prompt for GPT-4 based on the
 * input query, schemas, roles, database type, and additional logic. The AI model then generates
 * a TypeScript code snippet that performs the desired database operation using the provided
 * schemas and connection. The generated code is validated and executed using either eval or vm2,
 * and the result is returned to the user.
 *
 * AIQuery provides a powerful and flexible solution for performing complex database
 * operations using natural language queries while ensuring that role-based access
 * controls are respected.
 * @param apiKey - The API key for OpenAI
 * @param client - A connected MongoClient instance
 * @param schemas - A JSON object containing the schemas for the database
 * @param roles - A list of allowed roles
 * @param apiModel - The API model for OpenAI (default: "text-davinci-003")
 * @param dbName - The name of the database (default: "default")
 * @param additionalLogic - Any additional logic to be provided to the AI model (default: "None")
 * @example const query = new AIQuery(apiKey, client, schemas, ["admin", "user"], "mongodb", "default", "None");
 */
declare class AIQuery {
    private openai;
    private client;
    private schemas;
    private roles;
    private apiModel;
    private dbName;
    private additionalLogic;
    constructor(apiKey: string, client: MongoClient, schemas: {
        [key: string]: any;
    }, roles: string[], apiModel?: string, dbName?: string, additionalLogic?: string);
    processQuery(query: string, role: string): Promise<any>;
    private isValidTypescript;
    private executeCodeSnippet;
}
export default AIQuery;
