import {
  deleteUserAction,
  getUsersAction,
  updateUserAction,
} from "@/app/(dashboard)/settings/actions";

export const usersService = {
  getAll: getUsersAction,
  update: (id: string, data: { name?: string; role?: string }) =>
    updateUserAction(id, data),
  delete: (_id: string) => deleteUserAction(),
};
