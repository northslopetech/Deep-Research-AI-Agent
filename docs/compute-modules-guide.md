## Developer toolchain



# Compute modules [Beta]

Beta

Compute modules are in the beta phase of development and may not be available on your enrollment. Functionality may change during active development. To enable compute modules, contact your platform administrator to modify application access in Control Panel.



You can also view this documentation in the platform within the Compute Modules application for an efficient developer experience.

Compute modules enable you to deploy interactive containers on the Palantir platform, allowing you to bring in your existing code base (regardless of language) and run this code inside the platform. Specifically, you can run serverless Docker images as compute modules in the Palantir platform and horizontally scale them up or down based on load in your frontend applications, such as Workshop and Slate.

## Get started with compute modules

Start developing with our compute modules quick start guides:

- Call custom containers or models from Workshop modules or Slate applications: Write a container function that can be queried from Workshop or Slate. Review the documentation on building a compute module-backed function to get started using Palantir's TypeScript or Python SDKs.
- Sync data into Foundry using custom containers: Write a container that can be used to add data from custom sources into streams, datasets, or media sets. Review the documentation on building a compute module-backed pipeline to get started using Palantir's TypeScript or Python SDKs.
- [Advanced] Integrate with any language by writing a custom client: To integrate a container in a language without using the dedicated SDKs, you can write a custom client implementing the compute module client specification.

## Use cases for compute modules

Compute modules give you new ways to interact with your own code or third-party code in the platform, enabling use cases such as:

- Container-backed functions: Author container functions that can be queried from applications such as Workshop or Slate.
- Container-based data integration: Connect to arbitrary data sources and ingest data into streams, datasets, or media sets.
- Host custom models: Host custom or open-source models and query them interactively from Foundry applications.

## Why use compute modules?

There are several key advantages provided by compute modules:

- Integrate existing code bases: If you have business-critical code that would be risky or expensive to rewrite in Foundry, you can containerize the code into a Docker image and run it as a compute module.
- Use any programming language: Run any code that can be containerized, regardless of language. This means you are not limited by the languages Foundry supports natively.
- Dynamic and predictive horizontal scaling: If you expect to serve a varying number of requests, compute modules can ensure higher availability by scaling the number of available replicas up or down based on current and historic load.
- External and in-platform connections: Write custom logic leveraging Palantir products. For example, you can read and write data or media sets, or connect to external systems.

Note that compute modules may not be appropriate in all circumstances. We do not recommended using compute modules for the following:

- Dynamic vertical scaling: If you expect to have a single request vary dramatically in size, for instance from 1MB to 100GB, and want to support dynamic vertical scaling, compute modules may perform poorly "out of the box", as the amount of resources allocated is static and defined manually. It is possible to create differently provisioned tiers of the same compute module and multiplex between them, but that solution may be more complicated and cumbersome.
- Replacing existing features supported natively by Foundry: Compute modules can theoretically be used to build any desired feature. However, by virtue of being very generalized and powerful, this may come at the cost of having a more complicated solution.

## Architecture

Each compute module consists of a number of replicas. The number of replicas changes as the request volume changes.

Each replica contains the same set of one or many isolated containers. One container serves as the entry point, and it must implement a client that forever polls for events to process. The other containers can contain anything.

By default, there are few guardrails for setting up a many-container compute module. One suggested method is to have them communicate using standard networking protocols; another suggestion is to use shared volume mounts. Containers in the same replica can communicate via those methods (and more), but containers cannot communicate across replicas, and you should not rely on any state they may accrue.

To get started, review the guide for building a compute module in the Palantir platform.

## Next steps

Compute module security: Learn about compute module security and different execution modes.

Build a compute module-backed function: Create a compute module with functions to use natively across the platform.

Build a pipeline compute module: Create a pipeline compute module that takes input resources and produces output resources.

## Contents

- Compute modules [Beta]
    - Get started with compute modules
    - Use cases for compute modules
    - Why use compute modules?
    - Architecture
    - Next steps



## Developer toolchain



# Getting started

To get started with compute modules, you can use your preferred developer environment. In a few minutes, you will be able to create and deploy a compute module and test it in Foundry.

In Foundry, choose a folder and select + New &gt; Compute Module, then follow the steps in the dialog to start with an empty compute-module backed function or pipeline. Follow the documentation below for next steps depending on your execution mode, or, for a more seamless experience, select the Documentation tab within your compute module to follow along with in-platform guidance.

## Build a compute module-backed function

In the following sections, we will use the open-source Python library  ↗. If you prefer to create your own client or implement your compute module in another language not supported by the SDKs, review the documentation on how to implement the custom compute module client.

Prerequisites:

- Install Docker Desktop
- Install Python 3.9 or higher

### Write the compute module in your local machine

1. Begin by creating a new directory for your compute module.
2. Create a file called Dockerfile in the directory.
3. Copy and paste the following into the Dockerfile:

```
# Change the platform based on your Foundry resource queue
FROM --platform=linux/amd64 python:3.12

COPY requirements.txt .
RUN pip install -r requirements.txt
COPY src .

# USER is required to be non-root and numeric for running compute modules in Foundry
USER 5000
CMD ["python", "app.py"]
```

1. Create a new file called requirements.txt. This file specifies dependencies for our Python application. Copy and paste the following into the file:

```
foundry-compute-modules
```

1. Create a new subdirectory called src. This is where we will store our Python application.
2. Inside the src directory, create a file called app.py.
3. Your directory should now look like this:

```
MyComputeModule
├── Dockerfile
├── requirements.txt
└── src
    └── app.py
```

1. Inside app.py, copy and paste the following code:

```

from compute_modules.annotations import function

@function
def add(context, event):
    return str(event['x'] + event['y'])

@function
def hello(context, event):
    return 'Hello' + event['name']
```

Learn how to add type inference and automatically register a compute module function with the function registry.

### Understand your function code

When working with compute module functions, your function will always receive two parameters: event objects and context objects.

Context object: A Python dict object parameter containing metadata and credentials that your function may need. Examples include user tokens, source credentials, and other necessary data. For example, If your function needs to call the OSDK to get an Ontology object, the context object includes the necessary token for the user to access that Ontology object.

Event object: A Python dict object parameter containing the data that your function will process. Includes all parameters passed to the function, such as x and y in the add function, and name in the hello function.

If you use static typing for the event/return object, the library will convert the payload/result into that statically-typed object. Review documentation on automatic function schema inference for more information.

The function result will be wired as a JSON blob, so be sure the function is able to be serialized into JSON.

### Create your first container

Now, you can publish your code to Foundry using an Artifact repository, which will be used to store your Docker images.

