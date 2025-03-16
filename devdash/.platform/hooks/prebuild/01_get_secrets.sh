#!/bin/bash
export AWS_REGION="ap-southeast-2"
ENV_FILE=/var/app/staging/.env

# Get database credentials
DB_SECRET=$(aws secretsmanager get-secret-value --secret-id "prod/devdash/dbsecret" --region ${AWS_REGION} --query SecretString --output text)

# Parse DB credentials with proper error handling
if [ -n "$DB_SECRET" ]; then
  DB_USERNAME=$(echo $DB_SECRET | jq -r '.username // "default_user"')
  DB_PASSWORD=$(echo $DB_SECRET | jq -r '.password // "default_password"')
  DB_ENGINE=$(echo $DB_SECRET | jq -r '.engine // "postgresql"')
  DB_HOST=$(echo $DB_SECRET | jq -r '.host // "localhost"')
  DB_PORT=$(echo $DB_SECRET | jq -r '.port // "5432"')
  
  echo "DATABASE_URL=${DB_ENGINE}://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_USERNAME}" >> $ENV_FILE
else
  echo "ERROR: Could not retrieve database secrets" >> /var/log/secrets-error.log
fi

# Get API keys
API_KEYS=$(aws secretsmanager get-secret-value --secret-id "prod/devdash/api-keys" --region ${AWS_REGION} --query SecretString --output text)

if [ -n "$API_KEYS" ]; then
  ANTHROPIC_KEY=$(echo $API_KEYS | jq -r '.["anthropic-api-key"] // ""')
  STACKEX_KEY=$(echo $API_KEYS | jq -r '.["stack-exchange-api-key"] // ""')
  
  echo "ANTHROPIC_API_KEY=$ANTHROPIC_KEY" >> $ENV_FILE
  echo "STACK_EXCHANGE_API_KEY=$STACKEX_KEY" >> $ENV_FILE
else
  echo "ERROR: Could not retrieve API keys" >> /var/log/secrets-error.log
fi

echo "ENVIRONMENT=production" >> $ENV_FILE
echo "DEBUG=false" >> $ENV_FILE

chmod 644 $ENV_FILE