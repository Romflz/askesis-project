import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const js = (...lines: string[]) => code('javascript', ...lines)
const py = (...lines: string[]) => code('python', ...lines)

const CARDS: CardContent[] = [
  // Principles
  {
    front: 'The CIA triad',
    back: 'Confidentiality (only authorized people can read data), Integrity (data isn’t altered undetected) and Availability (systems and data are usable when needed)',
  },
  {
    front: 'Which CIA property does each attack hit: DDoS, a leaked database, a tampered invoice?',
    back: 'DDoS: availability. Leaked database: confidentiality. Tampered invoice: integrity',
    extra: 'Ransomware hits availability, and confidentiality too when attackers also steal and threaten to publish data.',
  },
  {
    front: 'Authentication vs authorization',
    back: 'Authentication verifies who you are; authorization decides what you are allowed to do',
    extra:
      'In HTTP, 401 Unauthorized actually means “not authenticated”, while 403 Forbidden means authenticated but not allowed.',
  },
  {
    front: 'Vulnerability vs threat vs risk',
    back: 'A vulnerability is a weakness; a threat is something that could exploit it; risk is the likelihood of that happening combined with its impact',
  },
  {
    front: 'Principle of least privilege',
    back: 'Give every user, service and process only the permissions it needs, for only as long as it needs them, which limits the damage when an account is compromised',
  },
  {
    front: 'Defense in depth',
    back: 'Layering independent controls (network filtering, MFA, patching, encryption, monitoring, backups) so that when one fails, others still protect you',
  },
  {
    front: 'Zero trust',
    back: '“Never trust, always verify”: no user or device is trusted because of its network location; every request is authenticated, authorized and encrypted, with least privilege and an assumption that a breach has already happened',
    extra: 'NIST SP 800-207 is the standard reference.',
  },
  // People and passwords
  {
    front: 'Phishing',
    back: 'Fraudulent messages that impersonate a trusted sender to trick people into revealing credentials, paying money or running malware',
    extra: 'Spear phishing targets specific people, whaling targets executives, smishing uses SMS and vishing uses voice calls.',
  },
  {
    front: 'Red flags of a phishing email',
    back: 'Urgency or threats, a sender or link domain that is slightly off, links whose real target differs from the text, unexpected attachments, and requests for credentials, payment or changed bank details',
  },
  {
    front: 'Brute force vs credential stuffing vs password spraying',
    back: 'Brute force tries many passwords against one account; credential stuffing replays username–password pairs leaked from other sites; password spraying tries a few common passwords against many accounts to avoid lockouts',
    extra: 'MFA and blocking known-breached passwords defeat most of these.',
  },
  // Web attacks
  {
    front: 'Cross-site scripting (XSS)',
    back: 'An attacker gets their script to run in other users’ browsers on a trusted site, where it can steal data or act as the user',
    extra:
      'Stored XSS is saved on the server (e.g. in a comment), reflected XSS bounces off a request parameter, and DOM-based XSS happens entirely in client-side JavaScript.',
  },
  {
    front: 'Prevent XSS when displaying user input with plain JavaScript',
    back: js(
      '// Vulnerable: the input is parsed as HTML',
      'el.innerHTML = comment',
      '',
      '// Safe: the input is shown as text',
      'el.textContent = comment',
    ),
    extra:
      'Frameworks like React escape output by default; when you must render user HTML, sanitize it with a library such as DOMPurify.',
  },
  {
    front: 'Content Security Policy (CSP)',
    back: 'A response header that tells the browser which sources of scripts, styles and other resources are allowed, so injected scripts are blocked even if an XSS bug slips through',
    extra:
      "Example: `Content-Security-Policy: default-src 'self'`. Inline scripts are blocked unless allowed with a nonce or hash.",
  },
  {
    front: 'Cross-site request forgery (CSRF)',
    back: 'A malicious site makes a logged-in user’s browser send an unwanted request, such as a transfer or password change, to a site that trusts the user’s cookies',
  },
  {
    front: 'How do you prevent CSRF?',
    back: 'Require an anti-CSRF token on state-changing requests, set session cookies to `SameSite=Lax` or `Strict`, check the `Origin` header, and never change state with GET requests',
  },
  {
    front: 'Session cookie flags `HttpOnly`, `Secure` and `SameSite`',
    back: '`HttpOnly` hides the cookie from JavaScript (limiting theft via XSS), `Secure` sends it only over HTTPS, and `SameSite` limits sending it on cross-site requests (limiting CSRF)',
  },
  {
    front: 'SQL injection, and the fix',
    back: py(
      '# Vulnerable: input becomes part of the SQL',
      'cur.execute(f"SELECT * FROM users WHERE email = \'{email}\'")',
      '',
      '# Safe: a parameterized query',
      'cur.execute("SELECT * FROM users WHERE email = %s", (email,))',
    ),
    extra:
      "With the vulnerable version, an input like `' OR '1'='1` changes the query’s logic. Parameterized queries send data separately from the SQL.",
  },
  {
    front: 'Man-in-the-middle (MITM) attack',
    back: 'An attacker secretly sits between two parties, reading or altering their traffic, for example through a rogue Wi-Fi hotspot, ARP spoofing or DNS spoofing',
    extra: 'TLS with proper certificate validation is the main defense.',
  },
  {
    front: 'HSTS',
    back: 'HTTP Strict Transport Security: a header (`Strict-Transport-Security: max-age=31536000; includeSubDomains`) telling browsers to use only HTTPS for the site, which defeats SSL-stripping attacks',
    extra: 'Sites can join browsers’ HSTS preload list so even the first visit uses HTTPS.',
  },
  {
    front: 'Server-side request forgery (SSRF)',
    back: 'Tricking a server into making requests to places the attacker can’t reach directly, such as internal services or the cloud metadata endpoint at `169.254.169.254`',
    extra: 'Defenses: allowlist destinations, block internal address ranges, and require IMDSv2 on AWS.',
  },
  {
    front: 'Changing `/invoices/1001` to `/invoices/1002` shows someone else’s invoice. What is the flaw?',
    back: 'Broken access control, specifically an insecure direct object reference (IDOR): the server doesn’t check that the user owns the object',
    extra: 'Fix it by checking authorization on the server for every request; hard-to-guess IDs alone aren’t enough.',
  },
  // Malware and other attacks
  {
    front: 'DoS vs DDoS',
    back: 'A denial-of-service attack overwhelms a system from one source; a distributed attack uses many sources, often a botnet, which makes it much harder to block',
    extra: 'Mitigations include CDNs and scrubbing services, rate limiting and autoscaling.',
  },
  {
    front: 'Ransomware, and the best defense',
    back: 'Malware that encrypts (and often steals) data and demands payment. The key defense is offline or immutable backups with tested restores, plus patching, MFA and least privilege',
  },
  {
    front: 'Virus vs worm vs trojan',
    back: 'A virus attaches to files and spreads when they run; a worm spreads across networks on its own; a trojan poses as legitimate software to get installed',
  },
  {
    front: 'Zero-day vulnerability',
    back: 'A flaw the vendor doesn’t know about or hasn’t patched yet, so there is no fix available when attackers start exploiting it',
  },
  {
    front: 'Software supply chain attack',
    back: 'Compromising software you depend on, such as a library, build tool or update server, to reach every user of it',
    extra:
      'Examples: SolarWinds (2020) and the xz Utils backdoor (2024). Defenses: lockfiles, dependency scanning, verified signatures and an SBOM.',
  },
  // Cryptography
  {
    front: 'Hashing vs encryption',
    back: 'Hashing is one-way: it turns data into a fixed-size digest that can’t be reversed (integrity checks, password storage). Encryption is two-way: data can be decrypted with the right key (confidentiality)',
  },
  {
    front: 'Is Base64 encryption?',
    back: 'No. Base64 is an encoding: anyone can decode it without a key. It only makes binary data safe to transport as text',
  },
  {
    front: 'Properties of a cryptographic hash function',
    back: 'Deterministic, fast to compute, infeasible to reverse (preimage resistance), infeasible to find two inputs with the same hash (collision resistance), and a tiny input change completely changes the output',
    extra: 'MD5 and SHA-1 are broken for collision resistance; use SHA-256 or SHA-3 instead.',
  },
  {
    front: 'Why not store passwords as SHA-256 hashes?',
    back: 'General-purpose hashes are fast, so attackers can test billions of guesses per second on GPUs. Use a slow, salted password hashing algorithm: Argon2id, scrypt, bcrypt or PBKDF2',
    extra: 'OWASP recommends Argon2id first.',
  },
  {
    front: 'Salt',
    back: 'A unique random value stored next to each password hash, so identical passwords produce different hashes and precomputed rainbow tables are useless',
    extra: 'A salt isn’t secret. A pepper is an extra secret value kept outside the database, such as in a secrets manager.',
  },
  {
    front: 'Symmetric encryption',
    back: 'The same secret key encrypts and decrypts. It is fast, but both sides must somehow share the key securely',
    extra: 'Examples: AES (e.g. AES-256-GCM) and ChaCha20-Poly1305.',
  },
  {
    front: 'Asymmetric (public-key) encryption',
    back: 'A key pair: the public key can be shared and is used to encrypt or verify, while the private key stays secret and is used to decrypt or sign. It is much slower than symmetric encryption',
    extra:
      'Examples: RSA and elliptic-curve algorithms such as X25519 and Ed25519. Post-quantum algorithms such as ML-KEM are being rolled out alongside them.',
  },
  {
    front: 'Bob wants to send Alice a secret message and prove it is from him. Which keys does he use?',
    back: 'He encrypts with Alice’s public key, so only her private key can decrypt it, and signs with his own private key, so anyone can verify it with his public key',
  },
  {
    front: 'Digital signature',
    back: 'A value computed over a message’s hash with the signer’s private key; anyone can verify it with the public key, proving integrity and authenticity',
    extra: 'It also gives non-repudiation: the signer can’t plausibly deny signing.',
  },
  {
    front: 'How does TLS use both symmetric and asymmetric cryptography?',
    back: 'Asymmetric cryptography authenticates the server (its certificate and signature) and runs a key exchange such as ECDHE to agree on shared keys; fast symmetric encryption such as AES-GCM then protects the actual data',
  },
  {
    front: 'TLS certificate',
    back: 'A document binding a public key to a domain name, signed by a certificate authority (CA); browsers accept it if it chains up to a root CA in their trust store and is valid for the domain',
    extra:
      'The maximum lifetime of public TLS certificates is being cut in steps, to 200 days in 2026 and 47 days by 2029, so automated renewal (such as ACME with Let’s Encrypt) is essential.',
  },
  {
    front: 'What did TLS 1.3 change?',
    back: 'A faster handshake (one round trip), mandatory forward secrecy, and removal of legacy options such as RSA key exchange, CBC-mode ciphers, RC4 and SHA-1',
    extra: 'TLS 1.0 and 1.1 are formally deprecated; use TLS 1.2 or 1.3.',
  },
  {
    front: 'Forward secrecy',
    back: 'Using fresh (ephemeral) keys for each session, so stealing the server’s long-term private key later can’t decrypt previously recorded traffic',
  },
  {
    front: 'Is a JWT’s payload secret?',
    back: 'No. A standard signed JWT is only Base64URL-encoded, so anyone can read it; the signature prevents tampering, not reading. Don’t put secrets in it',
    extra: 'Always verify the signature, expected algorithm, expiry, issuer and audience on the server.',
  },
  // Authentication
  {
    front: 'Multi-factor authentication (MFA)',
    back: 'Requiring factors of at least two different types: something you know (a password), something you have (a phone or security key) and something you are (a fingerprint)',
    extra: 'A password plus a security question is still a single factor type.',
  },
  {
    front: 'Rank these MFA methods from weakest to strongest: SMS codes, authenticator app codes, FIDO2 security keys',
    back: 'SMS (vulnerable to SIM swapping and interception), then authenticator app TOTP codes (still phishable), then FIDO2/WebAuthn security keys or passkeys, which are phishing-resistant',
    extra: 'Push approvals can be abused through MFA fatigue: attackers spam prompts until someone taps Approve.',
  },
  {
    front: 'Passkeys',
    back: 'FIDO2/WebAuthn credentials that replace passwords with a key pair: the private key stays on your device or password manager, the site stores only the public key, and the credential works only on the real site’s domain, so phishing pages can’t use it',
  },
  // OWASP and operations
  {
    front: 'What is the OWASP Top 10, and what is its number one risk?',
    back: 'An awareness list of the most critical web application security risks, published by the OWASP Foundation. Broken access control is ranked first in both the 2021 and 2025 editions',
    extra:
      'Other long-standing categories include injection, cryptographic failures and security misconfiguration. The 2025 edition broadened vulnerable components into software supply chain failures.',
  },
  {
    front: 'Examples of security misconfiguration',
    back: 'Default credentials left in place, verbose error pages with stack traces, publicly readable storage buckets, unnecessary open ports or services, and missing security headers',
  },
  {
    front: 'Network firewall vs web application firewall (WAF)',
    back: 'A network firewall filters traffic by IP address, port and protocol; a WAF inspects HTTP requests at layer 7 to block attacks such as SQL injection and XSS patterns',
  },
  {
    front: 'Vulnerability scan vs penetration test',
    back: 'A vulnerability scan is an automated search for known weaknesses; a penetration test is an authorized, human-led attempt to exploit weaknesses and show their real impact',
  },
  {
    front: 'CVE vs CVSS',
    back: 'A CVE is a unique ID for a publicly disclosed vulnerability, such as CVE-2021-44228 (Log4Shell); CVSS is a 0–10 score of its severity',
    extra: 'Log4Shell scored the maximum 10.0.',
  },
  {
    front: 'The 3-2-1 backup rule',
    back: 'Keep three copies of your data on two different types of storage, with one copy offsite',
    extra: 'Against ransomware, make at least one copy offline or immutable and test restores regularly.',
  },
  {
    front: 'You committed an API key to a Git repository. What now?',
    back: 'Revoke and rotate the key immediately; deleting it in a new commit isn’t enough because it remains in the history and any clones',
    extra:
      'Then check the provider’s logs for misuse. Secret scanning (such as GitHub push protection or gitleaks) helps prevent repeats.',
  },
]

