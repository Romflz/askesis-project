import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // Foundations
  {
    front: 'Kerckhoffs’s principle',
    back: 'A cryptosystem should stay secure even if everything about it except the key is public',
    extra:
      'Security has to come from the secrecy of the key, not of the algorithm. Shannon put it as “the enemy knows the system”.',
  },
  {
    front: 'Symmetric vs asymmetric encryption',
    back: 'Symmetric encryption uses one shared secret key to encrypt and decrypt; asymmetric encryption uses a key pair, a public key to encrypt and a private key to decrypt',
    extra:
      'Symmetric ciphers are far faster, so real systems use public-key cryptography only to agree on a symmetric key, then encrypt the data with it (hybrid encryption).',
  },
  {
    front: 'One-time pad',
    back: 'XOR the message with a truly random key as long as the message, used only once; done right, it is unbreakable even in principle (perfect secrecy)',
    extra: 'Reusing the pad breaks it: XORing two ciphertexts cancels the key and leaves the XOR of the two plaintexts.',
  },
  // Symmetric ciphers and modes
  {
    front: 'Block cipher vs stream cipher',
    back: 'A block cipher encrypts fixed-size blocks and needs a mode of operation for longer messages; a stream cipher XORs the message with a keystream generated from a key and a nonce',
    extra: 'AES is a block cipher; ChaCha20 is a stream cipher.',
  },
  {
    front: 'AES block size and key sizes',
    back: '128-bit blocks; 128-, 192- or 256-bit keys',
    extra: 'It runs 10, 12 or 14 rounds depending on the key size. NIST standardized AES (the Rijndael cipher) in 2001.',
  },
  {
    front: 'Why is ECB mode insecure?',
    back: 'It encrypts each block independently, so identical plaintext blocks give identical ciphertext blocks and patterns in the data show through',
    extra: 'The classic demonstration is an image encrypted in ECB mode whose outline is still clearly visible.',
  },
  {
    front: 'CBC mode',
    back: 'Each plaintext block is XORed with the previous ciphertext block before encryption; the first block uses a random, unpredictable IV',
    extra: 'CBC provides confidentiality only. Without a MAC it is open to padding oracle attacks.',
  },
  {
    front: 'Padding oracle attack',
    back: 'If a system reveals whether the padding of decrypted CBC ciphertext is valid, through an error message or timing, an attacker can decrypt data byte by byte without the key',
    extra: 'Prevent it by verifying a MAC before decrypting, or by using an AEAD mode.',
  },
  {
    front: 'CTR mode',
    back: 'Encrypts successive counter blocks (a nonce plus a block number) to make a keystream, then XORs it with the plaintext',
    extra: 'It needs no padding and runs in parallel, but a nonce must never repeat under the same key.',
  },
  {
    front: 'Does encryption alone stop tampering?',
    back: 'No. Without authentication, ciphertext is malleable: flipping a bit of CTR or stream-cipher ciphertext flips the same bit of the plaintext',
    extra: 'That is why modern designs use authenticated encryption.',
  },
  {
    front: 'Authenticated encryption with associated data (AEAD)',
    back: 'Encryption that guarantees both confidentiality and integrity, and can also authenticate unencrypted associated data such as headers',
    extra: 'Decryption fails if the ciphertext, tag or associated data were changed. TLS 1.3 allows only AEAD ciphers.',
  },
  {
    front: 'AES-GCM',
    back: 'AES in counter mode plus a GHASH authentication tag: the most widely used AEAD mode',
    extra: 'Its standard nonce is 96 bits, and its tag is usually 128 bits.',
  },
  {
    front: 'What happens if an AES-GCM nonce repeats under the same key?',
    back: 'The keystream repeats, revealing the XOR of the two plaintexts, and an attacker can recover the authentication key and forge messages',
    extra: r`With random 96-bit nonces, NIST limits one key to \(2^{32}\) messages.`,
  },
  {
    front: 'ChaCha20-Poly1305',
    back: 'An AEAD that pairs the ChaCha20 stream cipher with the Poly1305 authenticator; fast and constant-time in software, even without AES hardware',
    extra: 'Used in TLS 1.3, SSH and WireGuard, and specified in RFC 8439.',
  },
  {
    front: 'Encrypt-then-MAC',
    back: 'Encrypt first, then compute a MAC over the ciphertext and IV; the receiver checks the MAC before decrypting anything',
    extra: 'Of the ways to combine a cipher with a MAC, it is the one that is secure in general. AEAD modes handle this for you.',
  },
  // Public-key cryptography
  {
    front: 'What hard problem is RSA based on?',
    back: r`Factoring: recovering the primes \(p\) and \(q\) from their product \(n = pq\)`,
    extra: 'Use keys of at least 2048 bits; 3072 bits gives about 128-bit security.',
  },
  {
    front: 'Textbook RSA encryption and decryption',
    back: r`\(c = m^e \bmod n\) and \(m = c^d \bmod n\), where \(ed \equiv 1 \pmod{\varphi(n)}\)`,
    extra: 'Raw RSA is deterministic and malleable, so real systems always add padding. The public exponent e is usually 65537.',
  },
  {
    front: 'RSA padding for encryption and for signatures',
    back: 'OAEP for encryption, PSS for signatures',
    extra: 'The older PKCS #1 v1.5 encryption padding is open to Bleichenbacher’s padding oracle attack.',
  },
  {
    front: 'Elliptic-curve cryptography (ECC)',
    back: r`Public-key cryptography based on the elliptic-curve discrete logarithm problem: given points \(P\) and \(kP\), finding \(k\) is infeasible`,
    extra:
      'Keys are much smaller than RSA keys of the same strength: a 256-bit curve such as P-256 gives about 128-bit security, like 3072-bit RSA.',
  },
  {
    front: 'X25519 and Ed25519',
    back: 'X25519 is Diffie–Hellman key agreement on Curve25519; Ed25519 is a signature scheme on an equivalent form of the same curve',
    extra:
      'Both were designed to be fast and hard to implement wrongly. Ed25519 signatures are deterministic, so they need no random nonce.',
  },
  {
    front: 'Diffie–Hellman key exchange',
    back: r`Each side picks a secret exponent and sends \(g^a \bmod p\) or \(g^b \bmod p\); both then compute \(g^{ab} \bmod p\), which an eavesdropper can’t`,
    extra: 'Its security rests on the discrete logarithm problem. ECDH is the same idea on an elliptic curve.',
  },
  {
    front: 'Why must a Diffie–Hellman exchange be authenticated?',
    back: 'Otherwise a man-in-the-middle can run a separate exchange with each side and read everything; signatures and certificates prove who sent each public value',
  },
  {
    front: 'Why would a large quantum computer break RSA and elliptic curves?',
    back: 'Shor’s algorithm factors integers and solves discrete logarithms efficiently',
    extra:
      'NIST published post-quantum standards in 2024: ML-KEM for key exchange and ML-DSA for signatures. Symmetric ciphers are far less affected; AES-256 stays secure.',
  },
  // Hashes and MACs
  {
    front: 'Cryptographic hash function',
    back: 'Maps input of any length to a fixed-length digest; it is deterministic and fast, but infeasible to invert or to find two inputs with the same output',
    extra: 'SHA-256 produces a 256-bit (32-byte) digest.',
  },
  {
    front: 'Preimage, second-preimage and collision resistance',
    back: 'Preimage: given a digest, you can’t find an input for it. Second preimage: given an input, you can’t find another with the same digest. Collision: you can’t find any two inputs with the same digest',
  },
  {
    front: 'Birthday bound for hash collisions',
    back: r`Collisions in an \(n\)-bit hash turn up after about \(2^{n/2}\) tries, so SHA-256 offers about 128-bit collision resistance`,
  },
  {
    front: 'SHA-2 family',
    back: 'SHA-224, SHA-256, SHA-384 and SHA-512, plus the truncated SHA-512/224 and SHA-512/256, built on the Merkle–Damgård construction',
    extra: 'SHA-256 remains a sound default; no practical attacks on the full SHA-2 functions are known.',
  },
  {
    front: 'SHA-3',
    back: 'The hash standard based on Keccak, published in 2015 (FIPS 202); it uses a sponge construction and was chosen as an alternative to SHA-2, not because SHA-2 was broken',
    extra: 'It resists length-extension attacks, and its SHAKE128 and SHAKE256 variants produce output of any length.',
  },
  {
    front: 'Length-extension attack',
    back: r`With SHA-256 or SHA-512, anyone who knows \(H(\text{secret} \parallel m)\) can compute \(H(\text{secret} \parallel m \parallel \text{pad} \parallel x)\) for any \(x\) without knowing the secret`,
    extra: 'They only need the secret’s length, which is easy to guess. Use HMAC instead of hashing a secret prefix.',
  },
  {
    front: 'Status of MD5 and SHA-1',
    back: 'Broken: practical collisions exist for both, so never use them for signatures, certificates or anything that needs collision resistance',
    extra: 'The first public SHA-1 collision (SHAttered) was announced in 2017; MD5 collisions take seconds on a laptop.',
  },
  {
    front: 'Message authentication code (MAC)',
    back: 'A tag computed from a message and a shared secret key; it proves the message came from a key holder and wasn’t altered',
    extra: 'Unlike a signature, it can’t prove to a third party who made it: anyone who can verify a MAC can also create one.',
  },
  {
    front: 'HMAC',
    back: r`\(\mathrm{HMAC}(K, m) = H\big((K' \oplus \text{opad}) \parallel H((K' \oplus \text{ipad}) \parallel m)\big)\)`,
    extra:
      'The nested hashing makes it immune to length extension. Compare tags in constant time: an early-exit comparison leaks through timing how many bytes matched.',
  },
  // Signatures
  {
    front: 'Digital signature',
    back: 'Made with a private key and checked with the matching public key; it proves who signed and that the data hasn’t changed, and the signer can’t later deny it',
    extra: 'Common schemes: RSA-PSS, ECDSA and Ed25519.',
  },
  {
    front: 'What happens if an ECDSA nonce is reused or predictable?',
    back: 'Anyone with the signatures can compute the private key',
    extra:
      'This is how the PlayStation 3 signing key was recovered in 2010. Deterministic nonces (RFC 6979) or Ed25519 avoid the problem.',
  },
  // Passwords and randomness
  {
    front: 'Why not store passwords as SHA-256 hashes?',
    back: 'General-purpose hashes are built to be fast, so attackers with GPUs can test billions of guesses per second; passwords need a slow, salted password-hashing function',
  },
  {
    front: 'Which password-hashing algorithm should you choose?',
    back: 'Argon2id; scrypt if Argon2id is unavailable; bcrypt for legacy systems; PBKDF2 when FIPS-140 compliance is required',
    extra: 'This is the order OWASP recommends.',
  },
  {
    front: 'Argon2',
    back: 'The winner of the 2015 Password Hashing Competition: a memory-hard function whose cost is tuned by memory, iterations and parallelism',
    extra: 'Use the Argon2id variant. OWASP’s minimum is 19 MiB of memory, 2 iterations and a parallelism of 1.',
  },
  {
    front: 'bcrypt',
    back: 'A password hash based on the Blowfish cipher, with a cost factor that doubles the work for each increment',
    extra: 'It only uses the first 72 bytes of a password. OWASP recommends a cost of at least 10.',
  },
  {
    front: 'scrypt',
    back: 'A memory-hard key derivation function by Colin Percival (2009), tuned by N (CPU and memory cost), r (block size) and p (parallelism)',
    extra: r`Needing lots of memory makes GPU and ASIC cracking expensive. OWASP’s minimum is \(N = 2^{17}\), \(r = 8\), \(p = 1\).`,
  },
  {
    front: 'Salt',
    back: 'A unique random value stored with each password hash, so identical passwords hash differently and precomputed tables such as rainbow tables are useless',
    extra: 'Salts aren’t secret. A pepper is an extra secret kept outside the database, for example in a key vault.',
  },
  {
    front: 'Nonce',
    back: 'A “number used once”: a value that must never repeat under the same key, though it usually needn’t be secret',
    extra: 'Some schemes need more: a CBC IV must also be unpredictable.',
  },
  {
    front: 'Where should keys and other secret random values come from?',
    back: 'The operating system’s cryptographically secure random number generator, never a general-purpose generator such as `Math.random()` or the Mersenne Twister',
    extra: 'For example `getrandom()` on Linux, `crypto.getRandomValues()` in browsers and the `secrets` module in Python.',
  },
  {
    front: 'HKDF',
    back: 'An HMAC-based key derivation function: it extracts a uniform key from input key material such as a Diffie–Hellman output, then expands it into as many keys as needed',
    extra: 'TLS 1.3 derives all its keys with HKDF (RFC 5869).',
  },
  // TLS and certificates
  {
    front: 'TLS 1.3 full handshake, in outline',
    back: 'The client sends ClientHello with its key shares; the server replies with ServerHello and its key share, then, already encrypted, its certificate, a CertificateVerify signature and Finished; the client answers with Finished. One round trip in all',
    extra: 'Both sides derive the session keys from an ephemeral (EC)DHE exchange.',
  },
  {
    front: 'TLS 1.3 0-RTT data',
    back: 'When resuming a session, a client can send application data in its first message, but an attacker can replay it, so it should only carry requests that are safe to repeat',
  },
  {
    front: 'What did TLS 1.3 remove?',
    back: 'Static RSA and static Diffie–Hellman key exchange, all non-AEAD ciphers (such as CBC modes and RC4), compression and renegotiation',
    extra: 'With static RSA gone, every full handshake uses ephemeral key exchange and so has forward secrecy.',
  },
  {
    front: 'Forward secrecy',
    back: 'Stealing a server’s long-term private key later doesn’t expose past sessions, because each session key came from an ephemeral key exchange and was then discarded',
  },
  {
    front: 'X.509 certificate',
    back: 'A signed document that binds a public key to an identity such as a domain name, issued by a certificate authority, with a validity period and extensions',
    extra: 'Browsers check the hostname against the Subject Alternative Name extension, not the Common Name.',
  },
  {
    front: 'Chain of trust',
    back: 'The server sends its certificate and any intermediates; the client checks each signature up to a root CA certificate already in its trust store',
    extra: 'Root keys are kept offline; intermediate CAs do the day-to-day signing.',
  },
  // Pitfalls
  {
    front: '“Don’t roll your own crypto”: what to do instead',
    back: 'Use well-reviewed libraries and high-level APIs, such as libsodium or your platform’s crypto library, with standard algorithms and protocols',
    extra:
      'Most real-world breaks come from misuse, such as repeated nonces, missing authentication or unchecked certificates, rather than from broken algorithms.',
  },
]

