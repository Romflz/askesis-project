import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const hcl = (...lines: string[]) => code('hcl', ...lines)
const sh = (...lines: string[]) => code('bash', ...lines)

const CARDS: CardContent[] = [
  // Basics and workflow
  {
    front: 'What is Terraform?',
    back: 'An infrastructure-as-code tool: you declare the desired infrastructure in configuration files, and Terraform works out and makes the API calls needed to reach that state',
    extra: 'It is declarative: you describe the end result, not the steps to get there.',
  },
  {
    front: 'HCL block syntax',
    back: hcl('<BLOCK TYPE> "<LABEL>" "<LABEL>" {', '  <ARGUMENT> = <EXPRESSION>', '}'),
    extra: 'HCL is the HashiCorp Configuration Language. Terraform loads every `.tf` file in a directory as one configuration.',
  },
  {
    front: 'The core Terraform workflow',
    back: sh(
      'terraform init     # download providers and modules, set up the backend',
      'terraform plan     # preview the changes',
      'terraform apply    # make the changes',
    ),
    extra: '`terraform destroy` removes everything the configuration manages.',
  },
  {
    front: 'When do you need to run `terraform init`?',
    back: 'In a new or freshly cloned directory, and again after adding or changing providers, modules or the backend configuration. It is safe to run repeatedly',
  },
  {
    front: 'What is `.terraform.lock.hcl` for?',
    back: 'It records the exact provider versions and checksums chosen by `terraform init`, so everyone gets the same providers. Commit it to version control',
    extra: 'Run `terraform init -upgrade` to move to newer versions allowed by your constraints. Module versions are not locked.',
  },
  // Providers and resources
  {
    front: 'Declare and configure the AWS provider',
    back: hcl(
      'terraform {',
      '  required_providers {',
      '    aws = {',
      '      source  = "hashicorp/aws"',
      '      version = "~> 6.0"',
      '    }',
      '  }',
      '}',
      '',
      'provider "aws" {',
      '  region = "eu-central-1"',
      '}',
    ),
    extra:
      'A provider is a plugin that talks to one API (AWS, Azure, Google Cloud, Kubernetes, GitHub…) and supplies its resource types.',
  },
  {
    front: 'What does the version constraint `~> 6.0` allow?',
    back: 'Any version from 6.0 up to, but not including, 7.0: only the rightmost given component may increase',
    extra: '`~> 6.0.1` allows 6.0.1 up to, but not including, 6.1.0.',
  },
  {
    front: 'Use a second provider configuration for another region',
    back: hcl(
      'provider "aws" {',
      '  alias  = "us_east_1"',
      '  region = "us-east-1"',
      '}',
      '',
      'resource "aws_acm_certificate" "cdn" {',
      '  provider          = aws.us_east_1',
      '  domain_name       = "example.com"',
      '  validation_method = "DNS"',
      '}',
    ),
    extra: 'A real use: certificates for CloudFront must be created in `us-east-1`.',
  },
  {
    front: 'Resource block',
    back: hcl('resource "aws_s3_bucket" "logs" {', '  bucket = "acme-app-logs"', '}'),
    extra: 'The first label is the resource type, the second a local name; together they form the address `aws_s3_bucket.logs`.',
  },
  {
    front: 'Reference another resource’s attribute',
    back: 'Use `<TYPE>.<NAME>.<ATTRIBUTE>`, such as `aws_instance.web.public_ip`. The reference also tells Terraform to create the referenced resource first',
  },
  {
    front: 'When do you need `depends_on`?',
    back: 'Only for hidden dependencies that Terraform can’t infer from references, such as an app that needs an IAM policy to exist before it starts',
    extra: 'Prefer real references where possible; `depends_on` makes plans more conservative.',
  },
  // Variables, outputs and expressions
  {
    front: 'Declare an input variable with a default',
    back: hcl(
      'variable "instance_type" {',
      '  type        = string',
      '  default     = "t3.micro"',
      '  description = "EC2 instance size"',
      '}',
    ),
    extra: 'Use it as `var.instance_type`. A variable without a default must be given a value.',
  },
  {
    front: 'Variable value sources, from lowest to highest precedence',
    back: 'Default value, then `TF_VAR_name` environment variables, `terraform.tfvars`, `terraform.tfvars.json`, `*.auto.tfvars` files (in alphabetical order), and finally `-var` and `-var-file` on the command line',
  },
  {
    front: 'Restrict a variable to dev, staging or prod',
    back: hcl(
      'variable "env" {',
      '  type = string',
      '',
      '  validation {',
      '    condition     = contains(["dev", "staging", "prod"], var.env)',
      '    error_message = "env must be dev, staging or prod."',
      '  }',
      '}',
    ),
  },
  {
    front: 'Does `sensitive = true` keep a secret out of the state file?',
    back: 'No. It only hides the value in plan and apply output; the value is still stored in plain text in state and saved plan files',
    extra:
      'Protect state with an encrypted backend and tight access. Recent versions add ephemeral values and write-only arguments that are never stored.',
  },
  {
    front: 'Output value',
    back: hcl('output "web_ip" {', '  value = aws_instance.web.public_ip', '}'),
    extra:
      'Outputs are printed after `apply`, shown by `terraform output` and exposed to a parent module as `module.<NAME>.web_ip`.',
  },
  {
    front: 'Local values',
    back: hcl(
      'locals {',
      '  common_tags = {',
      '    team    = "platform"',
      '    project = var.project',
      '  }',
      '}',
      '',
      '# referenced as local.common_tags',
    ),
    extra: 'The block is `locals` (plural), but references use `local.` (singular).',
  },
  {
    front: 'String interpolation and conditional expressions',
    back: hcl(
      'bucket        = "${var.project}-${var.env}-assets"',
      'instance_type = var.env == "prod" ? "m7i.large" : "t3.micro"',
    ),
  },
  {
    front: 'Terraform’s type constraints',
    back: 'Primitive: `string`, `number`, `bool`. Collections: `list(...)`, `set(...)`, `map(...)`. Structural: `object({...})` and `tuple([...])`. `any` accepts anything',
  },
  {
    front: 'What does `cidrsubnet("10.0.0.0/16", 8, 1)` return?',
    back: '`"10.0.1.0/24"`: it adds 8 bits to the prefix (/16 becomes /24) and picks subnet number 1',
    extra: 'Try expressions like this interactively in `terraform console`.',
  },
  // State and backends
  {
    front: 'What is Terraform state?',
    back: 'A JSON file (`terraform.tfstate`) that maps each resource in your configuration to the real object it manages, with its ID and attributes; Terraform compares it with the config and reality to plan changes',
  },
  {
    front: 'Why shouldn’t state live in Git or on a laptop?',
    back: 'It can contain secrets in plain text, and local files can’t be locked or shared safely, so concurrent runs or stale copies corrupt it. Use a remote backend',
    extra: 'A typical `.gitignore` covers `.terraform/`, `*.tfstate` and `*.tfstate.*`, but not `.terraform.lock.hcl`.',
  },
  {
    front: 'Remote backend',
    back: 'Where Terraform stores state outside your machine, such as S3, Azure Blob Storage, Google Cloud Storage or HCP Terraform, giving shared access, locking, encryption and versioning',
  },
  {
    front: 'Store state in S3 with locking',
    back: hcl(
      'terraform {',
      '  backend "s3" {',
      '    bucket       = "acme-tf-state"',
      '    key          = "prod/network.tfstate"',
      '    region       = "eu-central-1"',
      '    encrypt      = true',
      '    use_lockfile = true',
      '  }',
      '}',
    ),
    extra:
      '`use_lockfile` uses S3’s own locking (Terraform 1.11+). Older setups used a DynamoDB table, which is now deprecated. Enable versioning on the bucket.',
  },
  {
    front: 'What is state locking for?',
    back: 'It stops two runs from writing the same state at once. If a crashed run leaves a stale lock, release it with `terraform force-unlock <LOCK_ID>`',
    extra: 'Only force-unlock when you are sure no other run is in progress.',
  },
  {
    front: 'Can a backend block use variables?',
    back: 'No. Backend settings can’t reference variables, locals or data sources; pass environment-specific values at init time with partial configuration',
    extra: sh('terraform init -backend-config=prod.s3.tfbackend'),
  },
  // Plan and apply
  {
    front: 'Plan symbols `+`, `-`, `~` and `-/+`',
    back: '`+` create, `-` destroy, `~` update in place, `-/+` destroy and then create a replacement',
    extra: '`+/-` means create the replacement first, then destroy the old one (`create_before_destroy`).',
  },
  {
    front: 'Apply exactly the plan that was reviewed',
    back: sh('terraform plan -out=tfplan', 'terraform apply tfplan'),
    extra: 'Applying a saved plan skips the approval prompt. The plan file can contain secrets, so treat it like state.',
  },
  {
    front: 'What does “forces replacement” mean in a plan?',
    back: 'You changed an argument the provider can’t update in place, such as an instance’s AMI, so Terraform will destroy the resource and create a new one',
  },
  {
    front: 'Protect a database from being destroyed',
    back: hcl('resource "aws_db_instance" "main" {', '  # ...', '  lifecycle {', '    prevent_destroy = true', '  }', '}'),
    extra: 'Other `lifecycle` options: `create_before_destroy`, `ignore_changes` and `replace_triggered_by`.',
  },
  // Modules and data sources
  {
    front: 'Call a module',
    back: hcl('module "web" {', '  source        = "./modules/web-server"', '  instance_type = "t3.small"', '}'),
    extra: 'A module is a directory of `.tf` files with its own variables and outputs. Run `terraform init` after adding one.',
  },
  {
    front: 'Where can a module’s `source` point?',
    back: 'A local path (`./modules/vpc`), the Terraform Registry (`<NAMESPACE>/<NAME>/<PROVIDER>` plus a `version`), a Git repository (`git::https://…?ref=v1.2.0`), or an HTTP or S3 URL',
    extra: 'The `version` argument only works for registry modules; pin Git sources with `ref`.',
  },
  {
    front: 'Read a value from a child module',
    back: 'Use `module.<NAME>.<OUTPUT>`, such as `module.vpc.private_subnet_ids`; only values the module declares as outputs are visible',
  },
  {
    front: 'Look up the latest Ubuntu 24.04 AMI with a data source',
    back: hcl(
      'data "aws_ami" "ubuntu" {',
      '  most_recent = true',
      '  owners      = ["099720109477"] # Canonical',
      '',
      '  filter {',
      '    name   = "name"',
      '    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]',
      '  }',
      '}',
    ),
    extra: 'Data sources read existing information without managing it. Use the result as `data.aws_ami.ubuntu.id`.',
  },
  // count, for_each and expressions
  {
    front: 'Create three similar instances with `count`',
    back: hcl(
      'resource "aws_instance" "web" {',
      '  count         = 3',
      '  ami           = data.aws_ami.ubuntu.id',
      '  instance_type = "t3.micro"',
      '  tags = { Name = "web-${count.index}" }',
      '}',
    ),
    extra: 'Refer to one as `aws_instance.web[0]`. `count = var.enabled ? 1 : 0` makes a resource optional.',
  },
  {
    front: 'Create one IAM user per name with `for_each`',
    back: hcl('resource "aws_iam_user" "team" {', '  for_each = toset(["alice", "bob"])', '  name     = each.key', '}'),
    extra: 'Instances are addressed by key, such as `aws_iam_user.team["alice"]`. With a map, `each.value` holds the value.',
  },
  {
    front: 'Why prefer `for_each` over `count` for a list of distinct things?',
    back: 'With `count`, removing an item from the middle shifts every later index, so Terraform replaces those resources; `for_each` addresses instances by stable keys',
  },
  {
    front: 'Why does `for_each = var.names` fail when `names` is a list?',
    back: '`for_each` accepts only a map or a set of strings. Convert the list with `toset(var.names)`',
    extra: 'A block can’t use `count` and `for_each` together, and their values must be known at plan time.',
  },
  {
    front: '`for` expressions',
    back: hcl('upper_names = [for n in var.names : upper(n)]', 'roles       = { for u in var.users : u.name => u.role }'),
  },
  {
    front: 'Generate repeated nested blocks from a list',
    back: hcl(
      'dynamic "ingress" {',
      '  for_each = var.ports',
      '  content {',
      '    from_port   = ingress.value',
      '    to_port     = ingress.value',
      '    protocol    = "tcp"',
      '    cidr_blocks = ["10.0.0.0/16"]',
      '  }',
      '}',
    ),
    extra: 'Current AWS provider guidance prefers separate `aws_vpc_security_group_ingress_rule` resources over inline rules.',
  },
  // Workspaces, drift and refactoring
  {
    front: 'Terraform CLI workspaces',
    back: 'Separate state files for the same configuration and backend, managed with `terraform workspace new`, `select` and `list`; the current name is available as `terraform.workspace`',
    extra:
      'Fine for similar, short-lived copies. For environments that need different credentials or access controls, such as prod, HashiCorp recommends separate configurations or backends.',
  },
  {
    front: 'Drift',
    back: 'Real infrastructure has changed outside Terraform, for example in the console, so it no longer matches the configuration and state. `terraform plan` shows it as changes to undo',
  },
  {
    front: 'Accept out-of-band changes into state without changing infrastructure',
    back: sh('terraform plan -refresh-only    # review the drift', 'terraform apply -refresh-only   # write it to state'),
    extra:
      'This replaces the deprecated `terraform refresh`. Update the configuration too, or the next plan will try to revert the change.',
  },
  {
    front: 'Bring an existing resource under Terraform management',
    back: hcl('import {', '  to = aws_s3_bucket.logs', '  id = "acme-app-logs"', '}'),
    extra:
      'Then run `terraform plan -generate-config-out=generated.tf` to draft the matching resource block. The older CLI form is `terraform import aws_s3_bucket.logs acme-app-logs`.',
  },
  {
    front: 'Rename a resource without destroying it',
    back: hcl('moved {', '  from = aws_instance.web', '  to   = aws_instance.app', '}'),
    extra:
      'Without a `moved` block, Terraform sees one resource deleted and another created. `terraform state mv` does the same imperatively.',
  },
  {
    front: 'Stop managing a resource but keep it running',
    back: hcl('removed {', '  from = aws_instance.legacy', '', '  lifecycle {', '    destroy = false', '  }', '}'),
    extra: 'The older imperative equivalent is `terraform state rm aws_instance.legacy`.',
  },
  { front: 'List and inspect resources in state', back: sh('terraform state list', 'terraform state show aws_instance.web') },
  {
    front: 'Force Terraform to recreate one resource',
    back: sh('terraform apply -replace="aws_instance.web"'),
    extra: 'This replaces the deprecated `terraform taint`.',
  },
  {
    front: '`terraform fmt` vs `terraform validate`',
    back: '`fmt` rewrites files in the canonical style (`fmt -check` fails CI on unformatted code); `validate` checks syntax, types and references without contacting any remote APIs',
  },
  {
    front: 'OpenTofu',
    back: 'An open-source fork of Terraform under the MPL 2.0 license, created after HashiCorp moved Terraform to the Business Source License in 2023; it is run by the Linux Foundation and uses the `tofu` command',
    extra: 'Its HCL and workflow are largely compatible with Terraform.',
  },
]

