-- Create useful functions for the social media app

-- Function to get post stats (likes, comments, reposts)
CREATE OR REPLACE FUNCTION get_post_stats(post_uuid UUID)
RETURNS JSON AS $$
DECLARE
  likes_count INTEGER;
  comments_count INTEGER;
  reposts_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO likes_count FROM public.likes WHERE post_id = post_uuid;
  SELECT COUNT(*) INTO comments_count FROM public.comments WHERE post_id = post_uuid;
  SELECT COUNT(*) INTO reposts_count FROM public.posts WHERE repost_of = post_uuid;
  
  RETURN json_build_object(
    'likes', likes_count,
    'comments', comments_count,
    'reposts', reposts_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user stats (followers, following, posts)
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  followers_count INTEGER;
  following_count INTEGER;
  posts_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO followers_count FROM public.follows WHERE following_id = user_uuid;
  SELECT COUNT(*) INTO following_count FROM public.follows WHERE follower_id = user_uuid;
  SELECT COUNT(*) INTO posts_count FROM public.posts WHERE author_id = user_uuid AND repost_of IS NULL;
  
  RETURN json_build_object(
    'followers', followers_count,
    'following', following_count,
    'posts', posts_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is following another user
CREATE OR REPLACE FUNCTION is_following(follower_uuid UUID, following_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.follows 
    WHERE follower_id = follower_uuid AND following_id = following_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  user_uuid UUID,
  notification_type TEXT,
  actor_uuid UUID DEFAULT NULL,
  post_uuid UUID DEFAULT NULL,
  comment_uuid UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, actor_id, post_id, comment_id)
  VALUES (user_uuid, notification_type, actor_uuid, post_uuid, comment_uuid)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
