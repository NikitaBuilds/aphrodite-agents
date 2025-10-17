# Users API Documentation

## Endpoint

`GET /api/users`

## Description

Retrieves a paginated list of users with optional filtering capabilities. Returns user profiles along with their associated social media tokens.

## Query Parameters

### Pagination

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Number of users per page (default: 20, max: 100)

### Filters

- `platform` (string, optional): Filter by social media platform (`tiktok` or `instagram`)
- `has_tiktok_videos` (boolean, optional): Filter users who have TikTok videos (`true`/`false`)
- `has_ai_brand_summary` (boolean, optional): Filter users who have AI brand summary (`true`/`false`)
- `creator_type` (string, optional): Filter by creator type

## Response Format

```typescript
{
  data: UserWithSocialTokens[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPrevPage: boolean
  },
  filters: {
    platform: string | null,
    has_tiktok_videos: boolean | undefined,
    has_ai_brand_summary: boolean | undefined,
    creator_type: string | null
  }
}
```

## Usage Examples

### Basic pagination

```
GET /api/users?page=1&limit=10
```

### Filter by TikTok platform

```
GET /api/users?platform=tiktok&page=1&limit=20
```

### Filter users with TikTok videos

```
GET /api/users?has_tiktok_videos=true&page=1&limit=20
```

### Filter users with AI brand summary

```
GET /api/users?has_ai_brand_summary=true&page=1&limit=20
```

### Filter by creator type

```
GET /api/users?creator_type=influencer&page=1&limit=20
```

### Multiple filters

```
GET /api/users?platform=tiktok&has_tiktok_videos=true&has_ai_brand_summary=true&creator_type=content_creator&page=1&limit=20
```

## Response Example

```json
{
  "data": [
    {
      "id": "uuid-here",
      "ai_brand_summary": "Tech reviewer focused on gadgets...",
      "creator_type": "tech_reviewer",
      "has_tiktok_videos": true,
      "has_instagram_videos": false,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "social_tokens": [
        {
          "id": "token-uuid",
          "platform": "tiktok",
          "platform_display_name": "@techreviewer",
          "platform_avatar_url": "https://...",
          "created_at": "2024-01-15T10:30:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filters": {
    "platform": "tiktok",
    "has_tiktok_videos": true,
    "has_ai_brand_summary": true,
    "creator_type": "tech_reviewer"
  }
}
```

## Error Responses

### 500 Internal Server Error

```json
{
  "error": "Failed to fetch profiles"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## Notes

- The API uses the admin client to bypass RLS (Row Level Security)
- Platform filtering is applied after the main query for better performance
- Maximum limit is capped at 100 users per page
- All timestamps are returned in ISO 8601 format
- Social tokens are included as nested objects in the response
