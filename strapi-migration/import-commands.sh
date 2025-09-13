#!/bin/bash
# Strapi Import Commands
# Make sure to replace YOUR_STRAPI_URL and YOUR_API_TOKEN

STRAPI_URL="http://localhost:1337"
API_TOKEN="your-api-token-here"

# Create Categories
curl -X POST "$STRAPI_URL/api/categories" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data":{"name":"Conversion Optimization","slug":"conversion-optimization","description":"Articles about Conversion Optimization"}}'

curl -X POST "$STRAPI_URL/api/categories" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data":{"name":"Business Strategy","slug":"business-strategy","description":"Articles about Business Strategy"}}'

# Create Tags
curl -X POST "$STRAPI_URL/api/tags" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data":{"name":"CRO","slug":"cro"}}'

curl -X POST "$STRAPI_URL/api/tags" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data":{"name":"Website Optimization","slug":"website-optimization"}}'

curl -X POST "$STRAPI_URL/api/tags" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data":{"name":"Digital Marketing","slug":"digital-marketing"}}'

curl -X POST "$STRAPI_URL/api/tags" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data":{"name":"Website Cost","slug":"website-cost"}}'

curl -X POST "$STRAPI_URL/api/tags" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data":{"name":"Small Business","slug":"small-business"}}'

curl -X POST "$STRAPI_URL/api/tags" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data":{"name":"Web Development","slug":"web-development"}}'

curl -X POST "$STRAPI_URL/api/tags" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data":{"name":"ROI","slug":"roi"}}'
