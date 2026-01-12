This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.github/
  workflows/
    build.yml
    release.yml
.palantir/
  autorelease.yml
example-module/
  src/
    index.ts
  .dockerignore
  Dockerfile
  package.json
  tsconfig.json
typescript-compute-module/
  src/
    api/
      tests/
        convertJsonSchemaToCustomSchema.test.ts
      ComputeModuleApi.ts
      convertJsonSchematoFoundrySchema.ts
      schemaTypes.ts
    environment/
      types.ts
    resources/
      ResourceAliases.ts
    services/
      tests/
        services.test.ts
      getFoundryServices.ts
    sources/
      tests/
        SourceCredentials.test.ts
      SourceCredentials.ts
    ComputeModule.ts
    index.ts
    logger.ts
    QueryRunner.ts
  .npmignore
  jest.config.js
  LICENSE
  package.json
  tsconfig.json
.gitignore
LICENSE
package.json
README.md
```

# Files

## File: example-module/.dockerignore
````
# Include any files or directories that you don't want to be copied to your
# container here (e.g., local build artifacts, temporary files, etc.).
#
# For more help, visit the .dockerignore file reference guide at
# https://docs.docker.com/go/build-context-dockerignore/

**/.classpath
**/.dockerignore
**/.env
**/.git
**/.gitignore
**/.project
**/.settings
**/.toolstarget
**/.vs
**/.vscode
**/.next
**/.cache
**/*.*proj.user
**/*.dbmdl
**/*.jfm
**/charts
**/docker-compose*
**/compose.y*ml
**/Dockerfile*
**/node_modules
**/npm-debug.log
**/obj
**/secrets.dev.yaml
**/values.dev.yaml
**/build
LICENSE
README.md
````

## File: example-module/tsconfig.json
````json
{
  "compilerOptions": {
    "module": "Node16",
    "target": "ES6",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "strictNullChecks": true
  },
  "include": ["src/**/*"]
}
````

## File: typescript-compute-module/src/services/tests/services.test.ts
````typescript
import * as fs from "fs";
import { FoundryService, getFoundryServices } from "../getFoundryServices";

// Mocking the fs module
jest.mock("fs");

describe("getFoundryServices", () => {
  const mockYamlContent = `
    stream_proxy:
      - "https://stream-proxy.example.com"
    api_gateway:
      - "https://api-gateway.example.com"
    foundry_mio:
      - "https://mio.example.com"
    `;

  beforeEach(() => {
    (fs.readFileSync as jest.Mock).mockImplementation(() => mockYamlContent);
    process.env["FOUNDRY_SERVICE_DISCOVERY_V2"] =
      "mock/path/to/service-discovery.yaml";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should parse the YAML and return the services", () => {
    const services = getFoundryServices();

    expect(fs.readFileSync).toHaveBeenCalledWith(
      "mock/path/to/service-discovery.yaml",
      "utf-8"
    );
    expect(services).toEqual({
      [FoundryService.STREAM_PROXY]: "https://stream-proxy.example.com",
      [FoundryService.API_GATEWAY]: "https://api-gateway.example.com",
      [FoundryService.MIO]: "https://mio.example.com",
    });
  });

  it("should return cached services on subsequent calls", () => {
    // Subsequent call should use the cached services
    const services = getFoundryServices();

    expect(fs.readFileSync).toHaveBeenCalledTimes(0);
    expect(services).toEqual({
      [FoundryService.STREAM_PROXY]: "https://stream-proxy.example.com",
      [FoundryService.API_GATEWAY]: "https://api-gateway.example.com",
      [FoundryService.MIO]: "https://mio.example.com",
    });
  });
});
````

## File: typescript-compute-module/src/logger.ts
````typescript
export interface Logger {
  log: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
}

/**
 * Wraps a logger with an instance ID to differentiate logs from different instances if provided
 */
export const loggerToInstanceLogger = (
  logger: Logger,
  instanceId?: string
): Logger => {
  if (instanceId == null) {
    return logger;
  }
  return {
    log: (message: string) => logger.log(`[${instanceId}] ${message}`),
    error: (message: string) => logger.error(`[${instanceId}] ${message}`),
    info: (message: string) => logger.info(`[${instanceId}] ${message}`),
    warn: (message: string) => logger.warn(`[${instanceId}] ${message}`),
  };
};
````

## File: typescript-compute-module/.npmignore
````
src
example-module
````

## File: typescript-compute-module/jest.config.js
````javascript
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
};
````

## File: typescript-compute-module/LICENSE
````
MIT License

Copyright (c) 2024 Palantir

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

## File: .gitignore
````
node_modules
dist
````

## File: LICENSE
````
MIT License

Copyright (c) 2024 Palantir Technologies

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

## File: package.json
````json
{
    "name": "@palantir/typescript-compute-module-root",
    "version": "0.0.0",
    "private": true,
    "description": "Node.JS compatible implementation of the Palantir Compute Module specification.",
    "workspaces": [
        "typescript-compute-module"
    ],
    "dependencies": {},
    "author": "Palantir Technologies",
    "license": "MIT"
}
````

## File: .github/workflows/release.yml
````yaml
name: Publish Package to npmjs
on:
  release:
    types: [published]
jobs:
  publish:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: typescript-compute-module
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - name: Copy root-level markdown files
        run: cp ../*.md .
      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
````

## File: .palantir/autorelease.yml
````yaml
version: 3
options:
  repo_type: YARN
  # For a minor release, release manually
  only_increment_patch_version: true
````

## File: example-module/Dockerfile
````
# syntax=docker/dockerfile:1

ARG NODE_VERSION=18.18.0

FROM --platform=amd64 node:${NODE_VERSION} as builder

WORKDIR /usr/src/app

# Copy the local TypeScript compute module along with its package.json and package-lock.json
COPY typescript-compute-module/package*.json ./typescript-compute-module/
COPY typescript-compute-module/src ./typescript-compute-module/src

# Install dependencies for compute module
RUN cd typescript-compute-module && npm install

# Now copy the example-module files and install its dependencies
COPY example-module/package*.json ./example-module/
COPY example-module/src ./example-module/src

# Install example-module dependencies
RUN cd example-module && npm install
RUN cd example-module && npm run build

# Start a new stage for the production image
FROM --platform=amd64 node:${NODE_VERSION}

WORKDIR /usr/src/app

# Copy the built compute module and example-module from the builder stage
COPY --from=builder /usr/src/app/typescript-compute-module ./typescript-compute-module
COPY --from=builder /usr/src/app/example-module ./example-module

# Run the application as a non-root user
# Ensure this user exists or use a pre-existing non-root user
USER 5000

# Specify the command to run the application
CMD ["node", "example-module/dist/index.js"]
````

## File: example-module/package.json
````json
{
  "name": "example-module",
  "version": "1.0.0",
  "description": "",
  "main": "src/index.ts",
  "scripts": {
    "build": "esbuild src/index.ts --bundle --platform=node --outfile=dist/index.js",
    "start": "node dist/index.js"
  },
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@palantir/compute-module": "../typescript-compute-module/src",
    "@sinclair/typebox": "^0.32.35",
    "esbuild": "^0.23.0"
  },
  "devDependencies": {
    "@types/node": "^22.5.4"
  }
}
````

## File: typescript-compute-module/src/resources/ResourceAliases.ts
````typescript
import * as fs from "fs";

export interface ResourceAliasesFile {
  [alias: string]: Resource;
}

export interface Resource {
  rid: string;
  branch?: string;
}

export class ResourceAliases {
  private _resourceAliases: ResourceAliasesFile | null = null;

  constructor(private resourceAliasesPath: string) {}

  public getAlias(alias: string): Resource | null {
    return this.resourceAliases?.[alias] ?? null;
  }

  private get resourceAliases(): ResourceAliasesFile {
    return (this._resourceAliases ??= JSON.parse(
      fs.readFileSync(this.resourceAliasesPath, "utf-8")
    ));
  }
}
````

## File: typescript-compute-module/src/services/getFoundryServices.ts
````typescript
import yaml from "js-yaml";
import fs from "fs";

export enum FoundryService {
  /**
   * Used to push streaming records to Foundry, read more at https://www.palantir.com/docs/foundry/data-connection/push-based-ingestion/
   * This will likely be formatted as: `https://my-instance.palantirfoundry.com/stream-proxy/api`
   */
  STREAM_PROXY = "stream_proxy",
  /**
   * Used for access to the Foundry API as documented at https://www.palantir.com/docs/foundry/api/general/overview/introduction/
   * This will likely be formatted as: `https://my-instance.palantirfoundry.com/api`
   */
  API_GATEWAY = "api_gateway",
  /**
   * Used to interact with Foundry's media sets, see https://www.palantir.com/docs/foundry/data-integration/media-sets/
   * This will likely be formatted as: `https://my-instance.palantirfoundry.com/mio/api`
   */
  MIO = "foundry_mio",
}