export const CRYPTOGRAPHY: PublicDeck = {
  slug: 'cryptography',
  title: 'Cryptography fundamentals: 50 cards on ciphers, hashes and TLS',
  shortTitle: 'Cryptography',
  category: 'cs',
  level: 'intermediate',
  icon: 'brain',
  description:
    'Cryptography flashcards: AES modes, RSA, elliptic curves, Diffie–Hellman, hashing, HMAC, signatures, password hashing, TLS 1.3 and common pitfalls.',
  intro:
    'Most security failures come from using sound cryptography the wrong way. This deck covers symmetric ciphers and their modes, RSA, elliptic curves and Diffie–Hellman, hashes, MACs and signatures, password hashing, and how TLS 1.3 and certificates tie it all together, along with the mistakes that break real systems.',
  faq: [
    {
      q: 'Do I need advanced math for this deck?',
      a: 'No. RSA and Diffie–Hellman appear as short formulas, but the cards focus on what each tool does and when to use it.',
    },
    {
      q: 'Is the advice up to date?',
      a: 'Yes: AEAD ciphers such as AES-GCM, Argon2id for passwords, TLS 1.3 and the 2024 post-quantum standards. Outdated choices like ECB, MD5 and SHA-1 appear only as things to avoid.',
    },
    {
      q: 'Who is this deck for?',
      a: 'Developers and security engineers who need to choose and use cryptography correctly, and students preparing for security courses, certifications or interviews.',
    },
  ],
  cards: CARDS,
}
