import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const sh = (...lines: string[]) => code('bash', ...lines)
const json = (...lines: string[]) => code('json', ...lines)
const py = (...lines: string[]) => code('python', ...lines)

const CARDS: CardContent[] = [
  // Global infrastructure and responsibility
  {
    front: 'Region vs Availability Zone (AZ)',
    back: 'A Region is a separate geographic area, such as `eu-central-1` (Frankfurt), containing several AZs (usually three or more); an AZ is one or more data centers with independent power and networking, linked to the others by low-latency connections',
    extra: 'Spreading resources across AZs lets an application survive the loss of a whole data center.',
  },
  {
    front: 'The shared responsibility model',
    back: 'AWS is responsible for security of the cloud (facilities, hardware, network, virtualization); you are responsible for security in the cloud (your data, IAM, OS patches on EC2, security group rules, encryption settings)',
  },
  {
    front: 'Who patches the operating system: EC2 vs RDS?',
    back: 'On EC2 you patch the guest OS yourself; on RDS, AWS patches the OS and database engine in your maintenance window, while you manage users, network access and settings',
    extra: 'The more managed the service, the more of the stack AWS takes on.',
  },
  // EC2
  {
    front: 'Amazon EC2',
    back: 'Elastic Compute Cloud: virtual servers (instances) you launch from an image, pick a size for and pay for while they run',
  },
  {
    front: 'AMI',
    back: 'Amazon Machine Image: the template for launching an instance, with the OS, configuration and software',
    extra: 'AMIs are regional; copy one to use it in another Region.',
  },
  {
    front: 'What does the instance type `m7g.large` mean?',
    back: 'Family `m` (general purpose), generation 7, attribute `g` (AWS Graviton, Arm-based), size `large`',
    extra:
      'Other families: `t` burstable, `c` compute optimized, `r` memory optimized. Attribute letters include `i` (Intel), `a` (AMD) and `d` (local NVMe storage).',
  },
  {
    front: 'EC2 pricing: On-Demand vs Savings Plans vs Spot',
    back: 'On-Demand: pay by the second or hour, no commitment. Savings Plans (or Reserved Instances): commit for 1 or 3 years for up to 72% off. Spot: spare capacity at up to 90% off, but AWS can reclaim it with a two-minute warning',
    extra: 'Spot suits fault-tolerant work such as batch jobs, CI runners and stateless workers, not a single database server.',
  },
  {
    front: 'EBS vs instance store',
    back: 'EBS is network-attached block storage that persists independently of the instance and supports snapshots; instance store is a disk physically attached to the host, and its data is lost when the instance stops or terminates',
    extra: 'An EBS volume lives in one AZ. To move it, snapshot it and create a new volume from the snapshot elsewhere.',
  },
  {
    front: 'EC2 user data',
    back: 'A script passed at launch that runs as root on the instance’s first boot, typically to install and configure software',
    extra: sh('#!/bin/bash', 'dnf install -y nginx', 'systemctl enable --now nginx'),
  },
  {
    front: 'Stopping vs terminating an EC2 instance',
    back: 'Stop: the instance shuts down, its EBS volumes are kept and you stop paying for compute. Terminate: the instance is deleted, along with its root EBS volume by default',
    extra: 'After a stop and start, the instance usually gets a new public IPv4 address unless it uses an Elastic IP.',
  },
  {
    front: 'Auto Scaling group',
    back: 'Keeps a desired number of EC2 instances running across AZs, replaces unhealthy ones and scales between a minimum and maximum based on policies such as target CPU utilization',
  },
  // S3
  {
    front: 'Amazon S3',
    back: 'Simple Storage Service: object storage where each object (data plus metadata) is stored in a bucket under a key, with practically unlimited capacity',
    extra: 'S3 is designed for 99.999999999% (11 nines) durability. General purpose bucket names must be globally unique.',
  },
  {
    front: 'S3 Standard vs S3 Standard-IA',
    back: 'Standard is for frequently accessed data; Standard-IA (Infrequent Access) has cheaper storage but charges per GB retrieved, with a 30-day minimum storage duration and a 128 KB minimum billable object size',
    extra: 'S3 One Zone-IA is cheaper still, but keeps data in a single AZ, so use it only for data you can recreate.',
  },
  {
    front: 'The three S3 Glacier storage classes',
    back: 'Glacier Instant Retrieval: millisecond access for data read about once a quarter. Glacier Flexible Retrieval: minutes to hours. Glacier Deep Archive: the cheapest, with retrieval within 12 hours (48 for bulk)',
    extra: 'Minimum storage durations: 90 days for Instant and Flexible Retrieval, 180 days for Deep Archive.',
  },
  {
    front: 'When should you use S3 Intelligent-Tiering?',
    back: 'When access patterns are unknown or change: it moves objects between access tiers automatically based on use, with no retrieval fees but a small monthly monitoring fee per object',
  },
  {
    front: 'S3 lifecycle rules',
    back: 'Rules that automatically transition objects to cheaper storage classes or delete them after a number of days',
    extra: 'Example: move logs to Glacier Flexible Retrieval after 90 days and delete them after 365.',
  },
  {
    front: 'What does S3 versioning protect against?',
    back: 'Accidental overwrites and deletes: every write keeps the previous version, and a delete only adds a delete marker that you can remove',
    extra: 'Once enabled, versioning can be suspended but never fully turned off.',
  },
  {
    front: 'S3 Block Public Access',
    back: 'Bucket- and account-level settings that override any policy or ACL that would make data public; they are on by default for new buckets',
    extra: 'New objects are also encrypted at rest by default (SSE-S3).',
  },
  {
    front: 'Give someone temporary access to a private S3 object',
    back: sh('aws s3 presign s3://my-bucket/report.pdf --expires-in 3600'),
    extra: 'A presigned URL carries your credentials’ permissions for a limited time (the CLI default is one hour).',
  },
  // IAM
  {
    front: 'AWS IAM',
    back: 'Identity and Access Management: controls who can authenticate and what actions they may perform on which resources. It is global and free',
  },
  {
    front: 'Best practices for the root user',
    back: 'Enable MFA, create no access keys, and don’t use it for daily work; sign in as root only for the few tasks that require it, such as changing account settings or closing the account',
  },
  {
    front: 'IAM user vs IAM role',
    back: 'A user is an identity with long-term credentials (a password or access keys); a role has permissions but no long-term credentials and is assumed by trusted users, services or accounts, which receive temporary credentials from STS',
    extra: 'A role’s trust policy says who may assume it.',
  },
  {
    front: 'How should an application on EC2 get AWS credentials?',
    back: 'Attach an IAM role to the instance (via an instance profile); the SDKs fetch temporary, automatically rotated credentials from the instance metadata service',
    extra: 'Never put access keys in code, AMIs or config files.',
  },
  {
    front: 'Policy that allows reading objects from one bucket',
    back: json(
      '{',
      '  "Version": "2012-10-17",',
      '  "Statement": [',
      '    {',
      '      "Effect": "Allow",',
      '      "Action": "s3:GetObject",',
      '      "Resource": "arn:aws:s3:::my-bucket/*"',
      '    }',
      '  ]',
      '}',
    ),
    extra:
      'Statements combine `Effect`, `Action` and `Resource`, plus optional `Condition`. `s3:ListBucket` applies to the bucket ARN itself, without `/*`.',
  },
  {
    front: 'How does IAM decide whether a request is allowed?',
    back: 'Everything is denied by default; an explicit Allow grants access, and an explicit Deny in any applicable policy always overrides any Allow',
  },
  {
    front: 'Identity-based vs resource-based policies',
    back: 'Identity-based policies attach to users, groups and roles; resource-based policies attach to a resource such as an S3 bucket or SQS queue and name the allowed `Principal`, which can be another account',
  },
  {
    front: 'Least privilege in IAM, in practice',
    back: 'Grant only the actions and resources a job needs: start narrow (or from a managed policy), then tighten using IAM Access Analyzer and last-accessed data',
  },
  {
    front: 'How should people sign in to AWS accounts?',
    back: 'Through IAM Identity Center (formerly AWS SSO), which gives them temporary credentials across accounts, rather than through long-lived IAM users',
    extra: 'The CLI supports it with `aws configure sso` and `aws sso login`.',
  },
  {
    front: 'Check which identity your AWS CLI is using',
    back: sh('aws sts get-caller-identity'),
    extra: 'It prints the account ID and the ARN of the user or assumed role.',
  },
  // VPC
  {
    front: 'Amazon VPC',
    back: 'Virtual Private Cloud: your logically isolated network in a Region, with an IP range (CIDR block) you choose; it spans all of the Region’s AZs',
  },
  {
    front: 'Subnet',
    back: 'A range of IP addresses within a VPC that lives in exactly one AZ',
    extra: 'AWS reserves five addresses in every subnet: the first four and the last.',
  },
  {
    front: 'What makes a subnet public?',
    back: 'Its route table sends internet traffic (`0.0.0.0/0`) to an internet gateway. A private subnet has no such route',
    extra: 'Instances in a public subnet also need a public IP address to be reachable.',
  },
  {
    front: 'NAT gateway',
    back: 'Lets instances in private subnets make outbound connections to the internet, for updates or external APIs, while blocking connections initiated from outside',
    extra: 'It sits in a public subnet and is billed per hour and per GB processed.',
  },
  {
    front: 'Security group vs network ACL',
    back: 'A security group attaches to instances (network interfaces), is stateful and has allow rules only. A network ACL applies to a whole subnet, is stateless (return traffic needs its own rule) and has numbered allow and deny rules',
    extra: 'A new security group allows no inbound traffic and all outbound traffic.',
  },
  {
    front: 'Allow only the app servers to reach the database on port 5432',
    back: 'In the database’s security group, add an inbound rule for TCP 5432 whose source is the app servers’ security group, not an IP range',
    extra: 'Instances that join the app security group later are allowed automatically.',
  },
  // RDS
  {
    front: 'Amazon RDS',
    back: 'Managed relational databases (PostgreSQL, MySQL, MariaDB, Oracle, SQL Server, Db2 and Aurora): AWS handles provisioning, patching, backups and failover',
  },
  {
    front: 'RDS Multi-AZ vs read replicas',
    back: 'Multi-AZ keeps a synchronous standby in another AZ for automatic failover (high availability); read replicas are asynchronous copies that scale read traffic and can be in other Regions',
    extra:
      'In a classic Multi-AZ instance deployment the standby serves no traffic. A read replica can be promoted to a standalone database.',
  },
  {
    front: 'RDS automated backups',
    back: 'Daily snapshots plus transaction logs, kept for 1 to 35 days, which allow a point-in-time restore to any second in that window',
    extra: 'A restore always creates a new DB instance.',
  },
  {
    front: 'Amazon Aurora',
    back: 'AWS’s MySQL- and PostgreSQL-compatible database, whose storage keeps six copies of your data across three AZs and grows automatically',
    extra: 'It supports up to 15 low-latency read replicas, and Aurora Serverless v2 scales capacity automatically.',
  },
  // Lambda
  {
    front: 'AWS Lambda',
    back: 'Serverless functions: you upload code that runs in response to events, without managing servers, and pay per request and per GB-second of run time',
    extra: 'Common triggers: API Gateway or function URLs, S3 events, SQS queues, EventBridge schedules and DynamoDB Streams.',
  },
  {
    front: 'Lambda’s maximum timeout and memory',
    back: '15 minutes (900 seconds) and 10,240 MB of memory; CPU power scales with the memory you configure',
    extra: 'For longer jobs, use Step Functions, ECS or AWS Batch.',
  },
  {
    front: 'Lambda cold start',
    back: 'The extra latency when Lambda must create a new execution environment: download the code, start the runtime and run your initialization code',
    extra: 'Reduce it with smaller packages, provisioned concurrency or SnapStart (Java, Python and .NET).',
  },
  {
    front: 'A minimal Python Lambda handler',
    back: py(
      'def lambda_handler(event, context):',
      '    name = event.get("name", "world")',
      '    return {"statusCode": 200, "body": f"Hello, {name}"}',
    ),
    extra: 'Create SDK clients and connections outside the handler so warm invocations reuse them.',
  },
  // CloudWatch
  {
    front: 'Amazon CloudWatch',
    back: 'AWS’s monitoring service: metrics, logs (CloudWatch Logs), alarms and dashboards for your resources and applications',
  },
  {
    front: 'CloudWatch alarm',
    back: 'Watches a metric against a threshold over a number of periods and moves between OK, ALARM and INSUFFICIENT_DATA, triggering actions such as an SNS notification or an Auto Scaling policy',
  },
  {
    front: 'Does EC2 send memory and disk-space usage to CloudWatch by default?',
    back: 'No. Default metrics include CPU, network and disk I/O; memory and disk-space usage need the CloudWatch agent on the instance',
    extra: 'Basic monitoring sends metrics every 5 minutes; detailed monitoring every minute.',
  },
  {
    front: 'CloudWatch vs CloudTrail',
    back: 'CloudWatch monitors performance and operations (metrics, logs, alarms); CloudTrail records API calls for auditing: who did what, when and from where',
  },
  // Route 53
  {
    front: 'Amazon Route 53',
    back: 'AWS’s DNS service: domain registration, public and private hosted zones, health checks and routing policies',
    extra: 'The name refers to port 53, the port DNS uses.',
  },
  {
    front: 'Route 53 alias record vs CNAME',
    back: 'An alias record points a name to an AWS resource such as a load balancer or CloudFront distribution and, unlike a CNAME, works at the zone apex (`example.com`)',
    extra: 'Alias queries to AWS resources are free.',
  },
  {
    front: 'Which Route 53 routing policy: canary 10% of traffic, nearest Region, standby site?',
    back: 'Weighted for sending 10% to a new version, latency-based for the lowest-latency Region, failover (with health checks) for an active-passive standby',
    extra: 'Others: simple, geolocation, geoproximity, multivalue answer and IP-based.',
  },
]