let cachedServices: Record<FoundryService, string | undefined> | null = null;
/**
 * Used to discover the location of Foundry services for interaction with the Foundry API
 */
export const getFoundryServices = () => {
  if (cachedServices == null) {
    const serviceDiscoveryFileContents = fs.readFileSync(
      process.env["FOUNDRY_SERVICE_DISCOVERY_V2"] as string,
      "utf-8"
    );
    const serviceDiscoveryYaml = yaml.load(serviceDiscoveryFileContents) as {
      [id: string]: [string];
    };
    cachedServices = Object.fromEntries(
      Object.entries(serviceDiscoveryYaml).map(([key, value]) => [
        key,
        value[0],
      ])
    ) as Record<FoundryService, string | undefined>;
  }
  return cachedServices;
};
````

## File: typescript-compute-module/src/index.ts
````typescript
export { ComputeModule } from "./ComputeModule";
export type { ComputeModuleOptions } from "./ComputeModule";
export type { Logger } from "./logger";
export { FoundryService } from "./services/getFoundryServices";
````

## File: typescript-compute-module/tsconfig.json
````json
{
  "compilerOptions": {
    "module": "Node16",
    "target": "ES6",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
  },
  "include": ["src/**/*", "typescript-compute-module/fs"]
}
````

## File: .github/workflows/build.yml
````yaml
name: Build and test package
on:
  push:
    branches:
      - develop
      - 'feature/*'
  pull_request:
    branches:
      - develop

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
        run:
          working-directory: typescript-compute-module
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build project
        run: npm run build
````

## File: typescript-compute-module/src/sources/tests/SourceCredentials.test.ts
````typescript
import { Logger } from "../../logger";
import { SourceCredentials, SourceCredentialsFile } from "../SourceCredentials";
import * as fs from "fs";

// Mock the cacheReadFileSync function
jest.mock("fs");

