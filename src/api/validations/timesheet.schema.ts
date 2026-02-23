import { z } from "zod";

export const UpdateTimesheetStatusSchema = z.object({
  status: z.enum(["approved", "rejected"], {
    required_error: "Status is required",
    invalid_type_error: "Status must be 'approved' or 'rejected'",
  }),
});

export type UpdateTimesheetStatusInput = z.infer<
  typeof UpdateTimesheetStatusSchema
>;
