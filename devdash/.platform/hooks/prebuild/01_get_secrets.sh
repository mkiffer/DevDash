#!/bin/bash

# Create .env file for environment variables
ENV_FILE=/var/app/staging/.env

# Retrieve secrets from AWS Parameter Store
echo "Retrieving secrets from AWS Parameter Store..."

# Database URL
DB_URL=$(aws ssm get-parameter --name "/dev-dashboard/DATABASE_URL" --with-decryption --query Parameter.Value --output text)
echo "DATABASE_URL=$DB_URL" >> $ENV_FILE

# Anthropic API Key
ANTHROPIC_KEY=$(aws ssm get-parameter --name "/dev-dashboard/ANTHROPIC_API_KEY" --with-decryption --query Parameter.Value --output text)
echo "ANTHROPIC_API_KEY=$ANTHROPIC_KEY" >> $ENV_FILE

# Stack Exchange API Key
STACKEX_KEY=$(aws ssm get-parameter --name "/dev-dashboard/STACK_EXCHANGE_API_KEY" --with-decryption --query Parameter.Value --output text)
echo "STACK_EXCHANGE_API_KEY=$STACKEX_KEY" >> $ENV_FILE

# Other environment variables
echo "ENVIRONMENT=production" >> $ENV_FILE
echo "DEBUG=false" >> $ENV_FILE

# Make sure Docker can read these environment variables
chmod 644 $ENV_FILE