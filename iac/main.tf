variable "vercel_api_token" {
  description = "API Token for Vercel"
  type        = string
  sensitive   = true
}

variable "contract_address" {
  description = "Address of the deployed smart contract"
  type        = string
}

variable "vercel_team_id" {
  description = "Vercel Team/Org ID"
  type        = string
}

terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.11.0"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
  team_id   = var.vercel_team_id # This ensures it goes to your team account
}

resource "vercel_project" "nft_marketplace" {
  name      = "my-nft-marketplace"
  framework = "nextjs"
  
  git_repository = {
    type = "github"
    repo = "adilkhan-m20/NFT-MarketPlace"
  }

  environment = [
    {
      key   = "NEXT_PUBLIC_CONTRACT_ADDRESS"
      value = var.contract_address
      target = ["production", "preview"]
    },
    {
      key   = "NEXT_PUBLIC_CHAIN_ID"
      value = "11155111" 
      target = ["production"]
    }
  ]
}