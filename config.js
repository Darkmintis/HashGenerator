/**
 * HashGenerator - Professional Hash Generation Tool
 * Configuration File
 */

window.HASHGEN_CONFIG = {
    // App info
    APP_NAME: "HashGenerator",
    VERSION: "v1.0",
    
    // Features
    FEATURES: {
        CLIENT_SIDE_GENERATION: true,
        OFFLINE_MODE: true,
        BULK_GENERATION: true,
        MULTI_THREADING: true,
        DARK_MODE: true
    },
    
    // Supported hash types grouped by category
    HASH_TYPES: {
        BASIC: [
            { id: "md5", name: "MD5", supports_salt: false },
            { id: "sha1", name: "SHA1", supports_salt: false },
            { id: "sha224", name: "SHA224", supports_salt: false },
            { id: "sha256", name: "SHA256", supports_salt: false },
            { id: "sha384", name: "SHA384", supports_salt: false },
            { id: "sha512", name: "SHA512", supports_salt: false }
        ],
        PASSWORD_HASHING: [
            { id: "md5-crypt", name: "MD5 Crypt ($1$)", supports_salt: true },
            { id: "bcrypt", name: "bcrypt ($2a$)", supports_salt: true, default_cost: 10 },
            { id: "sha256-crypt", name: "SHA-256 Crypt ($5$)", supports_salt: true },
            { id: "sha512-crypt", name: "SHA-512 Crypt ($6$)", supports_salt: true }
        ],
        MODERN: [
            { id: "pbkdf2", name: "PBKDF2", supports_salt: true, default_iterations: 10000 },
            { id: "argon2", name: "Argon2id", supports_salt: true },
            { id: "scrypt", name: "scrypt", supports_salt: true },
            { id: "yescrypt", name: "yescrypt", supports_salt: true }
        ],
        SPECIAL: [
            { id: "ntlm", name: "NTLM", supports_salt: false },
            { id: "mysql-sha1", name: "MySQL SHA1", supports_salt: false },
            { id: "netntlmv2", name: "NetNTLMv2", supports_salt: true },
            { id: "wpa-pmkid", name: "WPA-PMKID", supports_salt: true }
        ]
    },
    
    // Performance settings
    PERFORMANCE: {
        MAX_WORKERS: navigator.hardwareConcurrency || 4,
        BATCH_SIZE: 5000,
        UPDATE_INTERVAL_MS: 200
    },
    
    // Storage keys
    STORAGE_KEYS: {
        HISTORY: "hashGenHistory",
        SETTINGS: "hashGenSettings"
    }
};
