import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // Models and layers
  {
    front: 'The seven OSI layers, from bottom to top',
    back: '1 Physical, 2 Data link, 3 Network, 4 Transport, 5 Session, 6 Presentation, 7 Application',
    extra: 'Mnemonic: Please Do Not Throw Sausage Pizza Away.',
  },
  {
    front: 'The four layers of the TCP/IP model',
    back: 'Link (network access), Internet, Transport, Application',
    extra: 'OSI layers 5–7 all map to the TCP/IP application layer.',
  },
  {
    front: 'What is the unit of data called at layers 2, 3 and 4?',
    back: 'Frame (data link), packet (network), segment for TCP or datagram for UDP (transport)',
  },
  {
    front: 'At which OSI layers do switches and routers work?',
    back: 'Switches at layer 2, forwarding frames by MAC address; routers at layer 3, forwarding packets by IP address',
    extra: 'Layer 3 switches can also route.',
  },
  {
    front: 'What is a MAC address?',
    back: 'A 48-bit hardware address written as six hex pairs, like `00:1a:2b:3c:4d:5e`; the first 24 bits identify the vendor (OUI)',
  },
  // TCP and UDP
  {
    front: 'TCP vs UDP',
    back: 'TCP is connection-oriented, with reliable, ordered delivery plus flow and congestion control; UDP is connectionless and best-effort, with less overhead',
    extra: 'UDP suits DNS queries, streaming, voice calls and games.',
  },
  { front: 'The TCP three-way handshake', back: 'SYN → SYN-ACK → ACK' },
  {
    front: 'How is a TCP connection closed?',
    back: 'Each side sends a FIN that the other acknowledges (FIN, ACK, FIN, ACK); an RST aborts the connection immediately',
  },
  {
    front: 'Well-known, registered and dynamic port ranges',
    back: '0–1023 well-known, 1024–49151 registered, 49152–65535 dynamic (ephemeral)',
    extra: 'Linux uses 32768–60999 for ephemeral ports by default.',
  },
  // Ports
  { front: 'Port 22', back: 'SSH (also used by SFTP and SCP)' },
  { front: 'Port 53', back: 'DNS: UDP for most queries, TCP for zone transfers and large responses' },
  { front: 'Ports 80 and 443', back: 'HTTP and HTTPS', extra: 'HTTP/3 runs over QUIC on UDP port 443.' },
  { front: 'Ports 67 and 68', back: 'DHCP over UDP: 67 for the server, 68 for the client' },
  { front: 'Ports 20 and 21', back: 'FTP: 21 for control, 20 for data in active mode' },
  {
    front: 'Ports 25, 587 and 465',
    back: 'SMTP: 25 between mail servers, 587 for client submission with STARTTLS, 465 for submission over implicit TLS',
  },
  { front: 'Ports 110, 143, 993 and 995', back: 'POP3 (110), IMAP (143), IMAP over TLS (993), POP3 over TLS (995)' },
  { front: 'Port 123', back: 'NTP (UDP)' },
  { front: 'Ports 161 and 162', back: 'SNMP over UDP: 161 for queries to agents, 162 for traps sent to the manager' },
  { front: 'Port 3389', back: 'RDP (Remote Desktop Protocol)' },
  // IPv4 addressing and subnetting
  {
    front: 'How many bits are in an IPv4 address?',
    back: '32, written as four decimal octets like `192.168.1.10`',
    extra: r`\(2^{32} \approx 4.3\) billion addresses.`,
  },
  {
    front: 'What does `/24` mean in `192.168.1.0/24`?',
    back: 'The first 24 bits are the network prefix: mask `255.255.255.0`, 256 addresses, 254 usable hosts',
  },
  {
    front: r`Usable hosts in a subnet with \(h\) host bits`,
    back: r`\(2^{h} - 2\)`,
    extra: 'The network and broadcast addresses can’t be assigned. A /31 point-to-point link is the exception, with both usable.',
  },
  { front: 'Usable hosts in a /26', back: r`\(2^{32-26} - 2 = 62\)` },
  { front: 'Subnet mask of a /27', back: '`255.255.255.224`: 32 addresses, 30 usable hosts' },
  {
    front: 'Network and broadcast address of `192.168.10.77/26`',
    back: 'Network `192.168.10.64`, broadcast `192.168.10.127`; hosts `.65` to `.126`',
    extra: 'A /26 splits the last octet into blocks of 64: .0, .64, .128, .192.',
  },
  { front: 'The private IPv4 ranges (RFC 1918)', back: '`10.0.0.0/8`, `172.16.0.0/12` and `192.168.0.0/16`' },
  { front: 'What is `127.0.0.0/8`?', back: 'Loopback: traffic never leaves the host. `127.0.0.1` is localhost' },
  {
    front: 'What does an address in `169.254.0.0/16` tell you?',
    back: 'It is link-local (APIPA): the host assigned itself an address, usually because DHCP failed',
  },
  { front: 'Default gateway', back: 'The router a host sends packets to when the destination is outside its own subnet' },
  {
    front: 'NAT vs PAT',
    back: 'NAT rewrites private source addresses to a public one; PAT (NAT overload) also rewrites ports, so many hosts share one public IP',
  },
  {
    front: 'CIDR',
    back: 'Classless Inter-Domain Routing: prefixes of any length (`/22`, `/27`) instead of fixed class A, B and C networks, which also allows route summarization',
  },
  // ARP, DNS, DHCP and ICMP
  {
    front: 'What does ARP do?',
    back: 'Resolves an IPv4 address to a MAC address on the local network, with a broadcast request and a unicast reply',
    extra: 'On Linux, `ip neigh` shows the ARP cache.',
  },
  { front: 'DNS A vs AAAA record', back: 'A maps a name to an IPv4 address; AAAA maps it to an IPv6 address' },
  {
    front: 'DNS CNAME record',
    back: 'An alias that points one name at another, canonical name',
    extra: 'A name with a CNAME can’t have other records, so the bare domain (zone apex) can’t be a CNAME.',
  },
  { front: 'DNS MX record', back: 'The mail servers for a domain, each with a preference number; lower numbers are tried first' },
  {
    front: 'DNS PTR record',
    back: 'Reverse DNS: maps an IP address back to a name, under `in-addr.arpa` for IPv4 or `ip6.arpa` for IPv6',
  },
  {
    front: 'Recursive vs iterative DNS resolution',
    back: 'The client asks a recursive resolver to do the whole lookup; the resolver then queries iteratively: a root server, then the TLD server, then the authoritative server, each referring it onward',
  },
  { front: 'TTL on a DNS record', back: 'How many seconds resolvers may cache the record before asking again' },
  {
    front: 'The four steps of getting a DHCP lease (DORA)',
    back: 'Discover, Offer, Request, Acknowledge',
    extra: 'Discover is a broadcast, because the client has no address yet.',
  },
  {
    front: 'What is ICMP used for?',
    back: 'Network-layer control and error messages: echo request and reply (ping), destination unreachable, time exceeded',
  },
  {
    front: 'How does traceroute work?',
    back: 'It sends packets with TTL 1, 2, 3…; each router that drops one when its TTL runs out replies with ICMP Time Exceeded, revealing the path',
  },
  {
    front: 'VLAN',
    back: 'A logical layer 2 network that splits a switch into separate broadcast domains; trunk links tag frames with an 802.1Q header carrying a 12-bit VLAN ID',
  },
  // IPv6
  { front: 'How many bits are in an IPv6 address?', back: '128, written as eight groups of four hex digits separated by colons' },
  {
    front: 'Shorten `2001:0db8:0000:0000:0000:0000:0000:0001`',
    back: '`2001:db8::1`',
    extra: 'Drop leading zeros in each group, and replace one run of all-zero groups with `::` (only once per address).',
  },
  { front: 'IPv6 loopback address and link-local prefix', back: 'Loopback `::1`; link-local `fe80::/10`' },
  {
    front: 'What replaces ARP in IPv6?',
    back: 'Neighbor Discovery Protocol (NDP), with ICMPv6 Neighbor Solicitation and Neighbor Advertisement messages',
  },
  {
    front: 'SLAAC',
    back: 'Stateless Address Autoconfiguration: a host builds its own address from the /64 prefix in a router advertisement plus an interface ID',
    extra: 'The interface ID is random (privacy addresses) or derived from the MAC address (EUI-64).',
  },
  { front: 'Does IPv6 have broadcast?', back: 'No. It uses multicast instead; `ff02::1` reaches all nodes on the local link' },
  {
    front: 'IPv6 unique local addresses',
    back: '`fc00::/7` (in practice `fd00::/8`), the IPv6 counterpart of private IPv4 ranges',
  },
  {
    front: 'IPv6 global unicast range',
    back: '`2000::/3`',
    extra: '`2001:db8::/32` is reserved for documentation and examples.',
  },
]

