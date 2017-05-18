# Azure IOT AVRO

## Setup Steps

### Project Installation

Start by installing all dependencies with:

```sh
node install.js
```

This process will take several minutes, now would be a good time to grab a coffee.

### Cosmos DB

To set up an instance of Cosmos DB you will first need an [Azure](https://azure.microsoft.com/en-us/account/) account. 

## Debugging the common module

If you need to debug and edit the common module, you need to go through a couple of steps first. Run the following commands:

```sh
cd common
npm link
cd ../client
npm link common
cd ../server/decompress
npm link common
cd ../message
npm link common
cd ../schema
npm link common
```

## Microservices Overview

### Schema Service

