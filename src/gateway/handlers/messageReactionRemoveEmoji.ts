import { Gateway, GatewayEventHandler } from '../index.ts'
import { MessageReactionRemoveEmojiPayload } from '../../types/gateway.ts'
import { TextChannel } from '../../structures/textChannel.ts'

export const messageReactionRemoveEmoji: GatewayEventHandler = async (
  gateway: Gateway,
  d: MessageReactionRemoveEmojiPayload
) => {
  let channel = await gateway.client.channels.get<TextChannel>(d.channel_id)
  if (channel === undefined)
    channel = await gateway.client.channels.fetch<TextChannel>(d.channel_id)
  if (channel === undefined) return

  let message = await channel.messages.get(d.message_id)
  if (message === undefined) {
    if (gateway.client.fetchUncachedReactions === true) {
      message = await channel.messages.fetch(d.message_id)
      if (message === undefined) return
    } else return
  }

  const reaction = await message.reactions.get(d.emoji.id)
  if (reaction === undefined) return

  await reaction.users.flush()

  gateway.client.emit('messageReactionRemoveEmoji', message, reaction.emoji)
}