1. Create or select an Artifact repository to publish your code to Foundry. To do this, navigate to the Documentation tab of your compute module. Then, find the corresponding in-platform documentation section to this external documentation page: Build a compute module-backed function &gt; Create your first container. There, you can Create or select repository.
2. On the next page, select the dropdown menu to choose Publish to DOCKER and follow the instructions on the page to push your code.
3. In the Configure tab of your compute module, select Add Container. Then, select your Artifact repository and the image you pushed.
4. Select Update configuration to save your edits.
5. Once the configuration is updated, you can start the compute module from the Overview page, test it using the bottom Query panel, and view the logs.

## Build a compute module-backed pipeline

Compute modules can operate as a connector between inputs and outputs of a data pipeline in a containerized environment. In this example, you will build a simple use case with streaming datasets as inputs and outputs to the compute module, define a function that doubles the input data, and write it to the output dataset. You will use notional data to simulate a working data pipeline.

### Prerequisites

- Understand pipeline execution mode and its configuration.
- Set up an input and output stream.
- Install Docker Desktop.
- Install Python 3.9 or higher

### Write the compute module to your local machine

1. Create a new directory for your compute module.
2. Create a file called Dockerfile in the directory.
3. Copy and paste the following into the Dockerfile:

```
# Change the platform based on your Foundry resource queue
FROM --platform=linux/amd64 python:3.12

COPY requirements.txt .
RUN pip install -r requirements.txt
COPY src .

# USER is required to be non-root and numeric for running compute modules in Foundry
USER 5000
CMD ["python", "app.py"]
```

1. Create a new file called requirements.txt. Store your dependencies for your Python application in this file. For example:

```
requests == 2.31.0
```

1. Create a new subdirectory called src. This is where you will put your Python application.
2. Inside the src directory, create a file called app.py.
3. Your directory should now look like the following:

```
MyComputeModule
├── Dockerfile
├── requirements.txt
└── src
    └── app.py
```

1. Import the following modules in app.py:

```
import os
import json
import time
import requests
```

1. Inside app.py, get the bearer token for input and output access:

```
with open(os.environ['BUILD2_TOKEN']) as f:
    bearer_token = f.read()
```

1. Inside app.py, get input and output information:

```
with open(os.environ['RESOURCE_ALIAS_MAP']) as f:
    resource_alias_map = json.load(f)

input_info = resource_alias_map['identifier you put in the config']
output_info = resource_alias_map['identifier you put in the config']

input_rid = input_info['rid']
input_branch = input_info['branch'] or "master"
output_rid = output_info['rid']
output_branch = output_info['branch'] or "master"
```

1. Inside app.py, interact with inputs and outputs and perform computations. For example:

```
FOUNDRY_URL = "yourenrollment.palantirfoundry.com"

def get_stream_latest_records():
    url = f"https://{FOUNDRY_URL}/stream-proxy/api/streams/{input_rid}/branches/{input_branch}/records"
    response = requests.get(url, headers={"Authorization": f"Bearer {bearer_token}"})
    return response.json()

def process_record(record):
    # Assume input stream has schema 'x': Integer
    x = record['value']['x']
    # Assume output stream has schema 'twice_x': Integer
    return {'twice_x': x * 2}

def put_record_to_stream(record):
    url = f"https://{FOUNDRY_URL}/stream-proxy/api/streams/{output_rid}/branches/{output_branch}/jsonRecord"
    requests.post(url, json=record, headers={"Authorization": f"Bearer {bearer_token}"})
```

1. Inside app.py, run your code as an autonomous task. For example:

```
while True:
    records = get_stream_latest_records()
    processed_records = list(map(process_record, records))
    [put_record_to_stream(record) for record in processed_records]
    time.sleep(60)
```

### Deploy your compute module

1. Build a Docker image and publish it to the Artifact repository.
2. Finally, deploy the compute module using pipeline execution mode after selecting the relevant container image.

You can now view the results streamed live in the output dataset.

### Understand your pipeline code

To interact with inputs and outputs, we provide a bearer token and input/output information.

You can then write code to interact with the inputs and outputs and perform computations. The code snippets provide a simple example of pipelining two stream datasets:

- It reads the latest records from the input stream dataset using the bearer token and input info by calling the stream-proxy service.
- It then performs computations (in the above example, doubling the data). The data format depends on your own input data.
- Next, it writes results to the output stream dataset using the bearer token and output info.
- Finally, as you cannot query a pipeline mode compute module, the code runs the pipeline autonomously at the end of the script, which will be executed on container start.

### Create your first container

Now, you can publish your code to Foundry using an Artifact repository, which will be used to store your Docker images.

1. Create or select an Artifact repository to publish your code to Foundry. To do this, navigate to the Documentation tab of your compute module. Then, find the corresponding in-platform documentation section to this external documentation page: Build a compute module-backed function &gt; Create your first container. There, you can Create or select repository.
2. On the next page, select the dropdown menu to choose Publish to DOCKER and follow the instructions on the page to push your code.
3. In the Configure tab of  your compute module, select Add Container. Then, select your Artifact repository and the image you pushed.
4. Select Update configuration to save your edits.
5. Once the configuration is updated, you can start the compute module from the Overview page, test it using the bottom Query panel, and view the logs.

## Contents

- Getting started
    - Build a compute module-backed function
    - Build a compute module-backed pipeline



## Developer toolchain



# Execution modes

## Function execution mode vs. pipeline execution mode

| Function mode                                                                                                                                                        | Pipelines module                                                                                                                                                    |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Use your compute module to host logic as functions. Use these functions across Foundry in applications like Workshop or the Developer Console with the Ontology SDK. | Read Foundry inputs and write to Foundry outputs for streaming and realtime media use cases. This module will be passed as a job token with access you can specify. |
| Power your Foundry applications using compute module functions.                                                                                                      | Use the Foundry resource permissions system.                                                                                                                        |
| Execute compute module functions from another function.                                                                                                              | Get data provenance across Foundry in the Data Lineage application.                                                                                                 |

## Function mode permissions

No platform permissions: You will not be provided with access to use Ontology SDK or platform APIs.
Application permissions: Your application will use a service user for permissions rather than depending on user permissions.

## Pipeline mode permissions

Foundry job tokens will be attached to the compute module. Job tokens will be scoped to input and output resources and can be used to obtain data.

## Functions execution mode

Functions mode allows you to use your compute module to host logic for use across Foundry, such as in Workshop applications or through the Ontology SDK. You can define and write your logic in any language, register them as functions, and execute this logic with function calls in the platform.

Functions mode can operate through two permission modes:

- No platform permissions: Your application will not be provided with access to any platform APIs or the Ontology SDK. Use this mode for running logic that does not need to interact with Foundry. You can still configure egress to external systems in this mode. Review Sources for more information.
- Application permissions: Your application will use its accompanying service user to determine its permissions for accessing the platform APIs and Ontology SDK. Permissions will remain the same regardless of the compute module user. Use this mode to run logic that needs to interact with Foundry with a set of permissions for the application as a whole.

### Use application permissions

Application permissions may not be available on all enrollments.

#### Create the service user