describe("SourceCredentials", () => {
  const mockCredentialPath = "/path/to/credentials.json";
  let mockCredentials: SourceCredentialsFile;

  beforeEach(() => {
    mockCredentials = {
      api1: { key1: "value1", key2: "value2" },
      api2: { key1: "value3" },
    };

    (fs.readFileSync as jest.Mock).mockImplementation(() =>
      JSON.stringify(mockCredentials)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the correct credential for a given source and credential name", () => {
    const sourceCredentials = new SourceCredentials(mockCredentialPath);
    const credential = sourceCredentials.getCredential("api1", "key1");
    expect(credential).toBe("value1");
  });

  it("should return null if the source does not exist", () => {
    const sourceCredentials = new SourceCredentials(mockCredentialPath);
    const credential = sourceCredentials.getCredential(
      "nonexistentApi",
      "key1"
    );
    expect(credential).toBeNull();
  });

  it("should return null if the credential name does not exist for a given source", () => {
    const sourceCredentials = new SourceCredentials(mockCredentialPath);
    const credential = sourceCredentials.getCredential(
      "api1",
      "nonexistentKey"
    );
    expect(credential).toBeNull();
  });

  it("should only call fs.readFileSync once and cache the result", () => {
    const sourceCredentials = new SourceCredentials(mockCredentialPath);
    sourceCredentials.getCredential("api1", "key1");
    sourceCredentials.getCredential("api1", "key2");
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
  });

  it("should log all the credentials without passwords", () => {
    const mockLogger = {
      log: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    } as Logger;
    const sourceCredentials = new SourceCredentials(
      mockCredentialPath,
      mockLogger
    );
    sourceCredentials.getCredential("api1", "key1");
    sourceCredentials.getCredential("api1", "key2");

    expect(mockLogger.log).toHaveBeenCalledTimes(1);
    const loggedMessage = (mockLogger.log as jest.Mock).mock.calls[0][0];
    expect(loggedMessage).toContain("Loaded credentials");

    expect(loggedMessage).toContain("api1");
    expect(loggedMessage).toContain("key1");
    expect(loggedMessage).not.toContain("value");
  });
});
````

## File: typescript-compute-module/src/sources/SourceCredentials.ts
````typescript
import { Logger } from "../logger";
import * as fs from "fs";

export interface SourceCredentialsFile {
  [source: string]: {
    [credential: string]: string;
  };
}

export class SourceCredentials {
  private _sourceCredentials: SourceCredentialsFile | null = null;

  constructor(private credentialPath: string, private logger?: Logger) {}

  public getCredential(
    sourceApiName: string,
    credentialName: string
  ): string | null {
    return this.sourceCredentials[sourceApiName]?.[credentialName] ?? null;
  }

  public hasSource(sourceApiName: string): boolean {
    return this.sourceCredentials[sourceApiName] != null;
  }

  private get sourceCredentials(): SourceCredentialsFile {
    return (this._sourceCredentials ??= this.loadSourceCredentials());
  }

  private loadSourceCredentials(): SourceCredentialsFile {
    const content = JSON.parse(
      fs.readFileSync(this.credentialPath, "utf-8")
    ) as SourceCredentialsFile;
    this.logger?.log(
      `Loaded credentials: ${JSON.stringify(
        mapValues(content, obfuscateValues)
      )}`
    );
    return content;
  }
}

function mapValues<T, V>(
  object: { [id: string]: V },
  mapper: (value: V) => T
): { [id: string]: T } {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => [key, mapper(value)])
  );
}

function obfuscateValues(obj: Record<string, string>) {
  return Object.fromEntries(Object.keys(obj).map((key) => [key, "****"]));
}
````

## File: typescript-compute-module/src/api/tests/convertJsonSchemaToCustomSchema.test.ts
````typescript
import { Type } from "@sinclair/typebox";
import { convertJsonSchemaToCustomSchema } from "../convertJsonSchematoFoundrySchema";

const EXAMPLE_DEFINITION = {
  isFirstName: {
    input: Type.Object({
      firstName: Type.String(),
    }),
    output: Type.Boolean(),
  },
};

const CHAT_DEFINITION = {
  chat: {
    input: Type.Object({
      messages: Type.Array(
        Type.Object({
          role: Type.String(),
          content: Type.String(),
        })
      ),
      temperature: Type.Number(),
      max_tokens: Type.Number(),
      optionalField: Type.Optional(Type.String())
    }),
    output: Type.Object({
      messages: Type.Array(Type.String()),
    }),
  },
};

