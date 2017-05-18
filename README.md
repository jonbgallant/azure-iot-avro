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

## Deploying to Service Fabric
The 'sfdeployment'directory contains everything you should need to deploy the services as a service fabric guest app, into either a local or remote service fabric cluster:

### Pre requisites
You'll need to follow the azure guide to [Setting up a service fabric dev. environment](https://docs.microsoft.com/en-us/azure/service-fabric/service-fabric-get-started)

### Deploying to local cluster.
1) Load the IoTAzure solution, and build the guest executable package.
2) Right click the 'IoTAzureSF' service (just beneath the solution) and select 'Publish'
3) Select the publish profile for your local cluster configuration (1 node or 5 node).
4) Ensure the 'upgrade' box is not checked.
5) Click Publish, the package and deploy process can sometimes take a while, so be patient, any errors in packaging appear in the build output, rollout/startup issues appear in the cluster logs. 

NB: During deployment, cluster will report unhealthy whilst the number of micro service instances is less than the target number. Whilst the app is in 'Building' status, this is expected. If app goes to 'ready' and is still unhealthy, check logs for a likely exception.