1. Navigate to your compute module's Configure page.
2. Under Execution mode, choose a Functions module with Application's permissions.
3. Save your compute module configuration. This will automatically create a third-party application for your compute module and display its client ID and service user name.
4. [Optional] Configure the service user as needed, such as restricting its access to select Markings, in the Third party applications section of Control Panel.

Only users in your organization with permissions to Manage OAuth 2.0 clients can perform this step. Review the third-party applications documentation for more information.

#### Use the service user in your compute module

1. Add a source with a network policy that enables access to your Foundry environment's URL.
2. Exchange the client ID and secret for an access token with the desired permissions.

In app.py, with the compute modules SDK:

```



from compute_modules.auth import oauth

access_token = oauth("yourenrollment.palantirfoundry.com", ["api:datasets-read", "api:datasets-write"])
```

Without the compute modules SDK:

```
import requests
import os

token_response = requests.post("https://yourenrollment.palantirfoundry.com/multipass/api/oauth2/token",
    data={
        "grant_type": "client_credentials",
        "client_id": os.environ["CLIENT_ID"],
        "client_secret": os.environ["CLIENT_SECRET"],
        "scope": "api:datasets-read api:datasets-write"
    },
    headers={
        "Content-Type": "application/x-www-form-urlencoded",
    },
    verify=os.environ["DEFAULT_CA_PATH"]
)

access_token = token_response.json()["access_token"]
```

1. Use the granted token to make calls to Foundry APIs.

In app.py:

```
import requests
import os

DATASET_ID = "ri.foundry.main.dataset.7bc5a955-5de4-4c5f-9370-248c5517187b"

dataset_response = requests.get(
    f"https://yourenrollment.palantirfoundry.com/api/v1/datasets/{DATASET_ID}",
    headers={
        "Authorization": f"Bearer {access_token}"
    },
    verify=os.environ["DEFAULT_CA_PATH"]
)

dataset_name = dataset_response.json()["name"]
print(f"Dataset name is {dataset_name}")
```

## Pipeline execution mode

A compute module executed in pipeline mode is designed to facilitate computations for data pipeline workflows that require high data security and provenance control. Pipeline mode works by taking in Foundry inputs, executing user-specified computations, and subsequently producing outputs. The entire process strictly adheres to the protocols and workflows established by the Foundry build system.

Unlike function mode, where users directly interact with a compute module by sending queries, the inputs and outputs and their permissions are managed through the Foundry build system. This ensures that all data involved in the computation process is systematically tracked. By mandating that all inputs and outputs pass through the build system, the module maintains a high level of data integrity and traceability, which is crucial for Foundry data provenance control and security.

Due to provenance control requirements, pipeline mode compute modules are non-interactive, meaning users cannot send queries directly to the compute module. Because of this, the compute module only performs computations on inputs automatically provided by the build system once the compute module is running. The build system also manages the flow of information from a compute module's output. Interfaces are provided for interacting with inputs and outputs inside the container of a compute module running in pipeline mode.

To summarize, pipeline mode enforces data security and provenance control. Users should choose pipeline mode if the following is true:

- The relevant data is highly sensitive and must strictly conform to provenance control, marking control, and so on.
- Users want to track data lineage.

### Add inputs and outputs

Pipeline mode compute modules strictly conform to the provenance control and security model established by the Foundry build system. By default, the compute module does not have permission to interact with any Foundry resources. Users must explicitly add Foundry resources as inputs and outputs. Permissions will then be granted on these added resources.

1. In the configuration details for pipeline mode, choose to and an input or output resource.
2. Select a resource from the dropdown menu and give it a unique identifier. The identifier will be used to retrieve resource information inside the container. The resources must be from the same Project as the compute module. The currently supported inputs/outputs are Foundry datasets, streaming datasets, and media sets.

### Interact with inputs and outputs within the compute module

1. A bearer token will be mounted in a container file, where the file name is stored in a BUILD2\_TOKEN environment variable. The token will have permissions on the inputs and outputs and will be the only way to access them.

In app.py:

```
with open(os.environ['BUILD2_TOKEN']) as f:
    bearer_token = f.read()
```

1. A map of input and output unique identifiers and their information is mounted in a container file, where the file name is stored in a RESOURCE\_ALIAS\_MAP environment variable. You can get the resource information with the unique identifier you give in the configuration. The resource information is a tuple of RID and branch (branch can be none).

In app.py:

```
with open(os.environ['RESOURCE_ALIAS_MAP']) as f:
    resource_alias_map = json.load(f)

input_info = resource_alias_map['identifier you put in the config']
output_info = resource_alias_map['identifier you put in the config']

# structure of resource info
# {
#     'rid': rid
#     'branch': branch (can be none)
# }

input_rid = input_info['rid']
input_branch = input_info['branch'] or "master"
output_rid = output_info['rid']
output_branch = output_info['branch'] or "master"
```

1. Now, you can use the token and resource information to interact with the inputs and outputs. For example, if your input is a stream dataset, you can get the latest records by requesting the stream-proxy service.

In app.py:

```
FOUNDRY_URL = "yourenrollment.palantirfoundry.com"
url = f"https://{FOUNDRY_URL}/stream-proxy/api/streams/{input_rid}/branches/{input_branch}/records"
response = requests.get(url, headers={"Authorization": f"Bearer {bearer_token}"})
```

### Other considerations

1. Scaling: Since no queries are sent to the compute module, it may automatically scale down to zero when there is no traffic. If you want your compute module to be constantly running, set the Minimum replicas to 1 in the scaling configuration. Learn more in our scaling documentation.
2. Compute module client: Since no queries are sent to the compute module, you do not need to implement the compute module client. Review our documentation on compute module clients for more information.

## Contents

- Execution modes
    - Function execution mode vs. pipeline execution mode
    - Function mode permissions
    - Pipeline mode permissions
    - Functions execution mode
    - Pipeline execution mode



## Developer toolchain



# Containers

This page provides information on Docker basics for use with compute modules. For full explanations, visit the Docker documentation ↗.

## Get started with Docker

To build and publish images, you first need to install Docker. Follow the official instructions in the Docker documentation ↗.

To verify that Docker is running, you can run the docker info command. If you see Cannot connect to the Docker daemon, visit the troubleshooting guide ↗ to remediate.

### What is Docker?

Docker is a tool for packaging and deploying applications. Docker enables easy distribution, consistency in execution across runtime environments, and security through isolation. This is achieved with a process called containerization that packages everything required to run an application while ensuring it runs consistently wherever it is deployed. There are two core primitives of Docker containerization: images and containers.

- Image: An immutable file that contains all of the code, dependencies, and more necessary to run your application. In other words, an image only describes what should be run; it is the template from which containers are created.
- Container: A single running instance of an image. A container is a live, lightweight, isolated environment in which your application is actually running.

### Create images

