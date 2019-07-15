# Micropayment Server

This Payment Server is an open source demo application that helps content publishers monetize their work easily.

## Docker Environment

A Dockerized development environment for applications based on Micropayment Server.

The repository contains two Dockerfiles.

-   ps-staging.Dockerfile for staging environments
-   ps-production.Dockerfile for production environments

The Docker images depends on .env files for loading configurations.

The ps-staging.Dockerfile read configurations from .env.staging file and

The ps-production.Dockerfile read configurations from .env.production file.

The sample .env file can be found as `.env.sample`. The .env files must be prepared before running docker image.

### Building

Docker images can be build with

1. `npm run docker:build:staging` for **Staging**

2. `npm run docker:build:production` for **Production**

The image named `hedera-payment-server` will be created.

### Running

The built docker images can be runned with

`npm run docker:run:production` for **Staging**

`npm run docker:run:staging` for **Production**

This will start the micropayment server at http://localhost:8099.

## Kubernetes

This directory contains a number of examples of how to run micropayment server with Kubernetes.

1. Prerequisites
2. Kube Files
3. Setup
4. Exposing Services

### Prerequisites

1. A `docker registry`
2. A `hedera-payment-server` image on a docker registry
3. A `Kubernetes` Cluster
4. A Redis Cluster running inside the kubernetes ( [How To Setup Redis Cluster in Kubernetes](https://medium.com/zero-to/setup-persistence-redis-cluster-in-kubertenes-7d5b7ffdbd98))
5. Traefik ( [How to install Traefix in Kubernetes](https://docs.traefik.io/user-guide/kubernetes/) )

### Kube Files

The Kubernetes configuration can be found in `${project_root}/kubernetes_configurations`

The configurations folder includes

1. micropayment-deployment.yml
2. micropayment-svc.yml

### Setup

#### Setting up regcred for Docker registery credentials

regcred secrets is required to pull the image from docker registery. You can create regcred secrets with the following

```bash
kubectl create secret generic regcred
    --from-file=.dockerconfigjson=~/.docker/config.json \
    --type=kubernetes.io/dockerconfigjson
```

You can see created regcred secrets with

```bash
kubectl get secrets
```

#### Setting up configmap for env files

You can create configmap for .env files by executing kubectl command.

```bash
kubectl create configmap --dry-run micropayment-config --from-file=.env.staging --output yaml  | tee .env.staging.yaml > micropayment-env-configmap.yml && kubectl apply -f micropayment-env-configmap.yml
```

This will create .env.staging configmap which will be used later in our pods.

**NOTES**

Please change .env.staging to .env.production if you want to run in production environment.

**REDIS_HOST** in .env files for kubernetes should be the redis service running in kubernetes. If the redis is installed from above link. The REDIS_HOST is `redis-cluster`.

### Creating Pods and Services

#### Creating Pods

The micropayment-deployment.yml is responsible for creating of pods that will contains micropayment server.

The volumeMounts and image in micropayment-deployment.yml need to be changed according to the environment you are running.

```
...
# This need to be changed to image of your docker registry
image: index.docker.io/hederahashgraph/payment-server:1.0.3
...
# This need to be changed according to the environment you are running
volumeMounts:
            - name: micropayment-config
              mountPath: /usr/src/app/.env.staging
              subPath: .env.staging
```

Now we can create pods by executing

`kubectl apply -f micropayment-deployment.yml`

You can explore the pods by using

`kubectl get pods`

You can the pods are starting to create and after a while you can see 12 pods created.

#### Creating Services

The micropayment-svc.yml is reponsible for creating service for the created pods.

The micropayment service can be created by applying micropayment-svc.yaml

`kubectl apply -f micropayment-svc.yml`

You can see the service is being created with

`kubectl get svc`

#### Exposing Services

You can expose the created service with

`kubectl port-forward svc/micropayment-svc 8001:80`

The micropayment-server can be browsed on http://localhost:8001
