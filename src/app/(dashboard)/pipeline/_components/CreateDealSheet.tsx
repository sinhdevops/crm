"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
} from "@/components/ui/dialog";
import { ModalShell } from "@/components/ui/modal-shell";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import ContactDialog from "@/app/(dashboard)/contacts/_components/ContactDialog";
import { useGetContacts } from "@/hooks/useContacts";
import { useCreateDeal } from "@/hooks/useDeals";
import { useGetUsers } from "@/hooks/useUsers";
import { Contact } from "@/lib/validations/contacts.scheme";
import { STAGE_CONFIG, STAGES, Stage } from "./types";

const createDealFormSchema = z.object({
  title: z
    .string()
    .min(1, "Tên deal không được để trống")
    .max(200, "Tên deal không được vượt quá 200 ký tự"),
  contactId: z.string().min(1, "Vui lòng chọn liên hệ"),
  ownerId: z.string().min(1, "Vui lòng chọn người phụ trách"),
  value: z.number().nonnegative("Giá trị không được âm"),
  stage: z.enum(STAGES),
  probability: z.number().min(0).max(100),
  priority: z.string().optional(),
  leadSource: z.string().optional(),
  propertyProject: z.string().optional(),
  propertyType: z.string().optional(),
  propertyCode: z.string().optional(),
  propertyArea: z.string().optional(),
  appointmentDate: z.string().optional(),
  lostReason: z.string().optional(),
  closeDate: z.string().optional(),
  note: z.string().optional(),
});

type CreateDealFormValues = z.infer<typeof createDealFormSchema>;

function formatMoney(value: number) {
  if (!value) return "0";
  const millions = value / 1_000_000;
  if (millions >= 1000) return `${(millions / 1000).toFixed(1).replace(".0", "")} tỷ`;
  return `${millions.toFixed(0)} triệu`;
}

interface CreateDealSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStage?: Stage;
}

