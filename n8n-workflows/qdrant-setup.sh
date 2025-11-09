#!/bin/bash

# Hudson Digital Solutions - Qdrant Vector Database Setup
# This script creates collections for semantic search and lead deduplication

set -e  # Exit on error

# Configuration
QDRANT_HOST="${QDRANT_HOST:-http://qdrant-service.ai-stack:6333}"
VECTOR_SIZE=768  # Ollama qwen3-vl-4b embedding size

echo "=========================================="
echo "Hudson Digital Solutions - Qdrant Setup"
echo "=========================================="
echo ""
echo "Qdrant Host: $QDRANT_HOST"
echo "Vector Size: $VECTOR_SIZE"
echo ""

# Check if Qdrant is accessible
echo "Checking Qdrant connection..."
if ! curl -s -f "$QDRANT_HOST/health" > /dev/null; then
  echo "❌ Error: Cannot connect to Qdrant at $QDRANT_HOST"
  echo "   Make sure Qdrant is running and accessible."
  exit 1
fi
echo "✅ Qdrant is accessible"
echo ""

# ============================================
# Collection 1: Leads
# ============================================
echo "Creating 'leads' collection..."

curl -X PUT "$QDRANT_HOST/collections/leads" \
  -H "Content-Type: application/json" \
  -d "{
    \"vectors\": {
      \"size\": $VECTOR_SIZE,
      \"distance\": \"Cosine\"
    },
    \"optimizers_config\": {
      \"default_segment_number\": 2
    },
    \"replication_factor\": 1
  }" > /dev/null 2>&1

# Check if collection was created
if curl -s -f "$QDRANT_HOST/collections/leads" > /dev/null; then
  echo "✅ Collection 'leads' created successfully"
else
  echo "⚠️  Collection 'leads' may already exist or failed to create"
fi

# Create payload indexes for filtering
echo "Creating payload indexes for 'leads' collection..."

curl -X PUT "$QDRANT_HOST/collections/leads/index" \
  -H "Content-Type: application/json" \
  -d '{
    "field_name": "email",
    "field_schema": "keyword"
  }' > /dev/null 2>&1

curl -X PUT "$QDRANT_HOST/collections/leads/index" \
  -H "Content-Type: application/json" \
  -d '{
    "field_name": "intent",
    "field_schema": "keyword"
  }' > /dev/null 2>&1

curl -X PUT "$QDRANT_HOST/collections/leads/index" \
  -H "Content-Type: application/json" \
  -d '{
    "field_name": "qualification_score",
    "field_schema": "integer"
  }' > /dev/null 2>&1

curl -X PUT "$QDRANT_HOST/collections/leads/index" \
  -H "Content-Type: application/json" \
  -d '{
    "field_name": "timestamp",
    "field_schema": "datetime"
  }' > /dev/null 2>&1

echo "✅ Payload indexes created for 'leads' collection"
echo ""

# ============================================
# Collection 2: Completed Projects
# ============================================
echo "Creating 'completed_projects' collection..."

curl -X PUT "$QDRANT_HOST/collections/completed_projects" \
  -H "Content-Type: application/json" \
  -d "{
    \"vectors\": {
      \"size\": $VECTOR_SIZE,
      \"distance\": \"Cosine\"
    },
    \"optimizers_config\": {
      \"default_segment_number\": 2
    },
    \"replication_factor\": 1
  }" > /dev/null 2>&1

# Check if collection was created
if curl -s -f "$QDRANT_HOST/collections/completed_projects" > /dev/null; then
  echo "✅ Collection 'completed_projects' created successfully"
else
  echo "⚠️  Collection 'completed_projects' may already exist or failed to create"
fi

# Create payload indexes for filtering
echo "Creating payload indexes for 'completed_projects' collection..."

curl -X PUT "$QDRANT_HOST/collections/completed_projects/index" \
  -H "Content-Type: application/json" \
  -d '{
    "field_name": "industry",
    "field_schema": "keyword"
  }' > /dev/null 2>&1

curl -X PUT "$QDRANT_HOST/collections/completed_projects/index" \
  -H "Content-Type: application/json" \
  -d '{
    "field_name": "service_type",
    "field_schema": "keyword"
  }' > /dev/null 2>&1

curl -X PUT "$QDRANT_HOST/collections/completed_projects/index" \
  -H "Content-Type: application/json" \
  -d '{
    "field_name": "budget_range",
    "field_schema": "keyword"
  }' > /dev/null 2>&1

echo "✅ Payload indexes created for 'completed_projects' collection"
echo ""

# ============================================
# Verify Collections
# ============================================
echo "Verifying collections..."
echo ""

LEADS_INFO=$(curl -s "$QDRANT_HOST/collections/leads")
PROJECTS_INFO=$(curl -s "$QDRANT_HOST/collections/completed_projects")

echo "Leads Collection:"
echo "$LEADS_INFO" | grep -o '"vectors_count":[0-9]*' || echo "  Vectors: 0"
echo ""

echo "Completed Projects Collection:"
echo "$PROJECTS_INFO" | grep -o '"vectors_count":[0-9]*' || echo "  Vectors: 0"
echo ""