export const AWS_ESSENTIALS: PublicDeck = {
  slug: 'aws-essentials',
  title: 'AWS essentials: 50 cards on EC2, S3, IAM, VPC, RDS and Lambda',
  shortTitle: 'AWS',
  category: 'devops',
  level: 'beginner',
  icon: 'globe',
  description:
    'AWS flashcards: regions and AZs, EC2, S3 storage classes, IAM users, roles and policies, VPC networking, RDS, Lambda, CloudWatch and Route 53.',
  intro:
    'Fifty cards on the AWS services almost every project touches: Regions, Availability Zones and the shared responsibility model; EC2 instance types, pricing and storage; S3 storage classes, lifecycle rules and access controls; IAM users, roles and policy evaluation; VPC subnets, NAT and security groups; RDS and Aurora; Lambda; CloudWatch; and Route 53. A solid warm-up for the AWS Certified Cloud Practitioner and Solutions Architect Associate exams.',
  faq: [
    {
      q: 'Will this deck prepare me for an AWS certification?',
      a: 'It covers the core services tested in Cloud Practitioner and the foundations of Solutions Architect Associate, but it is not a complete exam guide. Pair it with the official exam guide and hands-on practice.',
    },
    {
      q: 'Do I need an AWS account to use it?',
      a: 'No. The cards stand on their own, though trying the services in a sandbox account with a budget alert helps them stick.',
    },
    {
      q: 'How is this different from the Terraform deck?',
      a: 'This deck covers the AWS services themselves. The Terraform essentials deck covers managing infrastructure as code, using AWS resources in its examples.',
    },
  ],
  cards: CARDS,
}
