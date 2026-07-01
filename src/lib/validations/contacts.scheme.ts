import z from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().optional(),
);

const optionalDateText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().optional(),
);

const optionalNumber = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim() === "") return undefined;
    if (value === null || value === undefined) return undefined;
    return Number(value);
  },
  z.number().nonnegative("Giá trị không được âm").optional(),
);

const ContactBaseSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string().min(2, "Tên liên hệ phải có ít nhất 2 ký tự").max(100, "Tên liên hệ không được vượt quá 100 ký tự"),
  email: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email không hợp lệ.").optional(),
  ),
  phone: optionalText,
  zalo: optionalText,
  facebook: optionalText,
  company: optionalText,
  position: optionalText,
  customerType: optionalText,
  priority: optionalText,
  gender: optionalText,
  birthday: optionalDateText,
  residence: optionalText,
  areaInterest: optionalText,
  interestType: optionalText,
  purchaseNeed: optionalText,
  budgetMin: optionalNumber,
  budgetMax: optionalNumber,
  decisionMaker: optionalText,
  workDate: optionalDateText,
  lastContactedDate: optionalDateText,
  nextFollowUpDate: optionalDateText,
  paymentDate: optionalDateText,
  note: optionalText,
  solutionPlan: optionalText,
  assignedStaff: z.string().default("Văn Sinh"),
  source: optionalText,
  nextPaymentDate: optionalDateText,
  postSaleStatus: optionalText,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export type ContactBaseType = z.infer<typeof ContactBaseSchema>;

export const CreateContactBodySchema = ContactBaseSchema.pick({
  name: true,
  email: true,
  phone: true,
  zalo: true,
  facebook: true,
  company: true,
  position: true,
  customerType: true,
  priority: true,
  gender: true,
  birthday: true,
  residence: true,
  areaInterest: true,
  interestType: true,
  purchaseNeed: true,
  budgetMin: true,
  budgetMax: true,
  decisionMaker: true,
  workDate: true,
  lastContactedDate: true,
  nextFollowUpDate: true,
  paymentDate: true,
  note: true,
  solutionPlan: true,
  assignedStaff: true,
  source: true,
  nextPaymentDate: true,
  postSaleStatus: true,
}).strict();

export const CreateContactResSchema = ContactBaseSchema.omit({
  deletedAt: true,
});

export type CreateContactBodyType = z.infer<typeof CreateContactBodySchema>;
export type Contact = z.infer<typeof CreateContactResSchema>;

export const UpdateContactBodySchema = CreateContactBodySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Ít nhất phải có một trường được cập nhật",
  });

export const UpdateContactResSchema = CreateContactResSchema;

export type UpdateContactBodyType = z.infer<typeof UpdateContactBodySchema>;
export type UpdateContactResType = z.infer<typeof UpdateContactResSchema>;

export const GetContactResSchema = ContactBaseSchema.omit({
  deletedAt: true,
}).extend({
  deals: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      stage: z.string(),
      value: z.coerce.number(),
    }),
  ),
  activities: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      note: z.string(),
      date: z.coerce.date(),
    }),
  ),
});
export type GetContactResType = z.infer<typeof GetContactResSchema>;

export const GetContactWithDealsActivitiesResSchema = ContactBaseSchema.omit({
  deletedAt: true,
}).extend({
  deals: z.array(
    z.object({
      id: z.string(),
      value: z.coerce.number(),
    }),
  ),
  activities: z.array(
    z.object({
      id: z.string(),
      date: z.coerce.date(),
    }),
  ),
});
export type GetContactWithDealsActivitiesResType = z.infer<
  typeof GetContactWithDealsActivitiesResSchema
>;

export const GetContactsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  customerType: z.string().optional(),
  purchaseNeed: z.string().optional(),
  interestType: z.string().optional(),
  source: z.string().optional(),
});

export const GetContactsResSchema = z.object({
  data: z.array(CreateContactResSchema),
  pagination: z.object({
    nextCursor: z.string().nullable(),
    hasNextPage: z.boolean(),
  }),
});

export const GetContactsWithDealsActivitiesResSchema = z.object({
  data: z.array(GetContactWithDealsActivitiesResSchema),
  pagination: z.object({
    nextCursor: z.string().nullable(),
    hasNextPage: z.boolean(),
  }),
});

export type GetContactsQueryType = z.infer<typeof GetContactsQuerySchema>;
export type GetContactsResType = z.infer<
  typeof GetContactsWithDealsActivitiesResSchema
>;
