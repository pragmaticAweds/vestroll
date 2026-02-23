import { z } from "zod";

const TimeOffStatusSchema = z
  .enum(["Approved", "Rejected", "approved", "rejected"])
  .transform((value) => value.toLowerCase() as "approved" | "rejected");

export const UpdateTimeOffStatusBodySchema = z.object({
  status: TimeOffStatusSchema,
  reason: z
    .string()
    .trim()
    .max(500, "Reason must be 500 characters or fewer")
    .optional(),
});

export type UpdateTimeOffStatusBody = z.infer<
  typeof UpdateTimeOffStatusBodySchema
>;
