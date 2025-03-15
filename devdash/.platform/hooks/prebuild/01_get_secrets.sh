#!/bin/bash
set -e

# Hardcode the AWS region
AWS_REGION="ap-southeast-2"

# Create .env file for environment variables
ENV_FILE=/var/app/staging/.env

echo "Starting secret retrieval with region: ${AWS_REGION}"

# Retrieve database credentials from Secrets Manager
DB_SECRET=$(aws secretsmanager get-secret-value --secret-id "prod/devdash/dbsecret" --region "${AWS_REGION}" --query SecretString --output text)

# Parse the DB credentials
DB_USERNAME=$(echo $DB_SECRET | jq -r '.username')
DB_PASSWORD=$(echo $DB_SECRET | jq -r '.password')
DB_ENGINE=$(echo $DB_SECRET | jq -r '.engine')
DB_HOST=$(echo $DB_SECRET | jq -r '.host')
DB_PORT=$(echo $DB_SECRET | jq -r '.port')

# Construct the DATABASE_URL
DATABASE_URL="${DB_ENGINE}://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_USERNAME}"
echo "DATABASE_URL=$DATABASE_URL" >> $ENV_FILE

# Retrieve API keys from Secrets Manager
API_KEYS=$(aws secretsmanager get-secret-value --secret-id "prod/devdash/api-keys" --region "${AWS_REGION}" --query SecretString --output text)

# Extract individual keys using jq
ANTHROPIC_KEY=$(echo $API_KEYS | jq -r '.["anthropic-api-key"]')
STACKEX_KEY=$(echo $API_KEYS | jq -r '.["stack-exchange-api-key"]')

echo "ANTHROPIC_API_KEY=$ANTHROPIC_KEY" >> $ENV_FILE
echo "STACK_EXCHANGE_API_KEY=$STACKEX_KEY" >> $ENV_FILE

# Other environment variables
echo "ENVIRONMENT=production" >> $ENV_FILE
echo "DEBUG=false" >> $ENV_FILE

echo "Secrets retrieved and environment set up successfully" > /var/log/secrets-setup.log
chmod 644 $ENV_FILE