export const TERRAFORM_ESSENTIALS: PublicDeck = {
  slug: 'terraform-essentials',
  title: 'Terraform essentials: 50 cards on HCL, state, modules and workflows',
  shortTitle: 'Terraform',
  category: 'devops',
  level: 'beginner',
  icon: 'code',
  description:
    'Terraform flashcards: HCL, providers, resources, variables and outputs, state and remote backends, plan and apply, modules, count, for_each, drift and import.',
  intro:
    'Fifty cards on the Terraform you use every day: HCL blocks and expressions, providers and version constraints, variables, outputs and locals, how state and remote backends with locking work, how to read a plan, modules and data sources, count, for_each and dynamic blocks, workspaces, and how to handle drift, imports and refactoring without destroying anything. Examples use the AWS provider, and nearly everything also applies to OpenTofu.',
  faq: [
    {
      q: 'Which Terraform version does the deck assume?',
      a: 'A recent 1.x release (1.11 or newer), which has import, moved and removed blocks and native S3 state locking. Older versions differ mainly in those areas.',
    },
    {
      q: 'Does it apply to OpenTofu?',
      a: 'Almost entirely. OpenTofu is a fork of Terraform with the same HCL language and workflow; you run tofu instead of terraform.',
    },
    {
      q: 'Do I need to know AWS?',
      a: 'It helps but isn’t required. Examples use AWS resources because they are the most common, but the concepts apply to every provider. The AWS essentials deck covers the services themselves.',
    },
  ],
  cards: CARDS,
}