describe("Type tests", () => {
  it("should have the same types as a simple definition", () => {
    const schema = convertJsonSchemaToCustomSchema(
      "isFirstName",
      EXAMPLE_DEFINITION.isFirstName.input,
      EXAMPLE_DEFINITION.isFirstName.output
    );
    expect(schema).toStrictEqual({
      functionName: "isFirstName",
      inputs: [
        {
          name: "firstName",
          required: true,
          dataType: {
            type: "string",
            string: {},
          },
          constraints: [],
        },
      ],
      output: {
        type: "single",
        single: {
          dataType: {
            type: "boolean",
            boolean: {},
          },
        },
      },
    });
  });

  it("should have the same types as a chat definition", () => {
    const schema = convertJsonSchemaToCustomSchema(
      "chat",
      CHAT_DEFINITION.chat.input,
      CHAT_DEFINITION.chat.output
    );
    expect(schema).toStrictEqual({
      functionName: "chat",
      inputs: [
        {
          name: "messages",
          required: true,
          dataType: {
            type: "list",
            list: {
              elementsType: {
                type: "anonymousCustomType",
                anonymousCustomType: {
                  fields: {
                    role: {
                      type: "string",
                      string: {},
                    },
                    content: {
                      type: "string",
                      string: {},
                    },
                  },
                },
              },
            },
          },
          constraints: [],
        },
        {
          name: "temperature",
          required: true,
          dataType: {
            type: "float",
            float: {},
          },
          constraints: [],
        },
        {
          name: "max_tokens",
          required: true,
          dataType: {
            type: "float",
            float: {},
          },
          constraints: [],
        },
        {
          name: "optionalField",
          required: false,
          dataType: {
            type: "optionalType",
            optionalType: {
              wrappedType: {
                type: "string",
                string: {}
              }
            }
          },
          constraints: [],
        }
      ],
      output: {
        type: "single",
        single: {
          dataType: {
            type: "anonymousCustomType",
            anonymousCustomType: {
              fields: {
                messages: {
                  type: "list",
                  list: {
                    elementsType: {
                      type: "string",
                      string: {},
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  });
});
````

## File: typescript-compute-module/src/api/convertJsonSchematoFoundrySchema.ts
````typescript
import {
  TObject,
  TBoolean,
  TInteger,
  TNumber,
  TString,
  TArray,
  TSchema,
  TypeGuard,
} from "@sinclair/typebox";
import { Schema } from "./schemaTypes";

export type SupportedTypeboxTypes =
  | TObject
  | TBoolean
  | TInteger
  | TNumber
  | TString
  | TArray;

// Function to convert JSON Schema to our custom Schema type
export function convertJsonSchemaToCustomSchema(
  schemaName: string,
  input: TObject | undefined,
  output: SupportedTypeboxTypes
): Schema {
  return {
    functionName: schemaName,
    inputs: input != null ? Object.keys(input.properties).map((key) => ({
      name: key,
      required: input.required?.includes(key) ?? false,
      dataType: convertJsonType(input.properties[key]),
      constraints: [],
    })) : [],
    output: {
      type: "single",
      single: { dataType: convertJsonType(output) },
    }
  };
}

function convertJsonType(jsonType: TSchema): Schema.DataType {
  if (TypeGuard.IsOptional(jsonType)) {
    return {
      type: "optionalType",
      optionalType: {
        wrappedType: convertJsonType(jsonType.type)
      }
    }
  }
  else if (TypeGuard.IsObject(jsonType)) {
    return {
      type: "anonymousCustomType",
      anonymousCustomType: {
        fields: Object.keys(jsonType.properties).reduce(
          (acc, key) => ({
            ...acc,
            [key]: convertJsonType(jsonType.properties[key]),
          }),
          {}
        ),
      },
    }
  } else if (TypeGuard.IsArray(jsonType)) {
    return {
      type: "list",
      list: {
        elementsType: convertJsonType(jsonType.items),
      },
    };
  } else if (TypeGuard.IsBoolean(jsonType)) {
    return { type: "boolean", boolean: {} };
  } else if (TypeGuard.IsInteger(jsonType)) {
    return { type: "integer", integer: {} };
  } else if (TypeGuard.IsNumber(jsonType)) {
    return { type: "float", float: {} };
  } else if (TypeGuard.IsString(jsonType)) {
    return { type: "string", string: {} };
  } else {
    // Default to string on failure
    return { type: "string", string: {} };
  }
}
````

## File: typescript-compute-module/src/api/schemaTypes.ts
````typescript
export interface Schema {
  functionName: string;
  inputs: Schema.FunctionInputType[]
  output: Schema.FunctionOutputType;
}

export namespace Schema {

  export interface FunctionInputType {
    name: string;
    required: boolean;
    description?: string;
    dataType: DataType;
    // Required for the query to be valid
    constraints: [];
  }

  export interface FunctionOutputType {
    type: "single";
    single: {
      dataType: DataType;
    }
  }

  export type DataType = BooleanType | IntegerType | FloatType | StringType | ListType | AnonymousCustomType | OptionalType;

  export type BooleanType = {
    type: "boolean";
    boolean: {};
  };

  export type IntegerType = {
    type: "integer";
    integer: {};
  };

  export type FloatType = {
    type: "float";
    float: {};
  };

  export type StringType = {
    type: "string";
    string: {};
  };

  export type ListType = {
    type: "list";
    list: {
      elementsType: DataType;
    };
  }

  export type AnonymousCustomType = {
      type: "anonymousCustomType";
      anonymousCustomType: {
        fields: {
          [key: string]: DataType;
        }
      };
  }

  export type OptionalType = {
    type: "optionalType";
    optionalType: {
      wrappedType: DataType;
    }
  }
}
````

## File: typescript-compute-module/src/environment/types.ts
````typescript
import { FoundryService } from "../services/getFoundryServices";

export type Environment = PipelinesEnvironment | FunctionsEnvironment;

export interface PipelinesEnvironment {
  type: "pipelines";
  buildToken: string;
}

export interface FunctionsEnvironment {
  type: "functions";
  /**
   * If the compute module is in Application mode, this will provide the client ID and client secret
   * for the third-party application that is being used to authenticate with Foundry.
   * 
   * These are provided by the environment variables CLIENT_ID and CLIENT_SECRET.
   */
  thirdPartyApplication?: {
    clientId: string;
    clientSecret: string;
  }
}
````

## File: example-module/src/index.ts
````typescript
import { ComputeModule, FoundryService } from "@palantir/compute-module";
import { Type } from "@sinclair/typebox";

const computeModule = new ComputeModule({
  logger: console,
  sources: {
    MyApi: {
      credentials: ["TestSecret"],
    },
    YourApi: {}
  },
  definitions: {
    chat: {
      input: Type.Object({
        messages: Type.Array(
          Type.Object({
            role: Type.String(),
            content: Type.String(),
          })
        ),
        temperature: Type.Number(),
        max_tokens: Type.Number(),
      }),
      output: Type.Object({
        messages: Type.Array(Type.String()),
      }),
    },
    getEnv: {
      input: Type.Object({}),
      output: Type.Object({
        SERVICE_HOST: Type.String(),
      }),
    },
    wait: {
      input: Type.Object({
        waitMs: Type.Number(),
        value: Type.Object({}),
      }),
      output: Type.Object({}),
    },
    getCredential: {
      input: Type.Object({
        source: Type.String(),
        key: Type.String(),
      }),
      output: Type.String(),
    },
    testEgress: {
      input: Type.Object({}),
      output: Type.String(),
    },
    openFile: {
      input: Type.Object({
        path: Type.String(),
      }),
      output: Type.String(),
    },
    testOutput: {
      input: Type.Object({}),
      output: Type.String(),
    },
    streamable: {
      input: Type.Object({}),
      output: Type.String(),
    }
  },
});

if (computeModule.environment.type === "pipelines") {
  console.log("Running in pipelines environment");
  console.log(
    "Build token length: ",
    computeModule.environment.buildToken.length
  );
  console.log(
    `Logging "input" and "output"`,
    computeModule.getResource("input"),
    computeModule.getResource("output")
  );
  console.log(
    `Logging credential "TestSecret" on "TestApi"`,
    computeModule.getCredential("MyApi", "TestSecret")
  );
  console.log(
    `Logging streamProxyApi location`,
    computeModule.getServiceApi(FoundryService.STREAM_PROXY)
  );
} else {
  computeModule
    .on("responsive", () => {
      console.log("[Example Module] Responsive");
    })
    .register("wait", async (v) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(v.value);
        }, v.waitMs);
      });
    })
    .register("getEnv", async () => {
      return {
        SERVICE_HOST: process.env.SERVICE_HOST ?? "Not found",
      };
    })
    .register("getCredential", async (v) => {
      return (
        (await computeModule.getCredential(v.source as "YourApi", v.key)) ?? "Not found"
      );
    })
    .register("openFile", async (v) => {
      const fileContents = require("fs").readFileSync(v.path, "utf-8");
      return fileContents;
    }).registerStreaming("streamable", (input, writeable) => {
      let count = 10;
      let interval = setInterval(() => {
        writeable.write("Hello, World!");
        count--;
        if (count === 0) {
          clearInterval(interval);
          writeable.end();
        }
      }, 1000);
    })
    .register("chat", async (v) => {
      return {
        messages: v.messages.map((m) => `${m.role}: ${m.content}`),
      };
    });
}
````

## File: typescript-compute-module/src/QueryRunner.ts
````typescript
import { HttpStatusCode, isAxiosError } from "axios";
import { Logger } from "./logger";
import { Static, TObject } from "@sinclair/typebox";
import {
  ComputeModuleApi,
  formatAxiosErrorResponse,
} from "./api/ComputeModuleApi";
import { SupportedTypeboxTypes } from "./api/convertJsonSchematoFoundrySchema";
import { PassThrough } from "stream";

export interface QueryResponseMapping {
  [queryType: string]: {
    input: TObject;
    output: SupportedTypeboxTypes;
  };
}

export type QueryListener<M extends QueryResponseMapping> =
  | {
      type: "response";
      listener: ResponseQueryListener<M>;
    }
  | {
      type: "streaming";
      listener: StreamingQueryListener<M>;
    };

export type StreamingQueryListener<M extends QueryResponseMapping> = <
  T extends keyof M
>(
  message: Static<M[T]["input"]>,
  responseStream: {
    write: (chunk: Buffer | Uint8Array | string) => void;
    end: () => void;
  }
) => void;

export type ResponseQueryListener<M extends QueryResponseMapping> = <
  T extends keyof M
>(
  message: Static<M[T]["input"]>
) => Promise<Static<M[T]["output"]>>;

export class QueryRunner<M extends QueryResponseMapping> {
  private isResponsive = false;

  private responsiveEventListeners: Set<() => void> = new Set();

  constructor(
    private readonly listeners: Partial<{
      [K in keyof M]: QueryListener<Pick<M, K>>;
    }>,
    private defaultListener?: (query: any, queryType: string) => Promise<any>,
    private readonly logger?: Logger
  ) {}

  async run(computeModuleApi: ComputeModuleApi) {
    while (true) {
      try {
        const jobRequest = await computeModuleApi.getJobRequest();

        if (
          !this.isResponsive &&
          jobRequest.status.toString().startsWith("2")
        ) {
          // If this is the first job, set the module as responsive
          this.setResponsive();
        }

        if (jobRequest.status === HttpStatusCode.Ok) {
          const { query, queryType, jobId } =
            jobRequest.data.computeModuleJobV1;
          this.logger?.info(`Job received - ID: ${jobId} Query: ${queryType}`);
          const listener = this.listeners[queryType];

          if (listener?.type === "response") {
            listener
              .listener(query)
              .then((response) => computeModuleApi.postResult(jobId, response))
              .catch((error) => {
                this.logger?.error(`Error executing job - ID: ${jobId} Reason: ${error}`);
                computeModuleApi.postResult(jobId, QueryRunner.getFailedQueryResult(error));
              });
          } else if (listener?.type === "streaming") {
            const writable = new PassThrough();
            listener.listener(query, writable);
            computeModuleApi.postStreamingResult(jobId, writable);
          } else if (this.defaultListener != null) {
            this.defaultListener(query, queryType).then((response) =>
              computeModuleApi.postResult(
                jobId,
                // Convert number to string as per response spec
                typeof response === "number" ? response.toString() : response
              )
            );
          } else {
            this.logger?.error(`No listener for query type: ${queryType}`);
          }
        }
      } catch (e) {
        if (!isAxiosError(e)) {
          this.logger?.error(`Error running module: ${e}`);
          continue;
        }
        if (!this.isResponsive && e.code === "ECONNREFUSED") {
          continue;
        }
        this.logger?.error(
          `Error running module - Network Error: ${formatAxiosErrorResponse(e)}`
        );
      }
    }
  }

  public on(_eventName: "responsive", listener: () => void) {
    if (this.isResponsive) {
      listener();
    } else {
      this.responsiveEventListeners.add(listener);
    }
  }

  private setResponsive() {
    this.isResponsive = true;
    this.responsiveEventListeners.forEach((listener) => listener());
  }

  public updateDefaultListener(
    defaultListener: (query: any, queryType: string) => Promise<any>
  ) {
    this.defaultListener = defaultListener;
  }

  private static getFailedQueryResult(error: any): Record<string, string> {
    return { "error": error.toString(),
             ...(error instanceof Error &&
              { "error": error.name, "reason": error.message })
    };
  }
}
````

## File: typescript-compute-module/src/api/ComputeModuleApi.ts
````typescript
import https from "https";
import { Schema } from "./schemaTypes";
import axios, { AxiosError } from "axios";
import { Writable } from "stream";

export interface ConnectionInformation {
  getJobUri: string; // GET_JOB_URI
  postResultUri: string; // POST_RESULT_URI
  postSchemaUri: string; // POST_SCHEMA_URI
  trustStore: string | undefined; // File contents at DEFAULT_CA_PATH
  moduleAuthToken: string; // MODULE_AUTH_TOKEN
}

/**
 * API for interacting with the runtime.
 */
export class ComputeModuleApi {
  private axiosInstance: axios.AxiosInstance;

  constructor(private connectionInformation: ConnectionInformation) {
    this.axiosInstance = axios.create({
      httpsAgent: new https.Agent({
        ca: this.connectionInformation.trustStore,
      }),
      headers: {
        "Module-Auth-Token": this.connectionInformation.moduleAuthToken,
      },
    });
  }

  public getJobRequest = () =>
    this.axiosInstance.get<{
      type: "computeModuleJobV1";
      computeModuleJobV1: {
        jobId: string;
        queryType: string;
        query: any;
      };
    }>(this.connectionInformation.getJobUri);

  public postResult = <ResponseType>(jobId: string, response: ResponseType) =>
    this.axiosInstance.post(
      this.connectionInformation.postResultUri + "/" + jobId,
      JSON.stringify(response),
      {
        headers: {
          "Content-Type": "application/octet-stream",
        },
      }
    );

  public postStreamingResult = (jobId: string, response: Writable) => {
    this.axiosInstance.post(
      this.connectionInformation.postResultUri + "/" + jobId,
      response,
      {
        headers: {
          "Content-Type": "application/octet-stream",
        },
      }
    );
  }
 

  public postSchema = (schemas: Schema[]) =>
    this.axiosInstance.post(this.connectionInformation.postSchemaUri, schemas, {
      headers: {
        "Content-Type": "application/json",
      }
    });
}

export function formatAxiosErrorResponse(error: AxiosError){
  return `
    Error running module - Network Error: ${error.response?.status}
    Status: ${error.status}
    Message: ${error.message}
    StatusText: ${error.response?.statusText}
    Data:
    ${JSON.stringify(error.response?.data, null, 2)}
  `
}
````

## File: README.md
````markdown
# @palantir/compute-module

[![npm version](https://img.shields.io/npm/v/@palantir%2Fcompute-module?style=flat)](https://www.npmjs.com/package/@palantir/compute-module)

Node.JS compatible implementation of the Palantir Compute Module specification.

- [@palantir/compute-module](#palantircompute-module)
  - [Functions Mode](#functions-mode)
    - [Basic usage](#basic-usage)
    - [Streaming usage](#streaming-usage)
    - [Schema registration](#schema-registration)
  - [Pipelines Mode](#pipelines-mode)
    - [Retrieving aliases](#retrieving-aliases)
  - [General usage](#general-usage)
    - [Retrieving source credentials](#retrieving-source-credentials)
    - [Retrieving environment details](#retrieving-environment-details)
    - [Retrieving Foundry services](#retrieving-foundry-services)
  - [Developing the SDK](#developing-the-sdk)
    - [Building the example module](#building-the-example-module)

## Functions Mode

### Basic usage

This library can be used untyped with vanilla JavaScript to generate registerable functions in "Functions" execution mode.

```js
import { ComputeModule } from "@palantir/compute-module";

new ComputeModule()
  .register("addOne", async ({ value }) => ({ value: n + 1 }));
  .register("stringify", async ({ n }) => "" + n)
  .default(() => ({ error: "Unsupported query name" }));
```

### Streaming usage

You can stream responses back from the compute module, rather than all at once. Type safety is not provided on the response here as the SDK cannot validate that the stream was of the correct type, we recommend that you only set your return value to String in these cases.

```ts
import { ComputeModule } from "@palantir/compute-module";

new ComputeModule()
  .registerStreaming("hello", async ({ world }, writeable: Writeable) => {
    writeable.write("Hello");
    writeable.write(world);
    writeable.end();
  });
  .default(() => ({ error: "Unsupported query name" }));
```

### Schema registration

Definitions can be generated using [typebox](https://github.com/sinclairzx81/typebox) allowing the Compute Module to register functions at runtime, while maintaining typesafety at compile time.

```ts
import { ComputeModule } from "@palantir/compute-module";
import { Type } from "@sinclair/typebox";

const myModule = new ComputeModule({
  logger: console,
  definitions: {
    addOne: {
      input: Type.Object({
        value: Type.Number(),
      }),
      output: Type.Object({ value: Type.Number() }),
    },
  },
});

myModule.register("addOne", async ({ value }) => ({ value: n + 1 }));
```

## Pipelines Mode

### Retrieving aliases

Compute Modules can interact with resources in their execution environment, within Palantir Foundry these are defined as inputs and outputs on the Compute Module spec. Resource identifiers can be unique to the execution environment, so using aliases allows your code to maintain a static reference to known resources. To receive the identifier for an aliases resource, use the `getResource` method.

```ts
import { ComputeModule } from "@palantir/compute-module";

const resourceId = ComputeModule.getResource("myResourceAlias");
const result = await someDataFetcherForId(resourceId);
```

## General usage

The following features are available in both Pipelines and Functions mode in order to interact with Palantir Foundry:

### Retrieving source credentials

Sources can be used to store secrets for use within a Compute Module, they prevent you from having to put secrets in your container or in plaintext in the job specification. Retrieving a source credential using this library is simple:

```ts
const myCredential = myModule.getCredential("MySourceApiName", "MyCredential");
```

Sources can be validated on startup by declaring them in the compute module options:

```ts
const myModule = new ComputeModule({
  // Will throw if MyApi with credential MyCredential has not been mounted
  sources: {
    MyApi: {
      credentials: ["MyCredential"]
    },
    // You can validate the source, without validating the credential
    AnotherApi: {}
  }
});

// ❌ Will throw a type error
myModule.getCredential("YourApi", "YourCredential");
myModule.getCredential("YourApi", "MyCredential");
myModule.getCredential("MyApi", "YourCredential");

// ✅ Passes type checking
myModule.getCredential("MyApi", "MyCredential");

// ✅ As there are no known credentials, any string can be passed to this source
myModule.getCredential("AnotherApi", "AnyString");
```

If not provided, getCredential will do no type validation compile-time and the instance will not validate at run-time.

### Retrieving environment details

At runtime, you can retrieve details about the execution environment, which is useful for authenticating around services available:

```ts
import { ComputeModule } from "@palantir/compute-module";

const environment = ComputeModule.getEnvironment();
const buildToken =
  environment.type === "pipelines" ? environment.buildToken : undefined;

const thirdPartyApplicationCredentials = environment.type === "functions" ? environment.thirdPartyApplication : undefined;
```

### Retrieving Foundry services

At runtime, you can retrieve the api paths for known Foundry services, this allows you to call those endpoints without using a source to ingress back into the platform:

```ts
import { FoundryService } from "@palantir/compute-module";

const streamProxyApi = myModule.getServiceApi(FoundryService.STREAM_PROXY);
```

## Developing the SDK

### Building the example module

Run docker build from the top-level directory (not example-module):

```sh
docker build -f example-module/Dockerfile -t my-container-registry.palantirfoundry.com/example-module:0.0.1 .
```
````

## File: typescript-compute-module/src/ComputeModule.ts
````typescript
import { Logger, loggerToInstanceLogger } from "./logger";
import {
  QueryResponseMapping,
  QueryRunner,
  QueryListener,
} from "./QueryRunner";
import {
  ComputeModuleApi,
  formatAxiosErrorResponse,
} from "./api/ComputeModuleApi";
import { convertJsonSchemaToCustomSchema } from "./api/convertJsonSchematoFoundrySchema";
import { Static } from "@sinclair/typebox";
import { SourceCredentials } from "./sources/SourceCredentials";
import { Resource, ResourceAliases } from "./resources/ResourceAliases";
import { Environment } from "./environment/types";
import {
  FoundryService,
  getFoundryServices,
} from "./services/getFoundryServices";
import * as fs from "fs";
import { isAxiosError } from "axios";

export interface ComputeModuleOptions<
  M extends QueryResponseMapping = any,
  S extends string = string
> {
  /**
   * Definitions for the queries that the module will respond to, defined using typebox.
   * @example
   * ```typescript
   * import { Type } from "@sinclair/typebox";
   * const definitions = {
   *    "isFirstName": {
   *        input: Type.String(),
   *        output: Type.Boolean(),
   *      },
   * };
   * ```
   *
   * If not provided, functions will not be autoregistered and typesafety will not be provided.
   */
  definitions?: M;
  /**
   * Logger to use for logging, if not provided, no logging will be done.
   * This interface accepts console, winston, or any other object that has the same methods as console.
   */
  logger?: Logger;
  /**
   * Instance ID to use for logging, if not provided no instance ID will be added
   */
  instanceId?: string;
  /**
   * If the module should automatically register queries with the runtime, defaults to true.
   *
   * Can be set to false to enable typesafety without registering the queries.
   */
  isAutoRegistered?: boolean;
  /**
   * Expected sources to be mounted on the module, if provided will throw an error if the sources are not mounted.
   */
  sources?: {
    [K in S]: SourceOptions;
  };
}

type SourceOptions<S extends string = string> = {
  credentials?: S[];
};

const resourceAliasMapPath = process.env["RESOURCE_ALIAS_MAP"];
const resourceAliases =
  resourceAliasMapPath != null
    ? new ResourceAliases(resourceAliasMapPath)
    : null;
export class ComputeModule<const O extends ComputeModuleOptions> {
  // Environment variables
  private static GET_JOB_URI = "GET_JOB_URI";
  private static POST_RESULT_URI = "POST_RESULT_URI";
  private static POST_SCHEMA_URI = "POST_SCHEMA_URI";

  // Known mounted files
  private static SOURCE_CREDENTIALS = "SOURCE_CREDENTIALS";
  private static DEFAULT_CA_PATH = "DEFAULT_CA_PATH";
  private static MODULE_AUTH_TOKEN = "MODULE_AUTH_TOKEN";
  private static BUILD2_TOKEN = "BUILD2_TOKEN";
  private static CLIENT_ID = "CLIENT_ID";
  private static CLIENT_SECRET = "CLIENT_SECRET";

  private sourceCredentials: SourceCredentials | null;
  private logger?: Logger;
  private queryRunner: QueryRunner<O["definitions"]>;

  private listeners: Partial<{
    [K in keyof O["definitions"]]: QueryListener<Pick<O["definitions"], K>>;
  }> = {};
  private defaultListener?: (data: any, queryName: string) => Promise<any>;

  constructor({
    logger,
    instanceId,
    definitions,
    isAutoRegistered,
    sources,
  }: O) {
    this.logger =
      logger != null ? loggerToInstanceLogger(logger, instanceId) : undefined;

    const sourceCredentialsPath = process.env[ComputeModule.SOURCE_CREDENTIALS];
    this.sourceCredentials =
      sourceCredentialsPath != null
        ? new SourceCredentials(sourceCredentialsPath)
        : null;

    if (sources != null) {
      Object.keys(sources).forEach((source) => {
        if (!this.sourceCredentials?.hasSource(source)) {
          throw new Error(
            `Source ${source} not found in source credentials. Ensure you have mounted the correct sources.`
          );
        }
        sources[source].credentials?.forEach((credential) => {
          if (!this.sourceCredentials?.getCredential(source, credential)) {
            throw new Error(
              `Credential ${credential} not found in source ${source}. Ensure you have mounted the correct sources.`
            );
          }
        });
      });
    }

    this.queryRunner = new QueryRunner<O["definitions"]>(
      this.listeners,
      this.defaultListener,
      this.logger
    );

    if (process.env.NODE_ENV === "development") {
      console.warn("Inactive module - running in dev mode");
      return;
    }

    this.initialize(definitions, isAutoRegistered ?? true);
  }

  /**
   * Adds a listener for a specific query, only one response listener can be added per query
   * @param queryName Foundry query name to respond to
   * @param listener Function to run when the query is received
   * @returns
   */
  public register<T extends keyof O["definitions"]>(
    queryName: T,
    listener: (
      data: Static<O["definitions"][T]["input"]>
    ) => Promise<Static<O["definitions"][T]["output"]>>
  ) {
    this.listeners[queryName] = { type: "response", listener };
    return this;
  }

  /**
   * Adds a listener for a specific query, only one streaming listener can be added per query
   * @param queryName Foundry query name to respond to
   * @param listener Function to run when the query is received
   * @returns
   */
  public registerStreaming<T extends keyof O["definitions"]>(
    queryName: T,
    listener: (
      data: Static<O["definitions"][T]["input"]>,
      writable: {
        write: (chunk: Buffer | Uint8Array | string) => void;
        end: () => void;
      }
    ) => void
  ) {
    this.listeners[queryName] = { type: "streaming", listener };
    return this;
  }

  /**
   * Adds a listener for events within the compute module
   * - responsive: When the module is responsive and can receive queries
   * @returns
   */
  public on(_eventName: "responsive", listener: () => void) {
    this.queryRunner?.on("responsive", listener);
    return this;
  }

  /**
   * Adds a default listener for when no other listener is found for a query
   * @param listener Function to run when the query is received
   * @returns
   */
  public default(listener: (data: any, queryName: string) => Promise<any>) {
    this.defaultListener = listener;
    this.queryRunner?.updateDefaultListener(listener);
    return this;
  }

  /**
   * Sources can be used to store secrets for use within a Compute Module, they prevent you from having to put secrets in your container or in plaintext in the job specification.
   */
  public getCredential<
    T_Source extends O extends { sources: infer S } ? keyof S : string,
    T_Credential extends O extends {
      sources: { [K in T_Source]: SourceOptions<infer C> };
    }
      ? C
      : string
  >(sourceApiName: T_Source, credentialName: T_Credential): string | null {
    if (this.sourceCredentials == null) {
      throw new Error(
        "No source credentials mounted. This implies the SOURCE_CREDENTIALS environment variable has not been set, ensure you have set sources mounted on the Compute Module."
      );
    }
    return this.sourceCredentials.getCredential(sourceApiName, credentialName);
  }

  /**
   * At runtime, you can retrieve the api paths for known Foundry services, this allows you to call those endpoints without using a source to ingress back into the platform.
   */
  public static getServiceApi(service: FoundryService): string | undefined {
    return getFoundryServices()[service];
  }

  /**
   * Compute Modules can interact with resources in their execution environment, within Palantir Foundry these are defined as inputs and outputs on the Compute Module spec. Resource identifiers can be unique to the execution environment,
   * so using aliases allows your code to maintain a static reference to known resources.
   */
  public static getResource(alias: string): Resource | null {
    if (resourceAliases == null) {
      throw new Error(
        "No resource aliases mounted. This implies the RESOURCE_ALIAS_MAP environment variable has not been set, ensure you have set resources mounted on the Compute Module."
      );
    }
    return resourceAliases.getAlias(alias);
  }

  /**
   * Returns the environment and tokens for the current execution mode
   */
  public static getEnvironment(): Environment {
    const buildTokenPath = process.env[ComputeModule.BUILD2_TOKEN];
    if (buildTokenPath != null) {
      return {
        type: "pipelines",
        buildToken: fs.readFileSync(buildTokenPath, "utf-8"),
      };
    }
    const maybeClientId = process.env[ComputeModule.CLIENT_ID];
    const maybeClientSecret = process.env[ComputeModule.CLIENT_SECRET];
    return {
      type: "functions",
      thirdPartyApplication:
        maybeClientId != null && maybeClientSecret != null
          ? {
              clientId: maybeClientId,
              clientSecret: maybeClientSecret,
            }
          : undefined,
    };
  }

  /**
   * @deprecated Use `ComputeModule.getServiceApi()` instead
   * This method is deprecated and will be removed in future versions.
   *
   * Returns the api path for a given Foundry service
   */
  public getServiceApi(service: FoundryService): string | undefined {
    return ComputeModule.getServiceApi(service);
  }

  /**
   * @deprecated Use `ComputeModule.getResource()` instead
   * This method is deprecated and will be removed in future versions.
   *
   * Returns the resource for a given alias, if the alias is not found, returns null
   */
  public getResource(alias: string): Resource | null {
    return ComputeModule.getResource(alias);
  }

  /**
   * @deprecated Use `ComputeModule.getEnvironment()` instead
   * This method is deprecated and will be removed in future versions.
   *
   * Returns the environment and tokens for the current execution mode
   */
  public get environment(): Environment {
    return ComputeModule.getEnvironment();
  }

  private initialize(
    definitions: O["definitions"],
    shouldAutoRegister: boolean
  ) {
    const defaultCAPath = process.env[ComputeModule.DEFAULT_CA_PATH];

    const computeModuleApi = new ComputeModuleApi({
      getJobUri: process.env[ComputeModule.GET_JOB_URI] ?? "",
      postResultUri: process.env[ComputeModule.POST_RESULT_URI] ?? "",
      postSchemaUri: process.env[ComputeModule.POST_SCHEMA_URI] ?? "",
      trustStore:
        defaultCAPath != null
          ? fs.readFileSync(defaultCAPath, "utf-8")
          : undefined,
      moduleAuthToken: fs.readFileSync(
        process.env[ComputeModule.MODULE_AUTH_TOKEN] ?? "",
        "utf-8"
      ),
    });

    this.queryRunner.on("responsive", () => {
      this.logger?.info("Module is responsive");
      if (definitions && shouldAutoRegister) {
        const schemas = Object.entries(definitions).map(([queryName, query]) =>
          convertJsonSchemaToCustomSchema(queryName, query.input, query.output)
        );

        this.logger?.info(`Posting schemas:${JSON.stringify(schemas)}`);
        computeModuleApi.postSchema(schemas).catch((e) => {
          if (isAxiosError(e)) {
            this.logger?.error(
              `Error posting schemas: ${formatAxiosErrorResponse(e)}`
            );
          }
        });
      }
    });

    this.queryRunner.run(computeModuleApi);
  }
}
````

## File: typescript-compute-module/package.json
````json
{
  "name": "@palantir/compute-module",
  "version": "0.2.9",
  "description": "Typescript binding for implementing the compute module API",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "prepublishOnly": "tsc"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/palantir/typescript-compute-module"
  },
  "dependencies": {
    "@sinclair/typebox": "^0.32.35",
    "axios": "^1.6.7",
    "js-yaml": "^3.14.1"
  },
  "devDependencies": {
    "@types/jest": "^29.5.12",
    "@types/js-yaml": "^4.0.9",
    "@types/node": "^20.11.17",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.3",
    "typescript": "^5.3.3"
  },
  "license": "MIT"
}
````
