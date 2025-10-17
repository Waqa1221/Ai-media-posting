import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TwitterPlatform } from '@/lib/social/platforms/twitter';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tweetId = searchParams.get('tweetId');
    const timeframe = searchParams.get('timeframe') || '7d';

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

    const twitter = new TwitterPlatform(
      account.access_token,
      account.refresh_token || ''
    );

    if (tweetId) {
      // Get analytics for specific tweet
      try {
        const analytics = await twitter.getAnalytics(tweetId);
        return NextResponse.json({ analytics });
      } catch (error) {
        console.error('Twitter tweet analytics error:', error);
        return NextResponse.json({ 
          analytics: {
            likes: 0,
            retweets: 0,
            replies: 0,
            quotes: 0,
            bookmarks: 0,
            impressions: 0
          }
        });
      }
    } else {
      // Get general account analytics
      try {
        const profile = await twitter.getProfile();
        
        return NextResponse.json({ 
          profile,
          summary: {
            followers_count: profile.followersCount,
            following_count: profile.followingCount,
            tweet_count: profile.tweetCount,
            verified: profile.verified
          }
        });
      } catch (error) {
        console.error('Twitter profile analytics error:', error);
        return NextResponse.json({ 
          profile: null,
          summary: { 
            followers_count: 0, 
            following_count: 0, 
            tweet_count: 0, 
            verified: false 
          }
        });
      }
    }

  } catch (error) {
    console.error('Twitter analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Twitter analytics' },
      { status: 500 }
    );
  }
}