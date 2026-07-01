import { Dialog } from "@/components/ui/dialog";
import { ModalShell } from "@/components/ui/modal-shell";
import { useCreateContact, useUpdateContact } from "@/hooks/useContacts";
import { Contact, CreateContactBodyType } from "@/lib/validations/contacts.scheme";
import ContactForm from "./ContactForm";

interface ContactDialogProps {
  contact?: Contact;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (contact: Contact) => void;
}

function ContactDialog({
  contact,
  isOpen,
  onOpenChange,
  onCreated,
}: ContactDialogProps) {
  const { mutateAsync: createContact, isPending: isCreating } =
    useCreateContact();
  const { mutateAsync: updateContact, isPending: isUpdating } =
    useUpdateContact();

  const isEditing = !!contact;
  const isPending = isCreating || isUpdating;

  async function handleSubmit(data: CreateContactBodyType) {
    try {
      if (isEditing && contact?.id) {
        await updateContact({ id: contact.id, data });
      } else {
        const createdContact = await createContact(data);
        onCreated?.(createdContact);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting contact form:", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <ModalShell
        title={isEditing ? "Chỉnh sửa" : "Tạo mới"}
        description={
          isEditing
            ? "Cập nhật thông tin liên hệ vào form bên dưới và nhấn Lưu thay đổi để cập nhật liên hệ."
            : "Điền thông tin liên hệ mới vào form bên dưới và nhấn Thêm liên hệ để tạo liên hệ."
        }
      >
        <ContactForm
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onSubmit={handleSubmit}
          isPending={isPending}
          defaultValues={contact}
        />
      </ModalShell>
    </Dialog>
  );
}

export default ContactDialog;
