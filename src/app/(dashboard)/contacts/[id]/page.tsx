"use client";
import { ArrowLeft, Plus, MoreHorizontal, UserPlus } from "lucide-react";
import Link from "next/link";
import { ContactInfoPanel } from "../_components/ContactInfoPanel";
import ActivityTimeline from "@/components/activities/ActivityTimeline";
import { ContactDetailSkeleton } from "../_components/ContactDetailSkeleton";
import { Button } from "@/components/ui/button";
import { useGetContact } from "@/hooks/useContacts";
import { useParams } from "next/navigation";
import { useContactActivities, useCreateContactActivity } from "@/hooks/useActivities";

export default function ContactDetailPage() {
  // Get contact ID from URL params
  const params = useParams();
  const id = params.id as string;

  const getContactDetail = useGetContact(id);
  const activites = useContactActivities(id);
  const createActivity = useCreateContactActivity(id);

  if (getContactDetail.isLoading) {
    return <ContactDetailSkeleton />;
  }

  const contact = getContactDetail.data;
  const activities = activites?.data || [];

  const handleSubmitActivity = (data: any, reset: () => void) => {
    createActivity.mutate(data, {
      onSuccess: () => {
        reset();
      },
    });
  };

  if (!contact) {
    return <div>Contact not found</div>;
  }
  if (!activities) {
    return <div>Activities not found</div>;
  }

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      <header className="shrink-0 border-b bg-background flex flex-col items-start justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <Button
            variant="outline"
            size="icon"
            className="size-7 border-border text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/contacts">
              <ArrowLeft size={13} />
            </Link>
          </Button>

          <div
            className="flex min-w-0 items-center gap-1.5 text-muted-foreground"
            style={{ fontSize: 13 }}
          >
            <Link
              href="/contacts"
              className="text-muted-foreground hover:text-foreground transition-colors"
              style={{ textDecoration: "none", fontSize: 13 }}
            >
              Contacts
            </Link>
            <span className="text-muted-foreground/50" style={{ fontSize: 11 }}>
              /
            </span>
            <span
              className="text-foreground"
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              {contact.name}
            </span>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 overflow-x-auto pb-0.5 sm:w-auto sm:overflow-visible">
          <Button
            variant="outline"
            size="sm"
            className="h-8 shrink-0 gap-1.5 border-border text-muted-foreground hover:text-foreground text-xs"
          >
            <UserPlus size={13} />
            Phân công
          </Button>

          <Button size="sm" className="h-8 shrink-0 gap-1.5 text-xs">
            <Plus size={13} />
            Thêm deal
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="size-8 border-border text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal size={14} />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        <ContactInfoPanel contact={contact} />
        <ActivityTimeline
          activities={activities}
          onSubmitActivity={handleSubmitActivity}
          isPendingSubmit={createActivity.isPending}
          entityType="contact"
        />
      </div>
    </div>
  );
}
