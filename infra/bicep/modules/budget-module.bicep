targetScope = 'subscription'
param budgetName string
param amount int
param contactEmails array

resource budget 'Microsoft.Consumption/budgets@2021-10-01' = {
  name: budgetName
  scope: subscription()  // Explicit subscription scope
  properties: {
    category: 'Cost'
    amount: amount
    timeGrain: 'Monthly'
    timePeriod: {
      startDate: '2025-01-01T00:00:00Z'
      endDate: '2099-12-31T23:59:59Z'
    }
    notifications: {
      Actual_GreaterThan_80: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 80
        contactEmails: contactEmails
      }
    }
  }
}
