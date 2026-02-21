import { db, users, organizations } from "../db";
import { eq } from "drizzle-orm";

export class TeamService {
    /**
     * Add a new employee to an organization.
     * If the organization doesn't exist, we can optionally create it (or assume the inviter belongs to one).
     * For issue #221, we just need to create the user and associate them.
     */
    static async addEmployee(data: {
        email: string;
        organizationId?: string;
    }) {
        // Check if email already exists
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, data.email))
            .limit(1);

        if (existingUser) {
            const error = new Error("Email already registered");
            (error as any).status = 409;
            throw error;
        }

        // Determine organization ID. If none provided, we could create a dummy one for now,
        // or just leave it null if the schema allows nullable (wait, the schema allows it because we didn't make it notNull).

        // Create the new user with pending status
        const [newUser] = await db
            .insert(users)
            .values({
                email: data.email,
                // Since we made firstName and lastName notNull in schema, we provide defaults for an invited user
                firstName: "",
                lastName: "",
                status: "pending_verification",
                organizationId: data.organizationId || null,
            })
            .returning({
                id: users.id,
                status: users.status,
                invitedAt: users.createdAt,
            });

        return newUser;
    }
}
