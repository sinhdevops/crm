import { Controller, useForm } from "react-hook-form";
import {
  Contact,
  CreateContactBodySchema,
  CreateContactBodyType,
} from "@/lib/validations/contacts.scheme";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ContactFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateContactBodyType) => void;
  isPending?: boolean;
  defaultValues?: Partial<Contact>;
}

const customerTypes = ["Khách mới", "Đang tư vấn", "Đã mua hàng", "Tiềm năng", "Chưa liên hệ", "Tạm ngưng"];
const priorities = ["Nóng", "Ấm", "Lạnh", "VIP"];
const genders = ["Nam", "Nữ", "Khác"];
const interestTypes = ["Căn hộ", "Nhà phố", "Đất nền", "Biệt thự", "Shophouse", "Khác"];
const purchaseNeeds = ["Ở", "Đầu tư", "Cho thuê", "Bán/chuyển nhượng"];
const postSaleStatuses = ["Chưa mua", "Đã cọc", "Đã ký hợp đồng", "Đã bàn giao", "Đang chăm lại", "Xin giới thiệu"];
const staffOptions = ["Văn Sinh"];
const sources = ["Thị trường", "Mess", "Google", "Khách giới thiệu"];

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function ContactForm({ onSubmit, isPending, defaultValues }: ContactFormProps) {
  const form = useForm<CreateContactBodyType>({
    resolver: zodResolver(CreateContactBodySchema) as any,
    defaultValues: {
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      zalo: defaultValues?.zalo ?? "",
      facebook: defaultValues?.facebook ?? "",
      company: defaultValues?.company ?? "",
      position: defaultValues?.position ?? "",
      customerType: defaultValues?.customerType ?? "Khách mới",
      priority: defaultValues?.priority ?? "",
      gender: defaultValues?.gender ?? "",
      birthday: defaultValues?.birthday ?? "",
      residence: defaultValues?.residence ?? "",
      areaInterest: defaultValues?.areaInterest ?? "",
      interestType: defaultValues?.interestType ?? "",
      purchaseNeed: defaultValues?.purchaseNeed ?? "",
      budgetMin: defaultValues?.budgetMin ?? undefined,
      budgetMax: defaultValues?.budgetMax ?? undefined,
      decisionMaker: defaultValues?.decisionMaker ?? "",
      workDate: defaultValues?.workDate ?? "",
      lastContactedDate: defaultValues?.lastContactedDate ?? "",
      nextFollowUpDate: defaultValues?.nextFollowUpDate ?? "",
      paymentDate: defaultValues?.paymentDate ?? "",
      note: defaultValues?.note ?? "",
      solutionPlan: defaultValues?.solutionPlan ?? "",
      assignedStaff: defaultValues?.assignedStaff ?? "Văn Sinh",
      source: defaultValues?.source ?? "",
      nextPaymentDate: defaultValues?.nextPaymentDate ?? "",
      postSaleStatus: defaultValues?.postSaleStatus ?? "Chưa mua",
    },
  });

  useEffect(() => {
    form.reset({
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      zalo: defaultValues?.zalo ?? "",
      facebook: defaultValues?.facebook ?? "",
      company: defaultValues?.company ?? "",
      position: defaultValues?.position ?? "",
      customerType: defaultValues?.customerType ?? "Khách mới",
      priority: defaultValues?.priority ?? "",
      gender: defaultValues?.gender ?? "",
      birthday: defaultValues?.birthday ?? "",
      residence: defaultValues?.residence ?? "",
      areaInterest: defaultValues?.areaInterest ?? "",
      interestType: defaultValues?.interestType ?? "",
      purchaseNeed: defaultValues?.purchaseNeed ?? "",
      budgetMin: defaultValues?.budgetMin ?? undefined,
      budgetMax: defaultValues?.budgetMax ?? undefined,
      decisionMaker: defaultValues?.decisionMaker ?? "",
      workDate: defaultValues?.workDate ?? "",
      lastContactedDate: defaultValues?.lastContactedDate ?? "",
      nextFollowUpDate: defaultValues?.nextFollowUpDate ?? "",
      paymentDate: defaultValues?.paymentDate ?? "",
      note: defaultValues?.note ?? "",
      solutionPlan: defaultValues?.solutionPlan ?? "",
      assignedStaff: defaultValues?.assignedStaff ?? "Văn Sinh",
      source: defaultValues?.source ?? "",
      nextPaymentDate: defaultValues?.nextPaymentDate ?? "",
      postSaleStatus: defaultValues?.postSaleStatus ?? "Chưa mua",
    });
  }, [defaultValues, form]);

  return (
    <form id="form-rhf-contact" onSubmit={form.handleSubmit((data) => onSubmit(data as CreateContactBodyType))}>
      <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-contact-name">Tên khách hàng</FieldLabel>
              <Input {...field} id="form-rhf-contact-name" aria-invalid={fieldState.invalid} placeholder="Nhập tên khách hàng" autoComplete="off" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-contact-phone">Số điện thoại</FieldLabel>
              <Input {...field} id="form-rhf-contact-phone" aria-invalid={fieldState.invalid} placeholder="Nhập số điện thoại" autoComplete="off" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller name="zalo" control={form.control} render={({ field }) => (
          <Field>
            <FieldLabel>Zalo</FieldLabel>
            <Input {...field} placeholder="Số Zalo hoặc link Zalo" autoComplete="off" />
          </Field>
        )} />

        <Controller name="facebook" control={form.control} render={({ field }) => (
          <Field>
            <FieldLabel>Facebook</FieldLabel>
            <Input {...field} placeholder="Link Facebook nếu có" autoComplete="off" />
          </Field>
        )} />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-contact-email">Email</FieldLabel>
              <Input {...field} id="form-rhf-contact-email" aria-invalid={fieldState.invalid} placeholder="Nhập email nếu có" autoComplete="off" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller name="customerType" control={form.control} render={({ field }) => (
          <SelectField label="Loại khách hàng" value={field.value} onChange={field.onChange} options={customerTypes} placeholder="Chọn loại khách hàng" />
        )} />
        <Controller name="priority" control={form.control} render={({ field }) => (
          <SelectField label="Độ nóng" value={field.value} onChange={field.onChange} options={priorities} placeholder="Chọn độ nóng" />
        )} />
        <Controller name="gender" control={form.control} render={({ field }) => (
          <SelectField label="Giới tính" value={field.value} onChange={field.onChange} options={genders} placeholder="Chọn giới tính" />
        )} />
        <Controller name="birthday" control={form.control} render={({ field }) => (
          <Field>
            <FieldLabel>Ngày sinh</FieldLabel>
            <Input {...field} type="date" />
          </Field>
        )} />
        <Controller name="residence" control={form.control} render={({ field }) => (
          <Field>
            <FieldLabel>Nơi ở</FieldLabel>
            <Input {...field} placeholder="Nhập nơi ở hiện tại" />
          </Field>
        )} />
        <Controller name="areaInterest" control={form.control} render={({ field }) => (
          <Field>
            <FieldLabel>Khu vực quan tâm</FieldLabel>
            <Input {...field} placeholder="VD: Thủ Đức, Quận 7, Bình Dương" />
          </Field>
        )} />
        <Controller name="interestType" control={form.control} render={({ field }) => (
          <SelectField label="Loại quan tâm" value={field.value} onChange={field.onChange} options={interestTypes} placeholder="Chọn loại quan tâm" />
        )} />
        <Controller name="purchaseNeed" control={form.control} render={({ field }) => (
          <SelectField label="Nhu cầu mua" value={field.value} onChange={field.onChange} options={purchaseNeeds} placeholder="Chọn nhu cầu" />
        )} />
        <Controller name="budgetMin" control={form.control} render={({ field }) => (
          <Field>
            <FieldLabel>Ngân sách từ</FieldLabel>
            <Input {...field} value={field.value ?? ""} type="number" min={0} placeholder="VD: 3000000000" />
          </Field>
        )} />
        <Controller name="budgetMax" control={form.control} render={({ field }) => (
          <Field>
            <FieldLabel>Ngân sách đến</FieldLabel>
            <Input {...field} value={field.value ?? ""} type="number" min={0} placeholder="VD: 5000000000" />
          </Field>
        )} />
        <Controller name="decisionMaker" control={form.control} render={({ field }) => (
          <Field>
            <FieldLabel>Người quyết định</FieldLabel>
            <Input {...field} placeholder="VD: khách, vợ/chồng, bố mẹ, đối tác" />
          </Field>
        )} />
        <Controller name="workDate" control={form.control} render={({ field }) => (
          <Field>
            <FieldLabel>Ngày làm việc</FieldLabel>
            <Input {...field} type="date" />
          </Field>
        )} />
        <Controller name="lastContactedDate" control={form.control} render={({ field }) => (
          <Field>
            <FieldLabel>Lần chăm gần nhất</FieldLabel>
            <Input {...field} type="date" />
          </Field>
        )} />
        <Controller name="nextFollowUpDate" control={form.control} render={({ field }) => (
          <Field>
            <FieldLabel>Ngày chăm tiếp theo</FieldLabel>
            <Input {...field} type="date" />
          </Field>
        )} />
        <Controller name="paymentDate" control={form.control} render={({ field }) => (
          <Field>
            <FieldLabel>Ngày đóng tiền</FieldLabel>
            <Input {...field} type="date" />
          </Field>
        )} />
        <Controller name="nextPaymentDate" control={form.control} render={({ field }) => (
          <Field>
            <FieldLabel>Đóng tiền đợt tiếp theo</FieldLabel>
            <Input {...field} type="date" />
          </Field>
        )} />
        <Controller name="postSaleStatus" control={form.control} render={({ field }) => (
          <SelectField label="Trạng thái sau bán" value={field.value} onChange={field.onChange} options={postSaleStatuses} placeholder="Chọn trạng thái" />
        )} />
        <Controller name="assignedStaff" control={form.control} render={({ field }) => (
          <SelectField label="Nhân viên" value={field.value} onChange={field.onChange} options={staffOptions} placeholder="Chọn nhân viên" />
        )} />
        <Controller name="source" control={form.control} render={({ field }) => (
          <SelectField label="Nguồn" value={field.value} onChange={field.onChange} options={sources} placeholder="Chọn nguồn" />
        )} />

        <Controller name="note" control={form.control} render={({ field }) => (
          <Field className="md:col-span-2">
            <FieldLabel>Ghi chú</FieldLabel>
            <Textarea {...field} placeholder="Nhập ghi chú về khách hàng" rows={3} />
          </Field>
        )} />
        <Controller name="solutionPlan" control={form.control} render={({ field }) => (
          <Field className="md:col-span-2">
            <FieldLabel>Phương án giải quyết</FieldLabel>
            <Textarea {...field} placeholder="Nhập phương án xử lý / bước tiếp theo" rows={3} />
          </Field>
        )} />
      </FieldGroup>

      <Field orientation="horizontal" className="justify-end pt-4">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit" form="form-rhf-contact" disabled={isPending}>
          {isPending ? "Đang xử lý..." : "Lưu"}
        </Button>
      </Field>
    </form>
  );
}

export default ContactForm;

