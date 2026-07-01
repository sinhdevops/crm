export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

export interface Invitation {
  id: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "SALES_REP";
  status: InvitationStatus;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export const invitationsService = {
  create: async (_email: string, _role: string) => {
    throw new Error("Invitations are disabled in single-user Supabase mode.");
  },
  getAll: async (): Promise<Invitation[]> => [],
  revoke: async (_id: string) => ({ ok: true }),
  verify: async (_token: string) => {
    throw new Error("Invitations are disabled in single-user Supabase mode.");
  },
  accept: async (_data: unknown) => {
    throw new Error("Invitations are disabled in single-user Supabase mode.");
  },
  update: async (_id: string, _email?: string, _role?: string) => {
    throw new Error("Invitations are disabled in single-user Supabase mode.");
  },
};
