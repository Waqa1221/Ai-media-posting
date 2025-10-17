import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TwitterPlatform } from '@/lib/social/platforms/twitter';

export async function POST(req: Request) {
  try {
    const {
      content,
      mediaUrls = [],
      isThread = false,
      threadContent = [],
    } = await req.json();

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Twitter account
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'twitter')
      .eq('is_active', true)
      .single();

    if (accountError || !account) {
      return NextResponse.json({
        error: 'No Twitter account connected'
      }, { status: 400 });
    }

    // Validate content
    if (isThread) {
      if (!threadContent || threadContent.length === 0) {
        return NextResponse.json({
          error: 'Thread content is required for thread posts'
        }, { status: 400 });
      }

      for (let i = 0; i < threadContent.length; i++) {
        if (threadContent[i].length > 280) {
          return NextResponse.json({
            error: `Tweet ${i + 1} in thread exceeds 280 character limit`
          }, { status: 400 });
        }
      }
    } else {
      if (content.length > 280) {
        return NextResponse.json({
          error: 'Tweet content exceeds 280 character limit'
        }, { status: 400 });
      }
    }

    if (mediaUrls.length > 4) {
      return NextResponse.json({
        error: 'Twitter supports maximum 4 media files per tweet'
      }, { status: 400 });
    }

    // Create Twitter platform instance
    const twitter = new TwitterPlatform(
      account.access_token,
      account.refresh_token || ''
    );

    // Validate connection before publishing
    const isValid = await twitter.validateConnection();
    if (!isValid) {
      return NextResponse.json({
        error: 'Twitter connection is invalid. Please reconnect your account.'
      }, { status: 401 });
    }

    // Publish content
    let result;
    if (isThread) {
      result = await twitter.publishThread(threadContent, mediaUrls);
    } else {
      result = await twitter.publishPost(content, mediaUrls);
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        platformPostId: result.platformPostId,
        url: result.url,
        message: `${isThread ? 'Thread' : 'Tweet'} published successfully!`,
        metadata: result.metadata || {},
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to publish to Twitter'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Twitter publish API error:', error);
    return NextResponse.json(
      { error: 'Failed to publish to Twitter' },
      { status: 500 }
    );
  }
}