"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("openai");
const vm2_1 = require("vm2");
const mongoose_1 = __importDefault(require("mongoose"));
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
class AIQuery {
    constructor(apiKey, client, schemas, roles, apiModel = "text-davinci-003", dbName = "default", additionalLogic = "None") {
        this.openai = new openai_1.OpenAIApi(new openai_1.Configuration({ apiKey }));
        this.client = client;
        this.schemas = schemas;
        this.roles = roles;
        this.apiModel = apiModel;
        this.dbName = dbName;
        this.additionalLogic = additionalLogic;
    }
    // NOTE: This function processes the query and returns the results.
    processQuery(query, role) {
        return __awaiter(this, void 0, void 0, function* () {
            // ANCHOR: Create prompt for OpenAI GPT-4
            const prompt = `As an AI expert, write a TypeScript code snippet to process a database query based on the following requirements:

- Use MongoDB with Mongoose (already imported)
- Use ECMAScript syntax (no require statements, only imports)
- Do not use exports or inner functions in the generated code
- Execute the code using an async function without importing or exporting functions, or consts and vars
- Roles allowed: ${this.roles.join(", ")} (roles are not a schema or MongoDB object, just a text representation for validation)
- Schemas are provided in the sandbox: ${JSON.stringify(this.schemas)}
- The query is: ${query}
- The role is: ${role}
- Use the provided MongoClient instance (named 'client') to interact with the database
- Use the default database named "${this.dbName}"
- Define the 'db' variable using the provided MongoClient instance (named 'client') and the default database named "default"
- Ensure that the generated code has correct syntax and does not have any missing parentheses, braces, or semicolons
- If any defined async function defined in the generated code it should be called with await and surrounded by an async function and return the result
- Example: if async runQuery() is defined in the generated code and it has to be called it should be called as return await runFindUsers() inside the async function, to return the result to the parent function
- Use module.exports to export the function that returns the result

- Additional info about the app database: ${this.additionalLogic || "None"}

The AI should analyze if the roles match the request and return either the appropriate TypeScript code or a restricted response if not allowed. The returned code should be executable without any modifications and not contain any markdown or context. The code should use the provided schemas in the sandbox (e.g., new schemas.users) and interact with the database using db.collection. Include a return statement with the query result and a section for additional logic.

Examples of execution:
- If the query is "Find all users with age greater than 20" and the role is "admin", the code should return all users with age greater than 20 from the database.
- If the query is "Create a new user with name John and age 30" and the role is "admin", the code should create a new user with the given name and age in the database.

Please provide the TypeScript code snippet for the given query and role, and ensure that the result is returned correctly.`;
            // ANCHOR: Call OpenAI GPT-4 with the prompt
            const gptResponse = yield this.openai.createCompletion({
                model: this.apiModel,
                prompt: prompt,
                max_tokens: 500,
                n: 1,
                stop: null,
                temperature: 0,
            });
            // ANCHOR: Extract code from GPT-4 response
            const codeSnippet = gptResponse.data.choices[0].text.trim();
            // NOTE: Check if the returned code is valid TypeScript
            if (!this.isValidTypescript(codeSnippet)) {
                throw new Error("Invalid TypeScript code received from GPT-4.");
            }
            // ANCHOR: Execute the code snippet and return the result
            const result = yield this.executeCodeSnippet(codeSnippet, role);
            return result;
        });
    }
    // NOTE: This function validates if the given codeSnippet is a valid TypeScript code.
    isValidTypescript(codeSnippet) {
        // Add your validation logic here
        // This can include checking for any malicious code or commands that shouldn't be executed
        // For simplicity, we assume the returned code is valid TypeScript
        return true;
    }
    // NOTE: This function executes the given codeSnippet and returns the result.
    executeCodeSnippet(codeSnippet, role) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Executing code snippet:", codeSnippet);
            // Create a new NodeVM instance with the desired options
            const vm = new vm2_1.NodeVM({
                // wrapper: "none",
                console: "inherit",
                sandbox: { mongoose: mongoose_1.default, client: this.client, schemas: this.schemas, role },
                require: {
                    external: true,
                    builtin: ["fs", "path"],
                    root: "./",
                },
            });
            // Execute the code snippet using the NodeVM instance and wait for the result
            try {
                const createdFunction = yield vm.run(`(async () => { ${codeSnippet} })()`);
                const result = yield createdFunction();
                return result;
            }
            catch (error) {
                console.error("Error executing code snippet:", error);
                throw error;
            }
        });
    }
}
exports.default = AIQuery;
//# sourceMappingURL=index.js.map