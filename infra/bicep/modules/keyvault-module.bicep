// keyvault-module.bicep

// Parameters
param keyVaultName string
param location string = resourceGroup().location
param skuName string = 'standard'
param skuFamily string = 'A'
param tenantId string = subscription().tenantId

// Optional parameters
param enabledForDeployment bool = false
param enabledForDiskEncryption bool = false
param enabledForTemplateDeployment bool = true
param softDeleteRetentionInDays int = 90
param enableRbacAuthorization bool = false

// Access policy parameters (optional)
param accessPolicies array = []

// Tags
param tags object = {}

// Create Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    enabledForDeployment: enabledForDeployment
    enabledForDiskEncryption: enabledForDiskEncryption
    enabledForTemplateDeployment: enabledForTemplateDeployment
    tenantId: tenantId
    accessPolicies: accessPolicies
    sku: {
      name: skuName
      family: skuFamily
    }
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
    softDeleteRetentionInDays: softDeleteRetentionInDays
    enableRbacAuthorization: enableRbacAuthorization
  }
}

// Outputs
output keyVaultId string = keyVault.id
output keyVaultName string = keyVault.name
output keyVaultUri string = keyVault.properties.vaultUri
