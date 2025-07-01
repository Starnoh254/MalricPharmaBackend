# 🏥 Health Check Endpoint Documentation

## Overview

The health check endpoint provides a way to verify that the API is running and responding correctly. This is essential for:

- **Production monitoring** - automated health checks
- **Load balancers** - determining if the instance is healthy
- **Deployment verification** - confirming successful deployments
- **DevOps monitoring** - integration with monitoring tools

## Endpoint Details

### GET `/api/v1/health`

**Purpose**: Returns the current health status of the API

**Authentication**: None required (public endpoint)

**Response Format**:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "uptime": 86400.5,
  "environment": "production",
  "version": "1.0.0"
}
```

**Response Fields**:

- `status`: Always "healthy" if the API is responding
- `timestamp`: Current server time in ISO format
- `uptime`: Server uptime in seconds
- `environment`: Current NODE_ENV (production/development)
- `version`: Application version from package.json

**HTTP Status Codes**:

- `200 OK`: API is healthy and responding
- `500 Internal Server Error`: API has internal issues
- No response: API is down or unreachable

## Usage Examples

### cURL

```bash
curl https://api.malricpharma.co.ke/api/v1/health
```

### JavaScript/Fetch

```javascript
const checkHealth = async () => {
  try {
    const response = await fetch(
      "https://api.malricpharma.co.ke/api/v1/health"
    );
    const health = await response.json();
    console.log("API Status:", health.status);
    return health;
  } catch (error) {
    console.error("API is down:", error);
    return null;
  }
};
```

### Monitoring Script

```bash
#!/bin/bash
# Health check script for cron job
HEALTH_URL="https://api.malricpharma.co.ke/api/v1/health"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $STATUS -eq 200 ]; then
    echo "$(date): API is healthy"
else
    echo "$(date): API is down (HTTP $STATUS)" | mail -s "API Alert" admin@malricpharma.co.ke
fi
```

## Integration with GitHub Actions

The health endpoint is automatically tested during deployment:

```yaml
- name: Health Check
  run: |
    if curl -f -s https://api.malricpharma.co.ke/api/v1/health > /dev/null; then
        echo "✅ API endpoint is responding!"
    else
        echo "❌ API endpoint test failed"
        exit 1
    fi
```

## Nginx Configuration

Add this to your nginx config for direct health checks:

```nginx
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}

# API health check (proxy to Node.js)
location /api/v1/health {
    proxy_pass http://localhost:3000/api/v1/health;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Load Balancer Configuration

For AWS Application Load Balancer:

- **Health Check Path**: `/api/v1/health`
- **Healthy Threshold**: 2
- **Unhealthy Threshold**: 3
- **Timeout**: 5 seconds
- **Interval**: 30 seconds
- **Success Codes**: 200

## Monitoring Integration

### Uptime Robot

- **Monitor Type**: HTTP(s)
- **URL**: `https://api.malricpharma.co.ke/api/v1/health`
- **Keyword**: `healthy`
- **Monitoring Interval**: 5 minutes

### Pingdom

- **Check Type**: HTTP Custom
- **URL**: `https://api.malricpharma.co.ke/api/v1/health`
- **Expected Response**: `200 OK`
- **Response Contains**: `"status":"healthy"`

## Security Notes

1. **No sensitive data** - The health endpoint doesn't expose sensitive information
2. **Rate limiting exempt** - Usually excluded from rate limiting
3. **Public access** - No authentication required for monitoring tools
4. **Minimal logging** - Often excluded from access logs to reduce noise

## Troubleshooting

### Common Issues

1. **404 Not Found**

   - Check if routes are properly registered
   - Verify nginx proxy configuration

2. **500 Internal Server Error**

   - Check application logs: `pm2 logs malricpharma-backend`
   - Verify database connectivity

3. **Timeout/No Response**
   - Check if application is running: `pm2 status`
   - Verify firewall rules and port access
   - Check nginx status: `sudo systemctl status nginx`

### Testing Commands

```bash
# Test from server
curl localhost:3000/api/v1/health

# Test through nginx
curl localhost/api/v1/health

# Test public endpoint
curl https://api.malricpharma.co.ke/api/v1/health

# Test with verbose output
curl -v https://api.malricpharma.co.ke/api/v1/health
```

---

## 🚀 Next Steps

1. **Deploy** this change to production
2. **Test** the endpoint works correctly
3. **Configure** monitoring tools to use this endpoint
4. **Update** load balancer health check settings
5. **Set up** automated alerts based on health status

The health endpoint is now ready and will make your deployment monitoring much more reliable! 🎯