export const NETWORKING: PublicDeck = {
  slug: 'networking-essentials',
  title: 'Networking essentials: 50 must-know concepts',
  shortTitle: 'Networking',
  category: 'devops',
  level: 'beginner',
  icon: 'globe',
  description:
    'Computer networking fundamentals: OSI and TCP/IP layers, TCP vs UDP, common port numbers, subnetting and CIDR, DNS, DHCP and ARP, and IPv6 basics.',
  intro:
    'The networking knowledge every developer, sysadmin and IT certification expects: what happens at each layer, which service listens on which port, how to work out a subnet, and how names and addresses get resolved. Subnet math is written out, so you learn the method as well as the answer.',
  faq: [
    {
      q: 'Does this deck help with CompTIA Network+ or CCNA?',
      a: 'It covers fundamentals both exams test, such as the OSI model, ports, subnetting, DNS, DHCP and IPv6 basics. Both go further, so use it alongside a full course.',
    },
    {
      q: 'How do I get faster at subnetting?',
      a: 'Memorize the masks and host counts for /24 to /30 and the block size of each, then practice finding network and broadcast addresses until it is automatic.',
    },
    {
      q: 'Why does a /24 have 254 usable hosts, not 256?',
      a: 'The first address is the network address and the last is the broadcast address, so neither can be assigned to a host.',
    },
  ],
  cards: CARDS,
}
