import axios from 'axios'
import type { PublishResult } from '../types'

export class LinkedInPlatform {
  private accessToken: string
  private personId: string

  constructor(accessToken: string, personId: string) {
    this.accessToken = accessToken
    this.personId = personId
  }

  async publishPost(content: string, mediaUrls?: string[]): Promise<PublishResult> {
    try {
      const postData: any = {
        author: `urn:li:person:${this.personId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: mediaUrls && mediaUrls.length > 0 ? 'IMAGE' : 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      }

      // Add media if provided
      if (mediaUrls && mediaUrls.length > 0) {
        const mediaAssets = []
        for (const mediaUrl of mediaUrls) {
          try {
            // Register upload
            const registerResponse = await axios.post(
              'https://api.linkedin.com/v2/assets?action=registerUpload',
              {
                registerUploadRequest: {
                  recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                  owner: `urn:li:person:${this.personId}`,
                  serviceRelationships: [{
                    relationshipType: 'OWNER',
                    identifier: 'urn:li:userGeneratedContent'
                  }]
                }
              },
              {
                headers: {
                  'Authorization': `Bearer ${this.accessToken}`,
                  'Content-Type': 'application/json'
                }
              }
            )

            const uploadUrl = registerResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl
            const asset = registerResponse.data.value.asset

            // Upload media
            const mediaResponse = await fetch(mediaUrl)
            const mediaBuffer = await mediaResponse.arrayBuffer()

            await axios.put(uploadUrl, mediaBuffer, {
              headers: {
                'Content-Type': 'application/octet-stream'
              }
            })

            mediaAssets.push({
              status: 'READY',
              description: {
                text: 'Image'
              },
              media: asset,
              title: {
                text: 'Post Image'
              }
            })
          } catch (error) {
            console.warn('Failed to upload LinkedIn media:', error)
          }
        }

        if (mediaAssets.length > 0) {
          postData.specificContent['com.linkedin.ugc.ShareContent'].media = mediaAssets
        }
      }

      const response = await axios.post(
        'https://api.linkedin.com/v2/ugcPosts',
        postData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const postId = response.data.id
      return {
        success: true,
        platformPostId: postId,
        url: `https://www.linkedin.com/feed/update/${postId}`
      }
    } catch (error) {
      console.error('LinkedIn publish error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish to LinkedIn'
      }
    }
  }

  async getProfile() {
    try {
      const response = await axios.get(
        'https://api.linkedin.com/v2/people/(id:' + this.personId + ')',
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      )

      return {
        id: this.personId,
        username: response.data.localizedFirstName + ' ' + response.data.localizedLastName,
        displayName: response.data.localizedFirstName + ' ' + response.data.localizedLastName,
        avatarUrl: response.data.profilePicture?.displayImage || null
      }
    } catch (error) {
      console.error('LinkedIn profile error:', error)
      throw error
    }
  }

  async getAnalytics(postId: string) {
    try {
      const response = await axios.get(
        `https://api.linkedin.com/v2/socialActions/${postId}/statistics`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      )

      return {
        likes: response.data.numLikes || 0,
        comments: response.data.numComments || 0,
        shares: response.data.numShares || 0,
        impressions: response.data.numViews || 0
      }
    } catch (error) {
      console.error('LinkedIn analytics error:', error)
      return null
    }
  }
}