Creating images in Docker involves packaging an application along with its dependencies, libraries, and configuration files into a single, portable unit. Packaging instructions are defined in a Dockerfile.

#### Dockerfiles

A Dockerfile is a text document made of sequential commands that instructs how to configure and run your application. The following list gives an overview of the most common commands you may need while creating images for compute modules. For a full guide, visit the Dockerfile reference documentation ↗:

- FROM: Declare the base image. The base image is the foundational layer upon which your image configuration will build. A base image can be minimal (just an operating system) or more comprehensive (including pre-existing software such as Python). FROM must be the first statement in your Dockerfile. You can also add the --platform linux/amd64 flag to specify the target platform.
- WORKDIR: Set the working directory. The working directory is the base location in your image where commands will run.
- RUN: Run shell commands during the image build. Shell commands are typically used to install dependencies, compile your code, and perform filesystem operations.
- COPY: Copy files from your computer into the image.
- USER: Set the user for the container. The user must be a non-root numeric value.
- ENTRYPOINT: Set the default command that will run at container startup. This command specifies what your container will actually be doing.
- EXPOSE: Document the port(s) on which your container will be listening. All exposed ports must be between 1024 and 65535.
- ENV: Set environment variables. These variables can be used to configure and provide runtime information for your container to read during execution.

#### Image requirements for compute modules

- Images must be run as a non-root numeric user.
- Images must be built for the linux/amd64 platform.
- You must use a digest or any tag except latest.
- All exposed ports must be between 1024 and 65535.

#### Use your image in compute modules

Once you have an image compatible for a compute module, you can follow the steps below to upload it to Foundry. For full instructions, review our documentation on publishing an Artifact documentation.

- Create an Artifacts repository.
- Navigate to Publish and select Docker.
- Follow the provided instructions to push your image to the repository.

### Build an image: Example

We have an application that we want to deploy as a compute module, and it is structured as follows:

Project structure

```
myapplication
├── Dockerfile
├── requirements.txt
└── src
    └── application.py
```

We can construct a Dockerfile line-by-line using the steps below:

1. Specify the base image.

```
FROM python:3.12
```

1. Set the current directory.

```
WORKDIR /app
```

1. Install necessary dependencies.

```
COPY ./requirements.txt /app
RUN pip install --no-cache-dir -r requirements.txt
```

1. Specify a non-root numeric user for the container to run as.

```
RUN adduser --uid 5001 user
USER 5001
```

1. Copy in the application code. This is done separately from the dependencies to leverage Docker image layer caching.

```
COPY ./src/application.py /app
```

1. Specify the container to run the application at startup.

```
ENTRYPOINT ["python", "application.py"]
```

Your Dockerfile should look something like this:

```
FROM python:3.12
WORKDIR /app
COPY ./requirements.txt /app
RUN pip install --no-cache-dir -r requirements.txt
RUN adduser --uid 5001 user
USER 5001
COPY ./src/application.py /app
ENTRYPOINT ["python", "application.py"]
```

Now, you can run the following command to build an image called myimage with the tag 0.0.0 from your Dockerfile:

```
docker build . -t myimage:0.0.0 --platform linux/amd64
```

## Logs

Logging can be configured at the container level, allowing you to enable or disable logging for each container. This granular control helps optimize resource usage and focuses on the most relevant log data. To access the logging configuration for a specific container, select the container's row in the Containers section. This will open a side panel where you can adjust the logging settings.

### Log formats

#### SLS format

The SLS format is a structured logging format that provides consistent and easily parsable logs. SLS logging is designed to support additional metadata for each log entry.

The following is an example of logging in the SLS format:

```

package myproject;

import com.palantir.interactive.module.api.SafeArg;
import com.palantir.interactive.module.api.UnsafeArg;
import com.palantir.interactive.module.tasks.deployedapps.DeployedAppRuntime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

final class DeployedApp {

    private static final Logger log = LoggerFactory.getLogger(DeployedApp.class);

    public static void main(String[] _args) {
        DeployedAppRuntime.builder()
                .addQueryRunner(DeployedApp::hello, String.class, String.class, "hello")
                .buildAndStart();
    }

    static String hello(String name) {
        // SLS format for error
        log.error("This is an SLS error log with unsafe parameter", UnsafeArg.of("name", name));

        // This is not in SLS format. As a result, it won't be logged if SLS format is selected.
        System.out.println("This message will not be logged iff SLS format");

        // SLS format for info
        log.info("This is an SLS info log with safe parameter", SafeArg.of("name", name));

        return "Hello, " + name + "!";
    }

    private DeployedApp() {}
}
```

Notice that the logging adheres to the following styles and constrains:

- Use UnsafeArg for potentially sensitive data and SafeArg for non-sensitive data.
- Standard System.out.println() statements are not captured in SLS format.

#### Plaintext format

Plaintext format provides human-readable logs without a specific structure. Plaintext logs are easier to read directly but may be more challenging to parse programmatically.

When plaintext is configured, the output is inserted into the message field of the SLS log. This allows for compatibility with existing SLS-based tools while maintaining readability.

Using plaintext logging as a default ensures that both plaintext and SLS logs are captured, with SLS logs appearing in JSON form in the messages field.

### Container log sources

Container logs can be captured from two primary sources. Each source has specific requirements and configurations to ensure effective log collection.

#### Standard output

The standard output (stdout) source collects logs directly from the container's standard output stream. To enable this logging method, ensure your container meets the following requirements:

- Must have a shell executable at /bin/sh
- Must support the shell commands set and tee

Standard error inclusion: Optionally include standard error (stderr) in your logs. When set to true, stdout and stderr are synchronized and merged into a single stream.

#### Log files

The log files source captures logs from specific files within the container. There are two configuration parameters:

- Directory path: The base directory where log files are located.
- File path patterns: The patterns to match log files for capture. This parameter supports common wildcards for flexible file matching. Each pattern should include the specified directory path.

