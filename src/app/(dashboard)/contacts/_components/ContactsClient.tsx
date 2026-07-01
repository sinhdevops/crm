"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounceValue } from "usehooks-ts";
import { Filter, Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGetContacts } from "@/hooks/useContacts";
import ContactTable from "./ContactTable";
import type { Contact } from "@/lib/validations/contacts.scheme";
import ContactDialog from "./ContactDialog";
import { useContactsRealtime } from "@/realtime/useContactsRealtime";
import type { getContacts } from "@/server/queries/contacts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ContactsClientProps = {
  initialPage: Awaited<ReturnType<typeof getContacts>>;
};

const customerTypes = ["Khách mới", "Đang tư vấn", "Đã mua hàng", "Tiềm năng", "Chưa liên hệ", "Tạm ngưng"];
const purchaseNeeds = ["Ở", "Đầu tư"];
const interestTypes = ["Căn hộ", "Nhà phố", "Đất nền", "Biệt thự", "Shophouse", "Khác"];
const sources = ["Thị trường", "Mess", "Google", "Khách giới thiệu"];

function FilterSelect({
  value,
  onValueChange,
  placeholder,
  options,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-8 w-40 rounded-lg text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ContactsClient({ initialPage }: ContactsClientProps) {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [customerType, setCustomerType] = useState("all");
  const [purchaseNeed, setPurchaseNeed] = useState("all");
  const [interestType, setInterestType] = useState("all");
  const [source, setSource] = useState("all");
  const router = useRouter();
  const [debouncedSearch] = useDebounceValue(search, 300);
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    contact?: Contact;
  }>({ isOpen: false });
  useContactsRealtime();

  const hasFilters =
    !!debouncedSearch ||
    customerType !== "all" ||
    purchaseNeed !== "all" ||
    interestType !== "all" ||
    source !== "all";
  const params = {
    limit: 10,
    search: debouncedSearch || undefined,
    customerType: customerType !== "all" ? customerType : undefined,
    purchaseNeed: purchaseNeed !== "all" ? purchaseNeed : undefined,
    interestType: interestType !== "all" ? interestType : undefined,
    source: source !== "all" ? source : undefined,
  };
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetContacts(params, hasFilters ? undefined : initialPage);

  const contacts = data?.pages.flatMap((page) => page.data) ?? [];

  const clearFilters = () => {
    setSearch("");
    setCustomerType("all");
    setPurchaseNeed("all");
    setInterestType("all");
    setSource("all");
  };

  return (
    <>
      <div className="flex h-[100dvh]">
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <header className="shrink-0 border-b bg-background px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h1
              className="text-foreground tracking-tight"
              style={{ fontSize: 15, fontWeight: 600, lineHeight: 1 }}
            >
              Liên hệ
            </h1>

            <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:flex-nowrap">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Tìm kiếm liên hệ..."
                  className="h-8 w-full rounded-lg bg-background pl-8 text-xs"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 border-border text-muted-foreground hover:text-foreground text-xs"
                onClick={() => setShowFilters((value) => !value)}
              >
                <Filter size={13} />
                Lọc theo
              </Button>

              <FilterSelect
                value={customerType}
                onValueChange={setCustomerType}
                placeholder="Tất cả loại khách"
                options={customerTypes}
              />

              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-xs text-muted-foreground"
                  onClick={clearFilters}
                >
                  <X size={13} />
                  Xóa lọc
                </Button>
              )}

              <Button
                size="sm"
                className="h-8 shrink-0 gap-1.5 text-xs"
                onClick={() => setDialog({ isOpen: true })}
              >
                <Plus size={13} />
                Thêm liên hệ
              </Button>
            </div>
            </div>

            {showFilters && (
              <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                <FilterSelect
                  value={purchaseNeed}
                  onValueChange={setPurchaseNeed}
                  placeholder="Tất cả nhu cầu"
                  options={purchaseNeeds}
                />
                <FilterSelect
                  value={interestType}
                  onValueChange={setInterestType}
                  placeholder="Tất cả quan tâm"
                  options={interestTypes}
                />
                <FilterSelect
                  value={source}
                  onValueChange={setSource}
                  placeholder="Tất cả nguồn"
                  options={sources}
                />
              </div>
            )}
          </header>

          <main className="flex-1 overflow-y-auto bg-[#F8F8F7] p-3 sm:p-5">
            <div className="min-h-full overflow-x-auto rounded-xl border border-border/70 bg-background shadow-none">
              <ContactTable
                contacts={contacts}
                onDirect={(id) => router.push(`/contacts/${id}`)}
                isPending={isLoading}
                onEdit={(contact) => setDialog({ isOpen: true, contact })}
                onAdd={() => setDialog({ isOpen: true })}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
              />
            </div>
          </main>
        </div>
      </div>
      <ContactDialog
        {...dialog}
        onOpenChange={(open) => setDialog((state) => ({ ...state, isOpen: open }))}
      />
    </>
  );
}
