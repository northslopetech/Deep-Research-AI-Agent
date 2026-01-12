#!/bin/bash
#
# Build Docker image for Foundry Compute Module
#
# This script:
# 1. Minifies the OpenAPI spec
# 2. Builds the Docker image with the server.openapi label
#
# Usage:
#   ./scripts/build-docker.sh [image-name] [tag]
#
# Examples:
#   ./scripts/build-docker.sh                          # Uses defaults
#   ./scripts/build-docker.sh deep-research 1.0.0      # Custom name and tag
#   ./scripts/build-docker.sh myregistry.com/deep-research latest
#

set -e

# Configuration
IMAGE_NAME="${1:-deep-research}"
TAG="${2:-latest}"
OPENAPI_FILE="openapi.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Building Deep Research Compute Module ===${NC}"
echo "Image: ${IMAGE_NAME}:${TAG}"

# Check for required files
if [ ! -f "$OPENAPI_FILE" ]; then
    echo -e "${RED}Error: $OPENAPI_FILE not found${NC}"
    echo "Make sure you're running this script from the project root directory"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}Error: Dockerfile not found${NC}"
    exit 1
fi

# Check for FOUNDRY_TOKEN (required for private npm packages)
if [ -z "$FOUNDRY_TOKEN" ]; then
    echo -e "${YELLOW}Warning: FOUNDRY_TOKEN not set. Trying to load from direnv...${NC}"
    if [ -f ".envrc" ] && command -v direnv &> /dev/null; then
        eval "$(direnv export bash 2>/dev/null)"
    fi
fi

if [ -z "$FOUNDRY_TOKEN" ]; then
    echo -e "${RED}Error: FOUNDRY_TOKEN is required for private npm packages${NC}"
    echo "Set FOUNDRY_TOKEN in your environment or .envrc file"
    exit 1
fi

echo -e "${GREEN}✓ FOUNDRY_TOKEN found${NC}"

# Check for jq (required for minifying JSON)
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Warning: jq not found, using fallback minification${NC}"
    # Fallback: simple minification by removing newlines and extra spaces
    OPENAPI_CONTENT=$(cat "$OPENAPI_FILE" | tr -d '\n' | sed 's/  */ /g')
else
    # Minify the OpenAPI spec using jq
    OPENAPI_CONTENT=$(jq -c . "$OPENAPI_FILE")
fi

echo -e "${GREEN}✓ OpenAPI spec loaded (${#OPENAPI_CONTENT} bytes)${NC}"

# Build the Docker image with the OpenAPI label
# Use --no-cache if you need to force a full rebuild
echo -e "${GREEN}Building Docker image...${NC}"
docker build \
    --platform linux/amd64 \
    --build-arg FOUNDRY_TOKEN="$FOUNDRY_TOKEN" \
    --label "server.openapi=${OPENAPI_CONTENT}" \
    -t "${IMAGE_NAME}:${TAG}" \
    .

echo -e "${GREEN}✓ Build complete${NC}"

# Verify the label was added
echo -e "${GREEN}Verifying OpenAPI label...${NC}"
LABEL_CHECK=$(docker inspect --format='{{index .Config.Labels "server.openapi"}}' "${IMAGE_NAME}:${TAG}" 2>/dev/null | head -c 100)
if [ -n "$LABEL_CHECK" ]; then
    echo -e "${GREEN}✓ server.openapi label verified (starts with: ${LABEL_CHECK}...)${NC}"
else
    echo -e "${RED}Warning: server.openapi label not found in image${NC}"
fi

# Print next steps
echo ""
echo -e "${GREEN}=== Build Complete ===${NC}"
echo ""
echo "Next steps:"
echo "  1. Test locally:"
echo "     docker run -p 3000:3000 \\"
echo "       -e FOUNDRY_BASE_URL=https://your-instance.palantirfoundry.com \\"
echo "       -e FOUNDRY_TOKEN=your-token \\"
echo "       ${IMAGE_NAME}:${TAG}"
echo ""
echo "  2. Push to Foundry registry:"
echo "     docker tag ${IMAGE_NAME}:${TAG} your-registry.palantirfoundry.com/${IMAGE_NAME}:${TAG}"
echo "     docker push your-registry.palantirfoundry.com/${IMAGE_NAME}:${TAG}"
echo ""
echo "  3. Configure in Foundry Compute Modules app"
