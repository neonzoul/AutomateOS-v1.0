# Infrastructure

Deployment configurations and local development setup.

## Files

- `docker-compose.dev.yml` - Local development stack (apps + services + engine)
- `docker-compose.prod.yml` - Production stack (for DigitalOcean or VM deploy)
- `k8s/` - Kubernetes manifests (if using K8s)
- `terraform/` - Infrastructure as Code (if using Terraform)

## Local Development

```bash
# Start full stack with Docker
docker compose -f docker-compose.dev.yml up --build

# Start only specific services
docker compose -f docker-compose.dev.yml up api-gateway orchestrator
```

## Production Deployment

### DigitalOcean Droplet
```bash
# Deploy to droplet
docker compose -f docker-compose.prod.yml up -d
```

### Google Cloud Run
```bash
# Deploy via GitHub Actions
# See .github/workflows/deploy-gcp.yml
```

## Environment Variables

- Development: `.env.local` files
- Production: Secret management (GCP Secret Manager / DO env files)
- Never commit secrets to git
