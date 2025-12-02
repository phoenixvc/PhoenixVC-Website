// Azure Communication Services Email Module
// This module deploys Azure Communication Services with Email capability

param location string = resourceGroup().location
param acsName string
param emailDataLocation string = 'unitedstates' // Email data location
param tags object = {}

// Azure Communication Services resource
resource communicationService 'Microsoft.Communication/communicationServices@2023-04-01' = {
  name: acsName
  location: 'global' // ACS is a global service
  tags: tags
  properties: {
    dataLocation: emailDataLocation
  }
}

// Email Communication Services resource
resource emailService 'Microsoft.Communication/emailServices@2023-04-01' = {
  name: '${acsName}-email'
  location: 'global' // Email service is also global
  tags: tags
  properties: {
    dataLocation: emailDataLocation
  }
}

// Azure managed domain for email (free tier)
resource emailDomain 'Microsoft.Communication/emailServices/domains@2023-04-01' = {
  parent: emailService
  name: 'AzureManagedDomain'
  location: 'global'
  properties: {
    domainManagement: 'AzureManaged'
    userEngagementTracking: 'Disabled'
  }
}

// Link the email service to the communication service
resource acsEmailConnection 'Microsoft.Communication/communicationServices/emailServices@2023-04-01' = {
  parent: communicationService
  name: emailService.name
}

// Outputs
output acsName string = communicationService.name
output acsEndpoint string = communicationService.properties.hostName
output emailServiceName string = emailService.name
output senderAddress string = 'DoNotReply@${emailDomain.properties.mailFromSenderDomain}'