# ============================================
# Insert Sample Data (Optional)
# ============================================
echo "=========================================="
echo "Sample Data Insertion (Optional)"
echo "=========================================="
echo ""

read -p "Do you want to insert sample data for testing? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Generating embeddings and inserting sample data..."
  echo ""

  # Sample Lead 1 (High-value e-commerce project)
  echo "Inserting sample lead 1 (e-commerce)..."

  EMBEDDING_1=$(curl -s -X POST "http://ollama-service.ai-stack:11434/api/embeddings" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "qwen3-vl-4b",
      "prompt": "We need a custom e-commerce platform with advanced inventory management and multi-vendor support. Budget is around $50k."
    }' | grep -o '"embedding":\[[^]]*\]' | sed 's/"embedding"://')

  if [ ! -z "$EMBEDDING_1" ]; then
    curl -s -X PUT "$QDRANT_HOST/collections/leads/points" \
      -H "Content-Type: application/json" \
      -d "{
        \"points\": [
          {
            \"id\": 1,
            \"vector\": $EMBEDDING_1,
            \"payload\": {
              \"email\": \"john@ecommerce-example.com\",
              \"name\": \"John Doe\",
              \"company\": \"E-Commerce Co\",
              \"intent\": \"web_development\",
              \"qualification_score\": 85,
              \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"
            }
          }
        ]
      }" > /dev/null
    echo "✅ Sample lead 1 inserted"
  else
    echo "❌ Failed to generate embedding for sample lead 1"
  fi

  # Sample Lead 2 (Automation project)
  echo "Inserting sample lead 2 (automation)..."

  EMBEDDING_2=$(curl -s -X POST "http://ollama-service.ai-stack:11434/api/embeddings" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "qwen3-vl-4b",
      "prompt": "Looking for business process automation to reduce manual data entry. We spend 20 hours per week on repetitive tasks."
    }' | grep -o '"embedding":\[[^]]*\]' | sed 's/"embedding"://')

  if [ ! -z "$EMBEDDING_2" ]; then
    curl -s -X PUT "$QDRANT_HOST/collections/leads/points" \
      -H "Content-Type: application/json" \
      -d "{
        \"points\": [
          {
            \"id\": 2,
            \"vector\": $EMBEDDING_2,
            \"payload\": {
              \"email\": \"jane@automation-example.com\",
              \"name\": \"Jane Smith\",
              \"company\": \"Automation Co\",
              \"intent\": \"automation\",
              \"qualification_score\": 78,
              \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"
            }
          }
        ]
      }" > /dev/null
    echo "✅ Sample lead 2 inserted"
  else
    echo "❌ Failed to generate embedding for sample lead 2"
  fi

  # Sample Completed Project 1
  echo "Inserting sample completed project 1..."

  EMBEDDING_3=$(curl -s -X POST "http://ollama-service.ai-stack:11434/api/embeddings" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "qwen3-vl-4b",
      "prompt": "E-commerce platform with inventory management, multi-vendor marketplace, payment processing, and real-time analytics."
    }' | grep -o '"embedding":\[[^]]*\]' | sed 's/"embedding"://')

  if [ ! -z "$EMBEDDING_3" ]; then
    curl -s -X PUT "$QDRANT_HOST/collections/completed_projects/points" \
      -H "Content-Type: application/json" \
      -d "{
        \"points\": [
          {
            \"id\": 1,
            \"vector\": $EMBEDDING_3,
            \"payload\": {
              \"project_name\": \"E-Commerce Platform Rebuild\",
              \"client_name\": \"TechRetail Inc\",
              \"industry\": \"retail\",
              \"service_type\": \"web_development\",
              \"budget_range\": \"high_15k_50k\",
              \"duration_weeks\": 12,
              \"results\": \"Increased conversion rate by 34%, reduced page load time by 60%\"
            }
          }
        ]
      }" > /dev/null
    echo "✅ Sample project 1 inserted"
  else
    echo "❌ Failed to generate embedding for sample project 1"
  fi

  echo ""
  echo "✅ Sample data insertion complete"
else
  echo "⏭️  Skipping sample data insertion"
fi

echo ""

# ============================================
# Final Summary
# ============================================
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Collections created:"
echo "  ✅ leads - For lead deduplication and similarity search"
echo "  ✅ completed_projects - For AI proposal generation"
echo ""
echo "Payload indexes created:"
echo "  Leads: email, intent, qualification_score, timestamp"
echo "  Projects: industry, service_type, budget_range"
echo ""
echo "Next steps:"
echo "  1. Run database schema: psql -f database-schema.sql"
echo "  2. Import n8n workflows"
echo "  3. Configure n8n credentials"
echo "  4. Test workflows with sample data"
echo ""
echo "Useful Qdrant commands:"
echo "  - View collection: curl $QDRANT_HOST/collections/leads"
echo "  - Search similar: curl -X POST $QDRANT_HOST/collections/leads/points/search -d '{...}'"
echo "  - Delete collection: curl -X DELETE $QDRANT_HOST/collections/leads"
echo ""
echo "For more information, see: https://qdrant.tech/documentation"
echo "=========================================="