Example: To capture logs from all .log files in /var/log/foo/ and the specific file /var/log/bar.txt, set the directoryPath to be /var/log and the filePathPatterns to be /var/log/foo/*.log and /var/log/bar.txt

When using log files, the specified directory path must be empty when the compute module starts.

## Environment variables

Docker environment variables are dynamic, named values that can customize the behavior of Docker containers and applications without changing the Dockerfile or container images. Environment variables can be used for many purposes, including the following:

- Configure parameters: Set parameters for Docker images, such as the CPU set and CPU shares.
- Define behavior: Define the behavior of an application or script.
- Store credentials: Securely store sensitive information like API keys and database credentials.
- Create reusable configurations: Use environment variables and interpolation to create reusable configurations that make it easier to manage and deploy Dockerized applications.
- Override default values: Override default configuration values specified in the Dockerfile when running a container.

### Example

We have two code paths, production and test, where test might return some extra metadata about a request. You can create a production environment variable that your code can read and use to execute different paths, without having to change and redeploy your code.

```



# app.py
import os

if os.environ["production"] == "true":
    ...
else:
    ...
```

### Reserved environment variables reference

Some environment variable names are reserved. You cannot overwrite reserved environment variables, as they may contain important information when writing your compute module. Review the list of reserved environment variables below:

CLIENT\_ID string

- When present, this is the client ID of the third-party application associated with this compute module. It is present in functions execution mode and when using application permissions. Use it to obtain a Foundry-scoped token from your third-party application service user.
- Example value: 038120ac-ac39-4d91-be0e-55afabbb0912

```



# app.py
import requests
import os
token_response = requests.post("https://{FOUNDRY_URL}/multipass/api/oauth2/token",
    data={
        "grant_type": "client_credentials",
        "client_id": os.environ["CLIENT_ID"],
        "client_secret": os.environ["CLIENT_SECRET"],
        "scope": "compass:edit"
    },
    headers={
        "Content-Type": "application/x-www-form-urlencoded",
    }
)
access_token = token_response.json()["access_token"]
```

CLIENT\_SECRET string

- When present, this is the client secret of the third-party application associated with this compute module. It is present when in functions execution mode and when using application permission. Use it to obtain a Foundry-scoped token from your third-party application service user.
- Example value: 038120ac-ac39-4d91-be0e-55afabbb0912

```



# app.py
import requests
import os
token_response = requests.post("https://{FOUNDRY_URL}/multipass/api/oauth2/token",
    data={
        "grant_type": "client_credentials",
        "client_id": os.environ["CLIENT_ID"],
        "client_secret": os.environ["CLIENT_SECRET"],
        "scope": "compass:edit"
    },
    headers={
        "Content-Type": "application/x-www-form-urlencoded",
    }
)
access_token = token_response.json()["access_token"]
```

RUNTIME\_HOST host

- The host used to connect to the compute module service. Use it to construct a URI when creating a custom client.
- Example value: localhost

```



# app.py
import os
runtime_host = os.environ["RUNTIME_HOST"]
```

RUNTIME\_PORT port

- The port used to connect to the compute module service. Use it to construct a URI when creating a custom client.
- Example value: 8945

```



# app.py
import os
runtime_port = os.environ["RUNTIME_PORT"]
```

RUNTIME\_API hostname

- The API path used to connect to the compute module service. Use it to construct a URI when creating a custom client.
- Example value: localhost:8945

```



# app.py
import os
runtime_api = os.environ["RUNTIME_API"]
```

GET\_JOB\_PATH uri path

- The path used to get a job from the compute module service. Use it to construct a URI when creating a custom client.
- Example value: /interactive-module/api/internal-query/job

```



# app.py
import os
get_job_path = os.environ["GET_JOB_PATH"]
```

GET\_JOB\_URI uri

- The fully qualified URI to get a job from the compute module service. Use it to construct a URI when creating a custom client.
- Example value: https://localhost:8945/interactive-module/api/internal-query/job

```



# app.py
import os
get_job_uri = os.environ["GET_JOB_URI"]
```

POST\_RESULT\_PATH uri path

- The path used to post a result from the compute module service. Use it to construct a URI when creating a custom client.
- Example value: /interactive-module/api/internal-query/results

```



# app.py
import os
post_result_path = os.environ["POST_RESULT_PATH"]
```

POST\_RESULT\_URI uri

- The fully qualified URI to post a result to the compute module service. Use it to construct a URI when creating a custom client.
- Example value: https://localhost:8945/interactive-module/api/internal-query/results

```



# app.py
import os
post_result_uri = os.environ["POST_RESULT_URI"]
```

POST\_SCHEMA\_URI uri

- The fully qualified URI to post schemas to the compute module service. Use it to construct a URI when creating a custom client.
- Example value: /interactive-module/api/internal-query/schemas

```



# app.py
import os
post_schema_uri = os.environ["POST_SCHEMA_URI"]
```

MAX\_CONCURRENT\_TASKS integer

- The maximum number of tasks that can be sent to a replica at a given time. Configure it on the frontend. Any changes to its value that occur while a replica is running will not be respected.
- Example use case: Setting up an initial thread pool when building a custom client.
- Example value: 1

```



# app.py
import os
max_concurrent_tasks = os.environ["MAX_CONCURRENT_TASKS"]
```

SOURCE\_CREDENTIALS file path

- Available only if you configured at least one external source. It is a path to a JSON file where the top level keys are all of your configured external source API names, and the values are a map of the corresponding secrets.
- Example value: /opt/source-credentials/SOURCE\_CREDENTIALS

```

# app.py
import json
import os

with open(os.environ['SOURCE_CREDENTIALS'], 'r') as f:
    credentials = json.load(f)

# Access a specific secret
secret = credentials["<Source API Name>"]["<Secret Name>"]
```

SOURCE\_CONFIGURATIONS\_PATH file path

- Available only if you configured at least one external source. It is a path to a JSON file where the top-level keys are all of your configured external source API names, and the values are a map of the corresponding secrets. This file may contain extra metadata about your configured sources.
- Example value: /opt/source-credentials/SOURCE\_CONFIGURATIONS\_PATH

```


# app.py
import json
import os

with open(os.environ['SOURCE_CONFIGURATIONS_PATH'], 'r') as f:
    credentials = json.load(f)

# Access a specific secret
secrets = credentials["secrets"]
url = credentials["httpConnectionConfig"]["url"]
```

DEFAULT\_CA\_PATH file path

- The path to a mounted CA PEM file. You must use this certificate when connecting to the compute module service. Only relevant if you are constructing a custom client.
- Example value: /etc/ssl/rubix-ca/ca.pem

```



# app.py
import os
default_ca_path = os.environ["DEFAULT_CA_PATH"]
```

BUILD2\_TOKEN file path

- Available only with pipeline execution mode. A file that contains a token scoped to your input and output resources. Use it when calling the API gateway.
- Example value: /opt/build2-token/BUILD2\_TOKEN

```



# app.py
import os
build_2_token = os.environ["BUILD2_TOKEN"]
```

## Contents

- Containers
    - Get started with Docker
    - Logs
    - Environment variables



## Developer toolchain



# Scaling

Compute modules offer automatic horizontal scaling capabilities, allowing you to efficiently manage your deployment's resources. You can configure a range of replicas and set concurrency limits per replica, both of which influence scaling behavior.

## Minimum replicas

Non-zero minimum: Set the minimum number of replicas to greater than zero to ensure that at least that many instances of your application will be running at all times, even during periods of inactivity.
Zero minimum: Set the minimum to zero to allow your application to scale down to zero replicas when there are no active requests. However, your application will immediately scale up from zero when a request is received, upon initial deployment, and whenever load is predicted.

## Maximum replicas

- Set the highest number of active replicas for horizontal scaling.
- Ensure resource allocation stays within desired boundaries, prevent excessive costs, and protect against uncontrolled scaling due to traffic spikes.

## Concurrency limit

The concurrency limit defines the maximum number of requests a single replica can process simultaneously. It represents the parallel processing capacity of each replica. For example, a concurrency limit of three means each replica can handle up to three queries at the same time. The default setting is one, meaning each replica processes requests sequentially.

If you are using one of the SDKs, this concurrency is built in for you. However, if you are building a custom client, this value can be obtained from the MAX\_CONCURRENT\_TASKS environment variable.

## Autoscaling

Autoscaling adjusts the number of active replicas of your model based on the current workload. In addition to setting minimum/maximum replica limits, the key parameters are scale-up load threshold and scale-down load threshold.

#### Scale-up load threshold

Scale-up load threshold is calculated as current running jobs / (current replicas * concurrency limit); if the load is greater than or equal to 0.75 for 1 minute, the deployment scales up one replica.

#### Scale-down load threshold

Scale-down load threshold is calculated in the same way as scale-up load threshold (current running jobs / (current replicas * concurrency limit)), but triggers scaling down one replica when the load is below 0.75 for 30 minutes.

## Predictive scaling

Compute modules feature predictive scaling by tracking historic query load for your deployment. This system attempts to preemptively scale up to meet anticipated demand. If the prediction is inaccurate, the system will adjust and scale down. Predictive scaling respects your configured maximum number of replicas, so be sure to monitor your deployment's scaling over time and adjust your settings accordingly.

## Contents

- Scaling
    - Minimum replicas
    - Maximum replicas
    - Concurrency limit
    - Autoscaling
    - Predictive scaling



## Developer toolchain



# Sources

Compute modules in Foundry operate under a "zero trust" security model, ensuring maximum isolation and security. By default, these modules lack any external network access, including access to other Foundry services. This strict isolation is crucial for maintaining a secure environment.

To enable external network access for your compute module, you must explicitly configure a source through the Data Connection application. Sources also allow secure storage of credentials needed to access external systems for use in your compute module. This following sections outline the process of using sources within your compute module as a means of packaging network policies and credentials.

## Add a source to your compute module

### Create a source in Data Connection

1. Create a source in the Data Connection application, attaching any required network policies and secrets.
2. Ensure the following configurations:

- The source must be in the same Project as your compute module.
- In the Code import configuration tab, choose to Allow this source to be imported into compute modules.
- Add an API name for the source that you will use to access it from your compute module.

### Add the source to the compute module configuration

In your compute module, select Configure &gt; Sources &gt; Add Sources.

## Access source credentials within a compute module

When a compute module launches, source credentials are mounted as JSON in a file where the file path is contained by the SOURCE\_CREDENTIALS environment variable. To access these credentials, perform the following:

1. Read the file pointed to by the SOURCE\_CREDENTIALS environment variable.
2. Parse the contents as a JSON dictionary.
3. Access specific credentials first by specifying the source's API name, then the secret's name.

Some sources, like REST sources, require an additionalSecret prefix before the specified secret's name (for example, additionalSecretMySecretName).

```

# read_sources_credentials.py
import json
import os

with open(os.environ['SOURCE_CREDENTIALS'], 'r') as f:
    credentials = json.load(f)

# Access a specific secret
secret = credentials["<Source API Name>"]["<Secret Name>"]
```

You can use the compute module SDK ↗ to simplify this process.

## Manage sources

To add or remove sources on your compute module, you must first stop the compute module. You cannot add or remove a source if the compute module is running. Additionally, changes to network policies on the source require a full restart of the compute module to apply. Changes to credentials will be reflected in a compute module rolling upgrade.

## Contents

- Sources
    - Add a source to your compute module
    - Access source credentials within a compute module
    - Manage sources



## Developer toolchain



# Functions

## Register functions

If running in function execution mode, you must register the functions in your compute module to make them callable from elsewhere in Foundry. This page explains two different methods for manually registering a compute module function.

The compute modules SDK makes it easier to register functions by automatically inferring the schema of your function(s). If you are using the compute modules SDK, review the automatic function schema inference section below.

### Register a function from the Compute Modules application

You can manually register a function for a compute module from the Functions page. Select Add function to open the Create function panel:

1. Function name: The name of the function to be invoked. Typically, this should match the name of the function in your compute module.
2. Inputs: The input parameter(s) to be passed as arguments to your compute module function.

Compute module function inputs are packaged into a JSON object; each input that you add corresponds to a property on the input object passed into your function. In the example below, function inputs are on the left, and the JSON object passed to the corresponding function is on the right.

example\_function\_payload.json

```

{
    "arg1": "hello",
    "arg2": 2,
    "arg3": "1969-07-20"
}
```

1. Output: The return type of your function.
2. API name: The API name is the function locator that allows you call your function from other code in Foundry, such as through a TypeScript function.
The compute module API format follows the structure com.&lt;namespace&gt;.computemodules.&lt;MyApiName&gt; and must comply to the following naming rules:

- namespace: Must be all lowercase and contain no special characters.
- MyApiName: Must be in camel case and contain no special characters.

Changing the API name will break the consumer code. Only the latest published version of the query is supported.

Once you define a function, you can switch to the Test tab to try invoking the function, and/or select Save to save the function and make it callable from Foundry.

Compute module functions are always registered with version 0.0.0. If you update the function, the function's version will be overwritten by your changes.

### Register a function using JSON

You can also manually define your function schema by sending an HTTP POST request from within your compute module. Typically, you will only need to do this if you are creating your own client. For information on the HTTP request, review our POST function schema documentation.

This endpoint accepts a JSON array as the payload, where each element in the array corresponds to the specification of a function in your compute module. Our Python SDK ↗ provides a good reference on how to assemble this JSON payload.

### Function type reference

Below is a table showing the mapping between function input/output types and how those types are serialized over HTTP to a compute module:

| Foundry type   | Serialsed over HTTP as                            | Notes                                                |
|----------------|---------------------------------------------------|------------------------------------------------------|
| Integer        | int                                               |                                                      |
| Byte           | string                                            |                                                      |
| Boolean        | boolean                                           |                                                      |
| Binary         | string                                            |                                                      |
| Date           | string                                            |                                                      |
| Timestamp      | int                                               | Milliseconds since epoch                             |
| Decimal        | string                                            |                                                      |
| Float          | float                                             |                                                      |
| Array          | array (non-streaming), stream of JSON (streaming) |                                                      |
| Map            | JSON                                              | Key-value store (for exmaple, Python dict, Java Map) |
| Struct         | JSON                                              | Custom object type                                   |

## Automatic function schema inference

Compute modules offer a streamlined way to define and register functions, enabling automatic schema inference and integration with Foundry's Compute Module application. This section provides an in-depth look at the automatic registration of functions and advanced usage scenarios, ensuring a smoother development experience.

The imported function schemas will only appear in the Compute Modules interface once your compute module is running and responsive. This means that you must deploy and run your compute module for the functions to be visible and accessible in Foundry. Review our documentation on debugging using replica status for more details.

In your compute module, you can define the schema of a function using a JSON structure directly within your code. This approach offers several benefits:

- Centralized schema definition
- Easy maintenance and updates
- Automatic integration with Foundry

By making a simple POST call when your compute module starts up, the module automatically infers the schema from the endpoint call and makes it available as a function in the Computes Modules application. This allows developers to define endpoint schemas once and easily import them into Foundry.

### Example: Add function schema

Consider a simple add function, where inputs are x and y (two integers) and the output is a string. The example below shows how to define the JSON schema for this function:

schemas.json

```




{
    "functionName": "add",
    "inputs": [
        {
            "name": "x",
            "dataType": {
                "integer": {},
                "type": "integer"
            },
            "required": true,
            "constraints": []
        },
        {
            "name": "y",
            "dataType": {
                "integer": {},
                "type": "integer"
            },
            "required": true,
            "constraints": []
        }
    ],
    "output": {
        "single": {
            "dataType": {
                "string": {},
                "type": "string"
            }
        },
        "type": "single"
    }
}
```

Once you have defined your JSON schema, send an HTTP POST request in your app.py file to register it with Foundry:

```
if __name__ == "__main__":
    certPath = os.environ['CONNECTIONS_TO_OTHER_PODS_CA_PATH']
    postSchemaUri = os.environ["POST_SCHEMA_URI"]

    with open('schemas.json', 'r') as file:
        SCHEMAS = json.load(file)

    requests.post(
        postSchemaUri,
        json=SCHEMAS,
        headers={"Module-Auth-Token": moduleAuthToken, "Content-Type": "application/json"},
        verify=certPath
    )
```

Make sure to handle exceptions and implement proper error logging in a production environment.

Notice that the function adheres to the following constraints:

- The schema definition function must declare the types of all of its inputs and the type of its output, using the supported Python type (see table below).
- The schema definition of each function must declare a functionName that matches the Python function name.

| Python type       | Foundry type   | Serialsed over HTTP as                            | Notes                                                |
|-------------------|----------------|---------------------------------------------------|------------------------------------------------------|
| int               | Integer        | int                                               |                                                      |
| str               | Byte           | string                                            |                                                      |
| bool              | Boolean        | boolean                                           |                                                      |
| bytes             | Binary         | string                                            |                                                      |
| datetime.datetime | Date           | string                                            |                                                      |
| datetime.datetime | Timestamp      | int                                               | Milliseconds since epoch                             |
| decimal.Decimal   | Decimal        | string                                            |                                                      |
| float             | Float          | float                                             |                                                      |
| list              | Array          | array (non-streaming), stream of JSON (streaming) |                                                      |
| set               | Array          | array (non-streaming), stream of JSON (streaming) |                                                      |
| dict              | Map            | JSON                                              | Key-value store (for example, Python dict, Java Map) |
| class/TypedDict   | Struct         | JSON                                              | Custom object type                                   |
| Iterable          | Array          | array (non-streaming), stream of JSON (streaming) |                                                      |

### Automatic function discovery with the compute module SDK

The compute module SDK includes functionality for automatic function discovery. It inspects the defined functions and their input/output types, then converts them into FunctionSpecs that can be imported as Foundry Functions without modification.

To ensure this feature works seamlessly, you should understand how type inference works within the SDK and how to correctly define input and output types. Review the following considerations:

- The input class must be a complex type. Foundry Function specifications require the input type of a Function to be a complex type. If your function takes only a single primitive type as input, make sure to wrap that parameter in a complex type to properly infer your function schema.
- Input type definition

✅ TypedDict as input type

```


# app.py
from typing import TypedDict
from compute_modules.annotations import function

class HelloInput(TypedDict):
    planet: str

@function
def hello(context, event: HelloInput) -> str:
    return "Hello " + event["planet"] + "!"
```

✅ dataclass as input type

```


# app.py
from compute_modules.annotations import function
from dataclasses import dataclass
import datetime
import decimal

@dataclass
class TypedInput:
    bytes_value: bytes
    bool_value: bool
    date_value: datetime.date
    decimal_value: decimal.Decimal
    float_value: float
    int_value: int
    str_value: str
    datetime_value: datetime.datetime
    other_date_value: datetime.datetime

@function
def typed_function(context, event: TypedInput) -> str:
    diff = event.other_date_value - event.datetime_value
    return f"The difference between the provided dates is {diff}"
```

✅ Regular class with both class AND constructor type hints

```


# app.py
from compute_modules.annotations import function

class GoodExample:
    some_flag: bool
    some_value: int

    def __init__(self, some_flag: bool, some_value: int) -> None:
        self.some_flag = some_flag
        self.some_value = some_value

@function
def typed_function(context, event: GoodExample) -> int:
    return event.some_value
```

❌ AVOID Python class with no class type hints

```

# app.py
# This will raise an exception
class BadClassNoTypeHints:
    def __init__(self, arg1: str, arg2: int):
        ...
```

❌ AVOID Python class with Args in constructor

```
# app.py
# This will raise an exception
class BadClassArgsInit:
    arg1: str
    arg2: int

    def __init__(self, arg1: str, arg2: int, *args):
        ...
```

❌ AVOID Python class with Kwargs in constructor

```
# app.py
# This will raise an exception
class BadClassKwargsInit:
    arg1: str
    arg2: int

    def __init__(self, arg1: str, arg2: int, **kwargs):
        ...
```

- Streaming output: The compute module python SDK includes support for streaming output if it is any Iterable type (except dict). To enable result streaming, change @function to @function(streaming=True). You can review more details in our [SDK documentation ↗](https://github.com/palantir/python-compute-module?tab=readme-ov-file#advanced-usage-1---streaming-result). To make sure your streaming function is registered correctly, use any Iterabletype as the return type. Then the output will be registered as FoundryArray`.

If you do not set streaming=True, the result will be posted as a single JSON blob of the whole iterable. It may throw if your iterable is not able to be serialized in JSON. If you set streaming=True, the result will be posted as a stream of JSON blobs serialized from each element. Review more in our SDK documentation ↗.

✅ Regular Iterable as output type

```



# app.py
# The outputs will be registered as Foundry Array
from compute_modules.annotations import function

@function(streaming=True)
def get_string_list(context, event) -> list[str]:
    return [f'string {i}' for i in range(10)]

@function(streaming=True)
def get_string_set(context, event) -> set[str]:
    return {'string 1', 'string 2', 'string 3'}
```

✅ Generator as output type

```

# app.py
# Generator is Iterable. The output will be registered as Foundry Array
from compute_modules.annotations import function
import typing

@function(streaming=True)
def string_generator(context, event) -> typing.Iterable[str]:
    for i in range(10):
        yield f'string {i}'
```

⚠️ Regular Iterable as output type but streaming not enabled

```



# app.py
# This is valid. The output will be registered as Foundry Array, but the result will not be streamed
from compute_modules.annotations import function

@function
def get_string_list(context, event) -> list[str]:
    return [f'string {i}' for i in range(10)]
```

❌ Generator as output type but streaming not enabled

```


# app.py
# Generator is not JSON serializable as a whole object. Cannot be used in a non-streaming function since it serializes the whole object
# The output type will be registered as Foundry Array, but it will throw when executed
from compute_modules.annotations import function
import typing

@function
def string_generator(context, event) -> typing.Iterable[str]:
    for i in range(10):
        yield f'string {i}'
```

### Register the function

Follow the steps below to register your function:

1. Ensure your compute module is running.
2. Navigate to the Functions tab in the Compute Module application.
3. You should be able to view your function in the list of detected functions.
4. Select the function you want to register to open a pop-up window.
5. In the window, select Import.

## Integrate a server

Integrating a server in compute modules is in the experimental phase of development and may not be available on your enrollment. Functionality may change during active development.

Typically, compute modules use a client which pulls jobs from the compute modules API. However, you can also use an HTTP server in compute modules without any need for a client, adapter, or SDK.

### OpenAPI Specification

The OpenAPI Specification (OAS) ↗ is an open-source framework for enumerating HTTP APIs. You will first need to provide an OpenAPI specification for your server. There are many ways to create an OpenAPI specification for your server; you can do so manually or with an LLM assistant by following the OpenAPI documentation, using a generic OpenAPI generator, or using language-specific libraries.

To work with compute modules, your OpenAPI specification must adhere to all of the following constraints:

- Use OpenAPI Specification version 3.0.0 or higher.
- Include a single server with a URL of the form http://localhost:port.
- Include an operationId on each operation, which will be the name of the function in Foundry.
- Only use GET, PUT, POST, and DELETE verbs.
- Include the schema field on all parameters, and not use any parameters with cookie locations.
- Must not use anyOf, oneOf, or allOf schemas, or schemas with multiple types.
- Only include a single response code on all endpoints (since functions in Foundry only support a single output schema), which must be of application/json content type.

The following is an example of a Python server using Flask, and its accompanying OpenAPI specification:

```



from flask import Flask, request, jsonify
import uuid

app = Flask(__name__)

books = {}


@app.route('/books', methods=['POST'])
def add_book():
    data = request.json

    user_id = request.headers.get('User-ID')
    title = data.get('title')
    author = data.get('author')
    published_year = int(data.get('published_year'))

    book_id = str(uuid.uuid4())

    books[book_id] = {
        'title': title,
        'author': author,
        'published_year': published_year,
        'added_by': user_id
    }
    return jsonify(book_id), 200


@app.route('/books/<book_id>', methods=['GET'])
def get_book(book_id):
    return jsonify(books.get(book_id)), 200


if __name__ == '__main__':
    app.run(port=8000)
```

```






{
  "openapi": "3.0.0",
  "servers": [
    {
      "url": "http://localhost:8000"
    }
  ],
  "paths": {
    "/books": {
      "post": {
        "operationId": "addBook",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "title": {
                    "type": "string"
                  },
                  "author": {
                    "type": "string"
                  },
                  "published_year": {
                    "type": "integer"
                  }
                }
              }
            }
          }
        },
        "parameters": [
          {
            "name": "User-ID",
            "in": "header",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/books/{book_id}": {
      "get": {
        "operationId": "getBook",
        "parameters": [
          {
            "name": "book_id",
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string"
                    },
                    "author": {
                      "type": "string"
                    },
                    "published_year": {
                      "type": "integer"
                    },
                    "added_by": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### Using your server

When building your Docker image, use the server.openapi image label with the value as your OpenAPI specification. The following is a Dockerfile for the example above with the server's specification attached:

```
FROM python:3.12

EXPOSE 8000

RUN pip install flask
COPY src .

USER 5000

LABEL server.openapi='{"openapi":"3.0.0","servers":[{"url":"http://localhost:8000"}],"paths":{"/books":{"post":{"operationId":"addBook","requestBody":{"content":{"application/json":{"schema":{"type":"object","properties":{"title":{"type":"string"},"author":{"type":"string"},"published_year":{"type":"integer"}}}}}},"parameters":[{"name":"User-ID","in":"header","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"string"}}}}}}},"/books/{book_id}":{"get":{"operationId":"getBook","parameters":[{"name":"book_id","in":"path","schema":{"type":"string"}}],"responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"title":{"type":"string"},"author":{"type":"string"},"published_year":{"type":"integer"},"added_by":{"type":"string"}}}}}}}}}}}'

CMD ["python", "app.py"]
```

Build, publish, select your image, and save your compute module configuration as normal. Then, navigate to the Functions tab and select Detect from OpenAPI specification. You can then import your functions and view the OpenAPI specification from which they were generated. These functions can be used throughout the Foundry platform.

Do not manually modify your function definitions - they must be kept in line with the OpenAPI specification attached to your image.

## Use compute module functions in TypeScript functions

Prerequisites:

- You must register your function in the Compute Module application with an API name.
- You must have the compute module running for live preview to work.
- You must initialize a TypeScript code repository.

### Enable resource generation

Before you begin, ensure that resource generation is enabled in your Typescript code repository:

- Open your functions.json file.
- Set the enableResourceGeneration property to true.

### Import your compute module function

To import a compute module function in TypeScript, follow the steps below:

1. From the left panel of the Compute Modules application, find and select the Resource imports tab.
2. Select Add, then select Query Functions to display a pop-up window to select an Ontology.
3. Although compute modules are not tied to a specific Ontology, you must select one for the import process. Choose any Ontology that suits your use case.
4. Search for your compute module function's API name.
5. Select the function.
6. Choose Confirm selection.

### Rebuild your code workspace

### Import and use the function

The example below shows how to import and use a compute module function:

```
// index.ts
import { Function } from "@foundry/functions-api";

// API Name: com.mycustomnamespace.computemodules.Add
import { add } from "@mycustomnamespace/computemodules";

export class MyFunctions {
    @Function()
    public async myFunction(): Promise<string> {
        return await add({ x: 50, y: 50 });
    }
}
```

### Important considerations

- Project location: Ensure the compute module is in the same Project as your TypeScript code for live preview to work correctly.
- Type consistency: TypeScript enforces strict type checking. Ensure the declared return type matches the actual return type of your compute module function. For example, if you declare a string return type, your registered compute module function must return a string, not a struct type.
- Asynchronous operations: Compute module functions are typically asynchronous. Use async/await syntax for proper handling.

Since TypeScript functions go through the function-executor, only compute module functions that take less than five minutes will succeed. If the function takes longer than five minutes, it will time out.

## Contents

- Functions
    - Register functions
    - Automatic function schema inference
    - Integrate a server
    - Use compute module functions in TypeScript functions