export function CreateDealSheet({
  open,
  onOpenChange,
  defaultStage = "PROSPECT",
}: CreateDealSheetProps) {
  const createDeal = useCreateDeal();
  const contactsQuery = useGetContacts({ limit: 100 });
  const usersQuery = useGetUsers();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [createdContacts, setCreatedContacts] = useState<Contact[]>([]);

  const fetchedContacts = useMemo(
    () => contactsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [contactsQuery.data],
  );
  const contacts = useMemo(() => {
    const contactMap = new Map<string, Contact>();

    for (const contact of fetchedContacts) {
      contactMap.set(contact.id, contact);
    }

    for (const contact of createdContacts) {
      contactMap.set(contact.id, contact);
    }

    return Array.from(contactMap.values());
  }, [createdContacts, fetchedContacts]);
  const users = usersQuery.data ?? [];

  const form = useForm<CreateDealFormValues>({
    resolver: zodResolver(createDealFormSchema),
    defaultValues: {
      title: "",
      contactId: "",
      ownerId: "",
      value: 0,
      stage: defaultStage,
      probability: STAGE_CONFIG[defaultStage].probability,
      priority: "",
      leadSource: "",
      propertyProject: "",
      propertyType: "",
      propertyCode: "",
      propertyArea: "",
      appointmentDate: "",
      lostReason: "",
      closeDate: "",
      note: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        title: "",
        contactId: "",
        ownerId: "",
        value: 0,
        stage: defaultStage,
        probability: STAGE_CONFIG[defaultStage].probability,
        priority: "",
        leadSource: "",
        propertyProject: "",
        propertyType: "",
        propertyCode: "",
        propertyArea: "",
        appointmentDate: "",
        lostReason: "",
        closeDate: "",
        note: "",
      });
    }
  }, [defaultStage, form, open]);

  useEffect(() => {
    if (open) {
      form.setValue("stage", defaultStage);
      form.setValue("probability", STAGE_CONFIG[defaultStage].probability);
    }
  }, [defaultStage, form, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setCreatedContacts([]);
      setContactDialogOpen(false);
    }

    onOpenChange(nextOpen);
  };

  const handleContactCreated = (contact: Contact) => {
    setCreatedContacts((current) => {
      const withoutDuplicate = current.filter((item) => item.id !== contact.id);
      return [contact, ...withoutDuplicate];
    });
    form.setValue("contactId", contact.id, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (values: CreateDealFormValues) => {
    await createDeal.mutateAsync({
      title: values.title,
      contactId: values.contactId,
      ownerId: values.ownerId,
      value: values.value,
      stage: values.stage,
      probability: values.probability,
      priority: values.priority?.trim() || undefined,
      leadSource: values.leadSource?.trim() || undefined,
      propertyProject: values.propertyProject?.trim() || undefined,
      propertyType: values.propertyType?.trim() || undefined,
      propertyCode: values.propertyCode?.trim() || undefined,
      propertyArea: values.propertyArea?.trim() || undefined,
      appointmentDate: values.appointmentDate ? new Date(values.appointmentDate) : undefined,
      lostReason: values.lostReason?.trim() || undefined,
      closeDate: values.closeDate ? new Date(values.closeDate) : new Date(),
      note: values.note?.trim() ? values.note.trim() : undefined,
    });

    handleOpenChange(false);
  };

  const isPending = createDeal.isPending;
  const contactsLoading = contactsQuery.isLoading;
  const usersLoading = usersQuery.isLoading;
  const probability = form.watch("probability") || 0;
  const value = form.watch("value") || 0;
  const forecastValue = value * (probability / 100);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <ModalShell
        title="Thêm deal"
        description="Deal là một cơ hội bán/chốt giao dịch cụ thể của một khách hàng."
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ fontSize: 12 }}>
                    Tên deal <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tên deal"
                      {...field}
                      style={{ fontSize: 13 }}
                      className="bg-[#F8F8F7] border-[#E8E7E2]"
                    />
                  </FormControl>
                  <FormMessage style={{ fontSize: 11 }} />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ fontSize: 12 }}>Giai đoạn</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("probability", STAGE_CONFIG[value as keyof typeof STAGE_CONFIG].probability);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger size="sm" className="h-10 w-full bg-[#F8F8F7] border-[#E8E7E2]" style={{ fontSize: 13 }}>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STAGES.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {STAGE_CONFIG[stage].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage style={{ fontSize: 11 }} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="probability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ fontSize: 12 }}>Xác suất chốt (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...field}
                        onChange={(event) => field.onChange(event.target.valueAsNumber || 0)}
                        className="bg-[#F8F8F7] border-[#E8E7E2]"
                        style={{ fontSize: 13 }}
                      />
                    </FormControl>
                    <FormMessage style={{ fontSize: 11 }} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ fontSize: 12 }}>Độ ưu tiên</FormLabel>
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger size="sm" className="h-10 w-full bg-[#F8F8F7] border-[#E8E7E2]" style={{ fontSize: 13 }}>
                          <SelectValue placeholder="Chọn" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["Nóng", "Ấm", "Lạnh", "VIP"].map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage style={{ fontSize: 11 }} />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ fontSize: 12 }}>Lịch hẹn/dẫn xem</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} className="bg-[#F8F8F7] border-[#E8E7E2]" style={{ fontSize: 13 }} />
                    </FormControl>
                    <FormMessage style={{ fontSize: 11 }} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lostReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ fontSize: 12 }}>Lý do thua</FormLabel>
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger size="sm" className="h-10 w-full bg-[#F8F8F7] border-[#E8E7E2]" style={{ fontSize: 13 }}>
                          <SelectValue placeholder="Chỉ chọn khi mất deal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["Giá cao", "Không đủ tài chính", "Chọn nơi khác", "Đổi nhu cầu", "Không liên hệ được", "Pháp lý/chủ đầu tư", "Khác"].map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage style={{ fontSize: 11 }} />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-lg border border-border/70 bg-secondary/40 px-3 py-2">
              <p className="text-muted-foreground" style={{ fontSize: 11 }}>
                Dự báo doanh thu
              </p>
              <p className="text-foreground" style={{ fontSize: 14, fontWeight: 600 }}>
                {formatMoney(forecastValue)} = {formatMoney(value)} × {probability}%
              </p>
            </div>

            <FormField
              control={form.control}
              name="contactId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ fontSize: 12 }}>
                    Liên hệ <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={contactsLoading || isPending}
                  >
                    <FormControl>
                      <SelectTrigger
                        size="sm"
                        style={{ fontSize: 13 }}
                        className="h-10 w-full bg-[#F8F8F7] border-[#E8E7E2]"
                      >
                        <SelectValue
                          placeholder={
                            contactsLoading ? "Đang tải..." : "Chọn liên hệ"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent position="popper" className="z-[100] w-[--radix-select-trigger-width]">
                      {contacts.map((contact) => (
                        <SelectItem
                          key={contact.id}
                          value={contact.id}
                          style={{ fontSize: 13 }}
                        >
                          {contact.name}
                          {contact.company ? ` - ${contact.company}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs text-primary bg-[#F8F8F7] hover:bg-gray-100 border border-[#E8E7E2] mt-1.5"
                    disabled={isPending}
                    onClick={() => setContactDialogOpen(true)}
                  >
                    + Tạo liên hệ mới
                  </Button>
                  <FormMessage style={{ fontSize: 11 }} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ownerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ fontSize: 12 }}>
                    Người phụ trách <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={usersLoading || isPending}
                  >
                    <FormControl>
                      <SelectTrigger size="sm" style={{ fontSize: 13 }} className="h-10 w-full">
                        <SelectValue
                          placeholder={
                            usersLoading
                              ? "Đang tải..."
                              : "Chọn người phụ trách"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent position="popper" className="z-[100] w-[--radix-select-trigger-width]">
                      {users.map((user) => (
                        <SelectItem
                          key={user.id}
                          value={user.id}
                          style={{ fontSize: 13 }}
                        >
                          {user.name} - {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage style={{ fontSize: 11 }} />
                </FormItem>
              )}
            />

            <div className="rounded-lg border border-border/70 bg-[#F8F8F7] p-3">
              <p className="mb-3 text-foreground" style={{ fontSize: 12, fontWeight: 600 }}>
                Sản phẩm BĐS & nguồn lead
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="propertyProject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ fontSize: 12 }}>Dự án/sản phẩm</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="VD: Vinhomes Q9" style={{ fontSize: 13 }} />
                      </FormControl>
                      <FormMessage style={{ fontSize: 11 }} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ fontSize: 12 }}>Loại hình</FormLabel>
                      <Select value={field.value || undefined} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger size="sm" className="h-10 w-full bg-background" style={{ fontSize: 13 }}>
                            <SelectValue placeholder="Chọn loại" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["Căn hộ", "Nhà phố", "Đất nền", "Biệt thự", "Shophouse", "Văn phòng", "Khác"].map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage style={{ fontSize: 11 }} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="propertyCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ fontSize: 12 }}>Mã căn/lô</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="VD: A1208, Lô B3" style={{ fontSize: 13 }} />
                      </FormControl>
                      <FormMessage style={{ fontSize: 11 }} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="propertyArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ fontSize: 12 }}>Diện tích/khu vực</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="VD: 72m2, Thủ Đức" style={{ fontSize: 13 }} />
                      </FormControl>
                      <FormMessage style={{ fontSize: 11 }} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="leadSource"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel style={{ fontSize: 12 }}>Nguồn lead</FormLabel>
                      <Select value={field.value || undefined} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger size="sm" className="h-10 w-full bg-background" style={{ fontSize: 13 }}>
                            <SelectValue placeholder="Khách đến từ đâu?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["Facebook", "Google", "TikTok", "Zalo", "Website", "Khách giới thiệu", "Telesale", "Thị trường", "Khác"].map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage style={{ fontSize: 11 }} />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ fontSize: 12 }}>Giá trị</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="VD: 320000000"
                        {...field}
                        onChange={(event) =>
                          field.onChange(event.target.valueAsNumber)
                        }
                        style={{ fontSize: 13 }}
                      />
                    </FormControl>
                    <FormMessage style={{ fontSize: 11 }} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="closeDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1.5">
                    <FormLabel style={{ fontSize: 12, lineHeight: 1 }}>
                      Ngày đóng dự kiến
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        size="md"
                      />
                    </FormControl>
                    <FormMessage style={{ fontSize: 11 }} />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ fontSize: 12 }}>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ghi chú về deal này..."
                      rows={4}
                      {...field}
                      style={{ fontSize: 13, resize: "none" }}
                      className="bg-[#F8F8F7] border-[#E8E7E2]"
                    />
                  </FormControl>
                  <FormMessage style={{ fontSize: 11 }} />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                disabled={isPending}
                onClick={() => handleOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                className="flex-1 text-xs"
                disabled={isPending}
              >
                {isPending ? "Đang tạo..." : "Tạo deal"}
              </Button>
            </div>
          </form>
        </Form>
      </ModalShell>

      <ContactDialog
        isOpen={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        onCreated={handleContactCreated}
      />
    </Dialog>
  );
}
  


