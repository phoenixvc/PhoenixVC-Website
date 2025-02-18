# Azure DNS Record Fetcher

A comprehensive Bash script for fetching and displaying DNS records from Azure DNS zones with support for detailed and table-based output formats.

## Features

- Multiple display modes (table, detailed, or both)
- Configurable output formats
- Color-coded output for better readability
- Support for all common DNS record types (A, CNAME, MX, TXT, NS, SOA)
- Progress indicators and verbose logging
- Error handling and input validation
- Temporary file cleanup
- Support for output redirection to file

## Prerequisites

- Azure CLI (`az`) version 2.0.0 or higher
- `jq` for JSON processing
- Active Azure subscription and login
- Python3 (for version comparison)
- Bash shell environment

## Installation

1. Download the script:
```bash
curl -O https://raw.githubusercontent.com/username/azure-dns-record-fetcher/main/azure-dns-record-fetcher.sh
```

2. Make it executable:
```bash
chmod +x azure-dns-record-fetcher.sh
```

## Usage

### Basic Usage

```bash
./azure-dns-record-fetcher.sh -g <resource-group> -z <dns-zone>
```

### Command Line Options

- `-g, --resource-group`: Azure resource group name
- `-z, --dns-zone`: DNS zone name
- `-m, --mode`: Display mode (table, detailed, or both)
- `-o, --output`: Write output to file
- `-v, --verbose`: Increase verbosity (logging)
- `-d, --debug`: Enable debug mode
- `-h, --help`: Display help message

### Examples

1. Basic usage with default settings:
```bash
./azure-dns-record-fetcher.sh -g myResourceGroup -z example.com
```

2. Output to file in table format:
```bash
./azure-dns-record-fetcher.sh -g myResourceGroup -z example.com -m table -o dns_records.txt
```

3. Verbose output with both display modes:
```bash
./azure-dns-record-fetcher.sh -g myResourceGroup -z example.com -m both -v
```

## Display Modes

### 1. Table Format
Displays a comprehensive overview of all DNS records in a tabular format with the following columns:
- Type
- Name
- Value/Target
- TTL
- State

Example output:
```
Type     Name                 Value/Target                                TTL      State
================================================================================
A        www                  192.168.1.1, 192.168.1.2                  3600     Succeeded
CNAME    blog                 www.example.com                           3600     Succeeded
MX       @                    10 mail1.example.com, 20 mail2.example.com 3600    Succeeded
TXT      _spf                "v=spf1 include:spf.example.com -all"      3600     Succeeded
NS       @                    ns1.example.com, ns2.example.com          3600     Succeeded
SOA      @                    ns1.example.com admin.example.com S/N:2024021801 Refresh:3600 Retry:300 Expire:2419200 MinTTL:300   3600    Succeeded
```

### 2. Detailed Format
Shows detailed information for each record type, including:
- Record Set Name
- FQDN
- TTL
- Record-specific values
- Provisioning State
- Resource ID

Example output:
```
=== A Records ===
Record Set: www
FQDN: www.example.com
TTL: 3600
IP Addresses:
  - 192.168.1.1
  - 192.168.1.2
State: Succeeded
Resource ID: /subscriptions/.../A/www
```

## Configuration

### Environment Variables

- `AZURE_DNS_FETCHER_COLOR`: Set to "false" to disable colored output
- `AZURE_DNS_FETCHER_MAX_WIDTH`: Maximum width for table columns (default: 50)
- `AZURE_DNS_FETCHER_TEMP_DIR`: Custom temporary directory path

### Column Widths

Default column widths can be adjusted by modifying these variables:
```bash
COL_WIDTH_TYPE=8
COL_WIDTH_NAME=20
COL_WIDTH_VALUE=50
COL_WIDTH_TTL=8
COL_WIDTH_STATE=10
```

## Error Handling

The script includes comprehensive error handling for:
- Missing dependencies
- Invalid parameters
- Azure CLI authentication issues
- DNS zone access problems
- JSON processing errors
- File system operations

## Temporary Files

The script creates temporary files for each DNS record type in either:
- The system temporary directory (`/tmp` on Linux)
- A custom directory specified by `AZURE_DNS_FETCHER_TEMP_DIR`

These files are automatically cleaned up on script exit.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Azure CLI documentation
- jq manual
- Community feedback and contributions

## Support

For bugs, questions, and discussions, please use the GitHub Issues.
