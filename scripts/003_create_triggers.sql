-- Create triggers for automatic notifications and updates

-- Trigger function to create notification on like
CREATE OR REPLACE FUNCTION notify_on_like()
RETURNS TRIGGER AS $$
BEGIN
  -- Don't notify if user likes their own post
  IF NEW.user_id != (SELECT author_id FROM public.posts WHERE id = NEW.post_id) THEN
    PERFORM create_notification(
      (SELECT author_id FROM public.posts WHERE id = NEW.post_id),
      'like',
      NEW.user_id,
      NEW.post_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to create notification on comment
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Don't notify if user comments on their own post
  IF NEW.user_id != (SELECT author_id FROM public.posts WHERE id = NEW.post_id) THEN
    PERFORM create_notification(
      (SELECT author_id FROM public.posts WHERE id = NEW.post_id),
      'comment',
      NEW.user_id,
      NEW.post_id,
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to create notification on follow
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.following_id,
    'follow',
    NEW.follower_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to create notification on repost
CREATE OR REPLACE FUNCTION notify_on_repost()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify on reposts, not regular posts
  IF NEW.repost_of IS NOT NULL THEN
    -- Don't notify if user reposts their own post
    IF NEW.author_id != (SELECT author_id FROM public.posts WHERE id = NEW.repost_of) THEN
      PERFORM create_notification(
        (SELECT author_id FROM public.posts WHERE id = NEW.repost_of),
        'repost',
        NEW.author_id,
        NEW.repost_of
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_like_notification
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION notify_on_like();

CREATE TRIGGER trigger_comment_notification
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION notify_on_comment();

CREATE TRIGGER trigger_follow_notification
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION notify_on_follow();

CREATE TRIGGER trigger_repost_notification
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION notify_on_repost();

-- Update timestamp triggers
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
