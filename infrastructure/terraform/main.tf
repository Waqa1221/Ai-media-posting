terraform {
  required_version = ">= 1.0"
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.15"
    }
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }
}

# Variables
variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "supabase_access_token" {
  description = "Supabase access token"
  type        = string
  sensitive   = true
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "ai-social-saas"
}

variable "github_repo" {
  description = "GitHub repository URL"
  type        = string
}

variable "stripe_publishable_key" {
  description = "Stripe publishable key"
  type        = string
}

variable "stripe_secret_key" {
  description = "Stripe secret key"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth client ID"
  type        = string
}

variable "google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  sensitive   = true
}

# Configure providers
provider "vercel" {
  api_token = var.vercel_api_token
}

provider "supabase" {
  access_token = var.supabase_access_token
}

# Supabase project
resource "supabase_project" "main" {
  organization_id = data.supabase_organizations.main.organizations[0].id
  name           = var.project_name
  database_password = random_password.db_password.result
  region         = "us-east-1"
  
  lifecycle {
    ignore_changes = [database_password]
  }
}

# Random password for database
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Data source for Supabase organizations
data "supabase_organizations" "main" {}

# Vercel project
resource "vercel_project" "main" {
  name      = var.project_name
  framework = "nextjs"
  
  git_repository = {
    type = "github"
    repo = var.github_repo
  }

  environment = [
    {
      key    = "NEXT_PUBLIC_SUPABASE_URL"
      value  = supabase_project.main.api_url
      target = ["production", "preview", "development"]
    },
    {
      key    = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
      value  = supabase_project.main.anon_key
      target = ["production", "preview", "development"]
    },
    {
      key    = "SUPABASE_SERVICE_ROLE_KEY"
      value  = supabase_project.main.service_role_key
      target = ["production", "preview", "development"]
    },
    {
      key    = "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
      value  = var.stripe_publishable_key
      target = ["production", "preview", "development"]
    },
    {
      key    = "STRIPE_SECRET_KEY"
      value  = var.stripe_secret_key
      target = ["production", "preview", "development"]
    },
    {
      key    = "GOOGLE_CLIENT_ID"
      value  = var.google_client_id
      target = ["production", "preview", "development"]
    },
    {
      key    = "GOOGLE_CLIENT_SECRET"
      value  = var.google_client_secret
      target = ["production", "preview", "development"]
    },
    {
      key    = "NEXTAUTH_URL"
      value  = "https://${vercel_project.main.name}.vercel.app"
      target = ["production"]
    },
    {
      key    = "NEXTAUTH_SECRET"
      value  = random_password.nextauth_secret.result
      target = ["production", "preview", "development"]
    }
  ]
}

# Random secret for NextAuth
resource "random_password" "nextauth_secret" {
  length = 32
}

# Vercel domain
resource "vercel_project_domain" "main" {
  project_id = vercel_project.main.id
  domain     = "${var.project_name}.vercel.app"
}

# Redis Cloud setup (requires Redis Cloud provider - not included in this example)
# You would need to set up Redis Cloud separately or use a different Redis provider

# Outputs
output "vercel_project_url" {
  description = "The URL of the Vercel project"
  value       = "https://${vercel_project.main.name}.vercel.app"
}

output "supabase_project_url" {
  description = "The URL of the Supabase project"
  value       = supabase_project.main.api_url
}

output "supabase_project_id" {
  description = "The ID of the Supabase project"
  value       = supabase_project.main.id
}

output "database_password" {
  description = "The database password"
  value       = random_password.db_password.result
  sensitive   = true
}