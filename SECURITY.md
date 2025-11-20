# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in OKIT, please email: security@oracle.com

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Recent Security Fixes

### [v0.68.0] - 2025-01 - Path Traversal via Symbolic Links in Git Clone

**Severity:** HIGH

**Description:**  
Fixed a path traversal vulnerability that allowed arbitrary file reads through symbolic links in cloned Git repositories.

**Impact:**  
Attackers could read sensitive files including SSH keys, OCI credentials, and system files.

**Fix:**  
- Added URL allowlist validation
- Implemented symlink detection and removal
- Moved Git storage outside web-accessible directories
- Added path traversal prevention

## Security Best Practices

When deploying OKIT:

1. **Configure Git Allowlist**: Only add trusted repositories to the allowlist
2. **Use HTTPS**: Always use HTTPS URLs for Git repositories
3. **Access Control**: Implement authentication for OKIT endpoints
4. **Network Isolation**: Deploy behind firewall or VPN
5. **Monitor Logs**: Watch for security events
6. **Keep Updated**: Regularly update to get latest security fixes

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.68.x  | :white_check_mark: |
| 0.67.x  | :x: (vulnerable)   |
| < 0.67  | :x:                |