export const CYBER_SECURITY: PublicDeck = {
  slug: 'cyber-security',
  title: 'Cyber security basics: 50 cards on attacks, cryptography and defenses',
  shortTitle: 'Cyber security',
  category: 'devops',
  level: 'beginner',
  icon: 'globe',
  description:
    'Cyber security flashcards: the CIA triad, phishing, XSS, CSRF, SQL injection, MITM, hashing vs encryption, TLS, MFA, least privilege, OWASP and zero trust.',
  intro:
    'Fifty cards on the security fundamentals every developer and IT professional should know: the CIA triad and principles such as least privilege, defense in depth and zero trust; how phishing, XSS, CSRF, SQL injection, SSRF and man-in-the-middle attacks work and how to stop them; hashing, salting, symmetric and asymmetric encryption and how TLS combines them; MFA and passkeys; and the OWASP Top 10. Useful preparation for CompTIA Security+ and security interview questions.',
  faq: [
    {
      q: 'Is this deck enough to pass CompTIA Security+?',
      a: 'No single deck is. It drills core concepts that the exam tests, but Security+ also covers governance, risk management and incident response in more depth, so pair it with a full study guide.',
    },
    {
      q: 'Do I need programming experience?',
      a: 'No. A few cards show short code to illustrate XSS and SQL injection fixes, but the explanations stand on their own.',
    },
    {
      q: 'Which OWASP Top 10 edition does it follow?',
      a: 'The cards stick to categories that appear in both the 2021 and 2025 editions, such as broken access control, injection and security misconfiguration, so they stay accurate either way.',
    },
  ],
  cards: CARDS,
}
