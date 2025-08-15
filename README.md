# HashGenerator

Professional client-side hash generation tool for developers, security professionals, and CTF players. Designed as a web-based tool for generating various types of hashes directly in your browser.

## Features

- **100% Client-side**: All processing happens in your browser - no server needed
- **Comprehensive hash support**: 20+ hash types including memory-hard functions
- **Multi-threaded**: Uses Web Workers for parallel processing of bulk hashing
- **Real-time updates**: Live hash generation as you type
- **Custom salt support**: Add custom salts for stronger hashes
- **Password strength meter**: Evaluates password strength before hashing
- **Copy to clipboard**: Easily copy generated hashes
- **Dark/Light mode**: Choose your preferred visual theme
- **Responsive design**: Works on mobile, tablet, and desktop
- **Hash history**: Track previously generated hashes
- **Bulk generation**: Generate hashes for multiple inputs at once

## Supported Hash Types

HashGenerator supports generating the following hash types:

| Hash Type | Description | Example/Format |
|-----------|-------------|----------------|
| MD5 | 32 characters, hexadecimal | `5f4dcc3b5aa765d61d8327deb882cf99` |
| SHA1 | 40 characters, hexadecimal | `5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8` |
| SHA224 | 56 characters, hexadecimal | `d14a028c2a3a2bc9476102bb288234c415a2b01f828ea62ac5b3e42f` |
| SHA256 | 64 characters, hexadecimal | `5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8` |
| SHA384 | 96 characters, hexadecimal | `a8b64babd0aca91a59bdbb7761b421d4f2bb38280d3a75ba0f21f2bebc45583d446c598660c94ce680c47d19c30783a7` |
| SHA512 | 128 characters, hexadecimal | `b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5e07394c706a8bb980b1d7785e5976ec049b46df5f1326af5a2ea6d103fd07c95385ffab0cacbc86` |
| MD5 Crypt | Starts with `$1$` | `$1$salt$hash` |
| bcrypt | Starts with `$2a$` or `$2b$` | `$2a$10$salt_and_hash` |
| SHA-256 Crypt | Starts with `$5$` | `$5$salt$hash` |
| SHA-512 Crypt | Starts with `$6$` | `$6$salt$hash` |
| NTLM | 32 characters | `8846F7EAEE8FB117AD06BDD830B7586C` |
| MySQL-SHA1 | Format: `*<40 HEX CHARS>` | `*2470C0C06DEE42FD1618BB99005ADCA2EC9D1E19` |
| PBKDF2 | Format varies with implementation | `$pbkdf2$iterations$salt$hash` |
| yescrypt | Modern password hashing | `$y$params$salt$hash` |
| Argon2 | Winner of PHC competition | `$argon2id$v=19$m=65536,t=3,p=4$salt$hash` |
| scrypt | Memory-hard hashing function | `$scrypt$params$salt$hash` |
| NetNTLMv2 | Windows authentication | `hash:challenge` |
| WPA-PMKID | WiFi password hashing | `pmkid*mac1*mac2` |

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/Darkmintis/HashGenerator.git
   cd HashGenerator
   ```

2. Open `index.html` in your browser or serve with a web server

3. Enter text, select hash algorithms, and generate hashes

## Usage

1. **Enter Input**: Type or paste the text you want to hash
2. **Select Algorithm**: Choose from the supported hash algorithms
3. **Add Salt (Optional)**: Enter a custom salt for algorithms that support it
4. **Generate Hash**: The hash will be automatically generated and displayed
5. **Copy Result**: Click on the hash to copy it to clipboard

## Architecture

- **Frontend**: HTML/CSS/JavaScript
- **Hash Library**: CryptoJS for cryptographic functions
- **Processing**: Web Workers for multi-threaded bulk hashing
- **Storage**: LocalStorage for results persistence

## File Structure

```
HashGenerator/
├── index.html          # Main application
├── css/style.css       # Styling
├── js/
│   ├── app.js          # Main application logic
│   ├── hash-generator.js # Core hash generation logic
│   └── offline.js      # Offline capabilities
├── config.js           # Configuration settings
└── README.md           # Documentation
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Related Projects

- [HashCrack](https://github.com/Darkmintis/HashCrack) - A companion project for cracking hashes
