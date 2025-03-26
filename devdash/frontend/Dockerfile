FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose the development server port
EXPOSE 5173

# Start the development server with host set to 0.0.0.0 (accessible from outside the container)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]