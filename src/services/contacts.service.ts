import {
  createContactAction,
  deleteContactAction,
  getContactByIdAction,
  getContactsAction,
  updateContactAction,
} from "@/app/(dashboard)/contacts/actions";
import type {
  CreateContactBodyType,
  GetContactResType,
  GetContactsQueryType,
  GetContactsResType,
  UpdateContactBodyType,
  UpdateContactResType,
} from "@/lib/validations/contacts.scheme";

export const contactsService = {
  getAll: async (params?: GetContactsQueryType): Promise<GetContactsResType> =>
    getContactsAction(params ?? { limit: 10 }),
  getById: async (id: string): Promise<GetContactResType> => getContactByIdAction(id),
  create: async (data: CreateContactBodyType) => createContactAction(data),
  update: async (id: string, data: UpdateContactBodyType): Promise<UpdateContactResType> =>
    updateContactAction(id, data),
  delete: async (id: string) => deleteContactAction(id),
};
