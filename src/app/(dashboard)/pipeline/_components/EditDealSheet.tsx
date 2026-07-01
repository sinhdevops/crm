import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
} from "@/components/ui/dialog";
import { ModalShell } from "@/components/ui/modal-shell";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Deal, DealDetail, STAGE_CONFIG, STAGES } from "./types";
import { useUpdateDeal } from "@/hooks/useDeals";
import { useGetUsers } from "@/hooks/useUsers";

const formSchema = z.object({
  title:     z.string().min(1, "Tên deal không được để trống"),
  stage:     z.enum(STAGES, "Vui lòng chọn giai đoạn"),
  contactId: z.string(),
  ownerId:   z.string().min(1, "Vui lòng chọn người phụ trách"),
  value:     z.number().nonnegative("Giá trị không được âm"),
  probability: z.number().min(0).max(100),
  priority: z.string().optional(),
  leadSource: z.string().optional(),
  propertyProject: z.string().optional(),
  propertyType: z.string().optional(),
  propertyCode: z.string().optional(),
  propertyArea: z.string().optional(),
  appointmentDate: z.string(),
  lostReason: z.string().optional(),
  closeDate: z.string(),
  note:      z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  deal: Deal | DealDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDealSheet({ deal, open, onOpenChange }: Props) {
  const updateDeal = useUpdateDeal(deal.id);
  const usersQuery = useGetUsers();
  const users = usersQuery.data ?? [];
  const usersLoading = usersQuery.isLoading;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title:     deal?.title ?? "",
      stage:     "PROSPECT",
      contactId: "",
      ownerId:   "",
      value:     0,
      probability: STAGE_CONFIG.PROSPECT.probability,
      priority: "",
      leadSource: "",
      propertyProject: "",
      propertyType: "",
      propertyCode: "",
      propertyArea: "",
      appointmentDate: "",
      lostReason: "",
      closeDate: "",
      note:      "",
    },
  });

  // Populate form when deal changes / sheet opens
  useEffect(() => {
    if (deal && open) {
      form.reset({
        title:     deal.title,
        stage:     deal.stage,
        contactId: deal.contactId || "",
        ownerId:   deal.ownerId || "",
        value:     Number(deal.value) || 0,
        probability: Number(deal.probability) || STAGE_CONFIG[deal.stage].probability,
        priority: deal.priority || "",
        leadSource: deal.leadSource || "",
        propertyProject: deal.propertyProject || "",
        propertyType: deal.propertyType || "",
        propertyCode: deal.propertyCode || "",
        propertyArea: deal.propertyArea || "",
        appointmentDate: deal.appointmentDate ? new Date(deal.appointmentDate).toISOString().slice(0, 16) : "",
        lostReason: deal.lostReason || "",
        closeDate: deal.closeDate ? new Date(deal.closeDate).toISOString().split("T")[0] : "",
        note:      deal.note || "",
      });
    }
  }, [deal, open, form]);

  const onSubmit = (values: FormValues) => {
    if (!deal) return;
    
    updateDeal.mutate({
      title:   values.title,
      ownerId: values.ownerId,
      value:   values.value,
      stage: values.stage,
      probability: values.probability,
      priority: values.priority || null,
      leadSource: values.leadSource || null,
      propertyProject: values.propertyProject || null,
      propertyType: values.propertyType || null,
      propertyCode: values.propertyCode || null,
      propertyArea: values.propertyArea || null,
      appointmentDate: values.appointmentDate ? new Date(values.appointmentDate) : null,
      lostReason: values.lostReason || null,
      closeDate: values.closeDate ? new Date(values.closeDate) : undefined,
      note:    values.note,
    });

    toast.success("Deal đã được cập nhật");
    onOpenChange(false);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ModalShell
        title="Chỉnh sửa deal"
        description="Cập nhật cơ hội bán hàng và giai đoạn xử lý hiện tại."
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ fontSize: 12 }}>
                    Tên deal <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Tên deal" {...field} style={{ fontSize: 13 }} className="bg-[#F8F8F7] border-[#E8E7E2]" />
                  </FormControl>
                  <FormMessage style={{ fontSize: 11 }} />
                </FormItem>
              )}
            />

            {/* Stage + Value */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                        <SelectTrigger size="sm" style={{ fontSize: 13 }} className="h-10 w-full bg-[#F8F8F7] border-[#E8E7E2]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" className="z-[100] w-[--radix-select-trigger-width]">
                        {STAGES.map((s) => (
                          <SelectItem key={s} value={s} style={{ fontSize: 13 }}>
                            {STAGE_CONFIG[s].label}
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
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ fontSize: 12 }}>Giá trị</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="VD: 320000000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        style={{ fontSize: 13 }}
                        className="bg-[#F8F8F7] border-[#E8E7E2]"
                      />
                    </FormControl>
                    <FormMessage style={{ fontSize: 11 }} />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
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
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage style={{ fontSize: 11 }} />
                  </FormItem>
                )}
              />
            </div>

            {/* Owner + Close Date */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="ownerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ fontSize: 12 }}>Người phụ trách <span className="text-destructive">*</span></FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={usersLoading}>
                      <FormControl>
                        <SelectTrigger size="sm" style={{ fontSize: 13 }} className="h-10 w-full bg-[#F8F8F7] border-[#E8E7E2]">
                          <SelectValue placeholder={usersLoading ? "Đang tải..." : "Chọn nhân viên"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" className="z-[100] w-[--radix-select-trigger-width]">
                        {users.map((o) => (
                          <SelectItem key={o.id} value={o.id} style={{ fontSize: 13 }}>
                            {o.name}
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
                name="closeDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1.5">
                    <FormLabel style={{ fontSize: 12, lineHeight: 1 }}>Ngày đóng dự kiến</FormLabel>
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
                      <FormControl>
                        <Input {...field} placeholder="Căn hộ, đất nền..." style={{ fontSize: 13 }} />
                      </FormControl>
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
                        <Input {...field} placeholder="VD: A1208" style={{ fontSize: 13 }} />
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
                    <FormItem>
                      <FormLabel style={{ fontSize: 12 }}>Nguồn lead</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Facebook, giới thiệu..." style={{ fontSize: 13 }} />
                      </FormControl>
                      <FormMessage style={{ fontSize: 11 }} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ fontSize: 12 }}>Lịch hẹn/dẫn xem</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} style={{ fontSize: 13 }} />
                      </FormControl>
                      <FormMessage style={{ fontSize: 11 }} />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="lostReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ fontSize: 12 }}>Lý do thua</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Chỉ nhập khi deal thất bại" style={{ fontSize: 13 }} />
                  </FormControl>
                  <FormMessage style={{ fontSize: 11 }} />
                </FormItem>
              )}
            />

            {/* Note */}
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
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" size="sm" className="flex-1 text-xs">
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Form>
      </ModalShell>
    </Dialog>
  );
}


