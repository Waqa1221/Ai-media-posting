# Social Media Integration System

A comprehensive social media integration system built with Next.js, Supabase, and OAuth 2.0. This system provides secure authentication, post management, and analytics for multiple social media platforms.

## Features

### 🔐 OAuth 2.0 Authentication
- Secure OAuth 2.0 flow with PKCE (Proof Key for Code Exchange)
- CSRF protection with state tokens
- Token refresh management
- Multi-platform support

### 📱 Supported Platforms
- Instagram (Facebook Graph API)
- LinkedIn
- Facebook
- TikTok
- YouTube
- Pinterest

### 📝 Post Management
- Create, edit, and delete posts
- Schedule posts for future publishing
- Immediate publishing
- Draft management
- Media upload support
- Hashtag and mention management

### 📊 Analytics & Insights
- Real-time engagement metrics
- Performance tracking
- Analytics synchronization
- Historical data storage

### 🔒 Security Features
- Row Level Security (RLS) policies
- Encrypted token storage
- IP address and user agent tracking
- Rate limiting protection
- Audit logging

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + OAuth 2.0
- **Styling**: Tailwind CSS
- **State Management**: React Hooks

## Database Schema

### Core Tables

1. **social_platforms** - Platform configurations
2. **social_accounts** - User connected accounts
3. **social_posts** - Post management
4. **oauth_states** - OAuth flow security
5. **post_analytics** - Performance metrics

### Key Features
- Automatic timestamp updates
- Comprehensive indexing
- Foreign key constraints
- Custom PostgreSQL functions
- Trigger-based automation

## API Endpoints

### Authentication
- `GET /api/social/oauth/initiate` - Start OAuth flow
- `GET /api/social/oauth/callback` - Handle OAuth callback

### Account Management
- `GET /api/social/accounts` - List connected accounts
- `POST /api/social/accounts` - Connect new account
- `PATCH /api/social/accounts/[id]` - Update account
- `DELETE /api/social/accounts/[id]` - Disconnect account

### Post Management
- `GET /api/social/posts` - List posts
- `POST /api/social/posts` - Create post
- `GET /api/social/posts/[id]` - Get post details
- `PATCH /api/social/posts/[id]` - Update/publish post
- `DELETE /api/social/posts/[id]` - Delete post

### Platform Information
- `GET /api/social/platforms` - List available platforms

## Setup Instructions

### 1. Environment Configuration

Copy `.env.local.example` to `.env.local` and configure:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Social Media API Keys
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
# ... other platform credentials
```

### 2. Database Setup

1. Create a new Supabase project
2. Run the migration script:
   ```sql
   -- Execute the contents of supabase/migrations/create_social_media_system.sql
   ```
3. Update platform credentials in the `social_platforms` table

### 3. Social Media App Setup

#### Instagram (Facebook Graph API)
1. Create a Facebook App at [developers.facebook.com](https://developers.facebook.com)
2. Add Instagram Basic Display product
3. Configure OAuth redirect URI: `https://yourdomain.com/api/social/oauth/callback`
4. Get Client ID and Client Secret

#### LinkedIn
1. Create a LinkedIn App at [developer.linkedin.com](https://developer.linkedin.com)
2. Add required scopes: `r_liteprofile`, `w_member_social`
3. Configure OAuth redirect URI
4. Get Client ID and Client Secret

#### Facebook
1. Use the same Facebook App from Instagram setup
2. Add Facebook Login product
3. Configure permissions: `pages_manage_posts`, `pages_read_engagement`

#### Other Platforms
Follow similar setup processes for TikTok, YouTube, and Pinterest.

### 4. Install Dependencies

```bash
npm install
# or
yarn install
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
```

## Usage Examples

### Connect Social Account

```typescript
import { useSocialAccounts } from '@/lib/hooks/use-social-accounts'

function ConnectAccount() {
  const { connectAccount } = useSocialAccounts()
  
  const handleConnect = async () => {
    await connectAccount('instagram', '/dashboard/social-accounts')
  }
  
  return (
    <button onClick={handleConnect}>
      Connect Instagram
    </button>
  )
}
```

### Create and Publish Post

```typescript
import { useSocialPosts } from '@/lib/hooks/use-social-posts'

function CreatePost() {
  const { createPost } = useSocialPosts()
  
  const handlePublish = async () => {
    await createPost({
      social_account_id: 'account-id',
      platform: 'instagram',
      content: 'Hello, world! 🌍',
      media_urls: ['https://example.com/image.jpg'],
      hashtags: ['hello', 'world'],
      publish_immediately: true
    })
  }
  
  return (
    <button onClick={handlePublish}>
      Publish Post
    </button>
  )
}
```

### Schedule Post

```typescript
const schedulePost = async () => {
  await createPost({
    social_account_id: 'account-id',
    platform: 'linkedin',
    content: 'Scheduled post content',
    scheduled_for: '2024-12-25T10:00:00Z'
  })
}
```

## Security Best Practices

### 1. Token Security
- Tokens should be encrypted at rest in production
- Implement token rotation
- Monitor token expiration

### 2. Rate Limiting
- Implement API rate limiting
- Respect platform rate limits
- Use exponential backoff for retries

### 3. Data Validation
- Validate all input data
- Sanitize content before publishing
- Check platform-specific requirements

### 4. Error Handling
- Implement comprehensive error logging
- Provide user-friendly error messages
- Handle platform API errors gracefully

## Platform-Specific Considerations

### Instagram
- Requires media for all posts
- Maximum 10 media files per post
- Content length limit: 2,200 characters

### LinkedIn
- Supports text-only posts
- Maximum 3,000 characters
- Professional content focus

### Facebook
- Flexible content types
- Large character limit (63,206)
- Page vs. personal account differences

### TikTok
- Video-only platform
- Short content descriptions
- Requires video upload

### YouTube
- Video platform
- Longer descriptions supported
- Requires video upload

### Pinterest
- Image-focused platform
- Pin descriptions
- Board management

## Troubleshooting

### Common Issues

1. **OAuth Callback Errors**
   - Verify redirect URI configuration
   - Check state token validation
   - Ensure HTTPS in production

2. **Token Expiration**
   - Implement automatic token refresh
   - Handle expired token errors
   - Provide re-authentication flow

3. **Platform API Errors**
   - Check API credentials
   - Verify required permissions
   - Review platform-specific requirements

4. **Database Connection Issues**
   - Verify Supabase configuration
   - Check RLS policies
   - Ensure proper user authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

---

Built with ❤️ using Next.js and Supabase# Ai-media-posting
