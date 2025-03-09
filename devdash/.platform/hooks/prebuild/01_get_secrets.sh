#!/bin/bash

# Create .env file for environment variables
ENV_FILE=/var/app/staging/.env

# Retrieve database URL from Parameter Store
DB_URL=$(aws ssm get-parameter --name "/prod/devdash/dbsecret" --with-decryption --query Parameter.Value --output text)
echo "DATABASE_URL=$DB_URL" >> $ENV_FILE

# Retrieve API keys from Secrets Manager
API_KEYS=$(aws secretsmanager get-secret-value --secret-id "/prod/devdash/api-keys" --query SecretString --output text)

# Extract individual keys using jq
ANTHROPIC_KEY=$(echo $API_KEYS | jq -r '.anthropic')
STACKEX_KEY=$(echo $API_KEYS | jq -r '.["stack-exchange"]')

echo "ANTHROPIC_API_KEY=$ANTHROPIC_KEY" >> $ENV_FILE
echo "STACK_EXCHANGE_API_KEY=$STACKEX_KEY" >> $ENV_FILE

# Other environment variables
echo "ENVIRONMENT=production" >> $ENV_FILE
echo "DEBUG=false" >> $ENV_FILE
#test
chmod 644 $ENV_FILE