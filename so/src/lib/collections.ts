import { Collection, CollectionPrivacy } from '../types';
import { supabase } from './supabase';

export async function createCollection(
  userId: string,
  name: string,
  privacy: CollectionPrivacy,
  allowedUserIds: string[]
): Promise<Collection> {
  const payload: Record<string, unknown> = {
    user_id: userId,
    name,
    privacy,
    allowed_user_ids: privacy === 'limited' ? allowedUserIds : [],
  };
  let { data: created, error: createError } = await supabase
    .from('collections')
    .insert(payload)
    .select()
    .single();

  if (
    createError &&
    createError.message?.toLowerCase().includes('allowed_user_ids') &&
    privacy !== 'limited'
  ) {
    const retry = await supabase
      .from('collections')
      .insert({ user_id: userId, name, privacy })
      .select()
      .single();
    created = retry.data;
    createError = retry.error;
  }

  if (
    createError &&
    createError.message?.toLowerCase().includes('privacy') &&
    privacy === 'public'
  ) {
    const retry = await supabase
      .from('collections')
      .insert({ user_id: userId, name })
      .select()
      .single();
    created = retry.data;
    createError = retry.error;
  }

  if (createError) throw new Error(createError.message);
  if (!created) throw new Error('Collection creation returned no data.');

  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      actor_id: userId,
      action_type: 'collection',
      target_id: created.id,
      description: `Created collection "${name}"`,
      is_public: privacy === 'public',
    });
  } catch {
    // Activity logging is non-fatal.
  }

  return created as Collection;
}
