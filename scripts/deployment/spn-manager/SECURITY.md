# Security Model

## Trust Zones
```mermaid
graph LR
  A[SPN Scripts] -->|MSI| B(Key Vault)
  A -->|Azure CLI| C[Azure AD]
  C -->|JWT| D[Website]
```

## Controls
```markdown
| Control          | Command                      |
|------------------|------------------------------|
| Access Review    | `az role assignment list`    |
| Secret Expiry    | `az keyvault secret show`    |
```

## TODOs (Security)
```markdown
- [ ] Penetration test plan
- [ ] Key Vault purge protection
```