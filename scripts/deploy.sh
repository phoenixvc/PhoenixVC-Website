#!/bin/bash

# Resource Group name follows the convention: [env]-[loc]-[rsc]-[proj]
RESOURCE_GROUP="prod-za-rg-phoenixvc"
BICEP_FILE="./infra/bicep/main.bicep"
PARAMETERS_FILE="./infra/bicep/parameters.json"

# Create resource group if it doesn't exist. Adjust the location as needed.
az group create --name "$RESOURCE_GROUP" --location "South Africa North"

# Deploy the Bicep file to the resource group.
az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "$BICEP_FILE" \
  --parameters @"$PARAMETERS_FILE"