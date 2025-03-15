#!/bin/bash




# Create .env file for environment variables
ENV_FILE=/var/app/staging/.env

# Set the AWS region explicitly
# Retrieve database credentials from Secrets Manager
AWS_REGION="ap-southeast-2"
DB_SECRET=$(aws secretsmanager get-secret-value --secret-id "prod/devdash/dbsecret" --region $AWS_REGION --query SecretString --output text)

# Parse the DB credentials - the format is different than we initially thought
DB_USERNAME=$(echo $DB_SECRET | jq -r '.username')
DB_PASSWORD=$(echo $DB_SECRET | jq -r '.password')
DB_ENGINE=$(echo $DB_SECRET | jq -r '.engine')
DB_HOST=$(echo $DB_SECRET | jq -r '.host')
DB_PORT=$(echo $DB_SECRET | jq -r '.port')

# Construct the DATABASE_URL
DATABASE_URL="${DB_ENGINE}://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_USERNAME}"
echo "DATABASE_URL=$DATABASE_URL" >> $ENV_FILE

# Retrieve API keys from Secrets Manager
API_KEYS=$(aws secretsmanager get-secret-value --secret-id "prod/devdash/api-keys" --region $AWS_REGION --query SecretString --output text)

# Extract individual keys using jq - note the different key names
ANTHROPIC_KEY=$(echo $API_KEYS | jq -r '.["anthropic-api-key"]')
STACKEX_KEY=$(echo $API_KEYS | jq -r '.["stack-exchange-api-key"]')

echo "ANTHROPIC_API_KEY=$ANTHROPIC_KEY" >> $ENV_FILE
echo "STACK_EXCHANGE_API_KEY=$STACKEX_KEY" >> $ENV_FILE

# Other environment variables
echo "ENVIRONMENT=production" >> $ENV_FILE
echo "DEBUG=false" >> $ENV_FILE

# Add debug output (only to a secure log, not the .env file)
echo "Script executed at $(date)" > /var/log/secrets-debug.log
echo "Database URL format created (credentials redacted): ${DB_ENGINE}://${DB_USERNAME}:****@${DB_HOST}:${DB_PORT}/${DB_USERNAME}" >> /var/log/secrets-debug.log
echo "API keys retrieved successfully: $([ -n "$ANTHROPIC_KEY" ] && [ -n "$STACKEX_KEY" ] && echo "Yes" || echo "No")" >> /var/log/secrets-debug.log

chmod 644 $ENV_FILE
chmod 600 /var/log/secrets-debug.log