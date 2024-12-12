import { z } from 'zod';

export const createChatRoomSchema = z.object({
  name: z.string().min(2, 'Room name must be at least 2 characters'),
  participantIds: z
    .string()
    .refine((val) => val.trim().length > 0, 'Participant IDs cannot be empty') // Check for empty input
    .refine((val) => {
      const ids = val.split(',').map((id) => parseInt(id.trim(), 10));
      return ids.every((id) => !isNaN(id) && id > 0);
    }, 'Participant IDs must be a comma-separated list of positive numbers'),
});
