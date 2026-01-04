import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

type InquiryRow = {
  id: string;
  product_id: string | null;
  product_name: string;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  requirements: string;
  status: "in_process" | "resolved" | "closed";
  created_at: string;
};

const statusOptions = [
  { value: "in_process", label: "In process" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
] as const;

export default function AdminInquiries() {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRow | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const loadInquiries = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("product_inquiries")
      .select(
        "id, product_id, product_name, user_id, first_name, last_name, email, phone, requirements, status, created_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Failed to load inquiries",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    setInquiries((data ?? []) as InquiryRow[]);
    setIsLoading(false);
  };

  const handleStatusChange = async (inquiryId: string, nextStatus: InquiryRow["status"]) => {
    const { error } = await supabase
      .from("product_inquiries")
      .update({ status: nextStatus })
      .eq("id", inquiryId);

    if (error) {
      toast({
        title: "Unable to update status",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setInquiries((prev) =>
      prev.map((item) => (item.id === inquiryId ? { ...item, status: nextStatus } : item)),
    );
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesStatus =
      statusFilter === "all" ? true : inquiry.status === (statusFilter as InquiryRow["status"]);
    if (!normalizedQuery) return matchesStatus;
    const fullName = `${inquiry.first_name ?? ""} ${inquiry.last_name ?? ""}`.trim();
    const haystack = [
      inquiry.product_name,
      inquiry.email,
      fullName,
      inquiry.first_name ?? "",
      inquiry.last_name ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return matchesStatus && haystack.includes(normalizedQuery);
  });

  const totalPages = Math.max(1, Math.ceil(filteredInquiries.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedInquiries = filteredInquiries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchQuery]);

  const statusLabel = (status: InquiryRow["status"]) =>
    statusOptions.find((option) => option.value === status)?.label ?? status;

  return (
    <Layout>
      <section className="bg-cream py-12">
        <div className="container mx-auto space-y-6 px-6 lg:px-12">
          <div className="flex flex-col gap-3">
            <Badge className="w-fit rounded-full border border-charcoal/20 bg-white/70 px-4 py-1 text-[10px] uppercase tracking-[0.35em] text-charcoal/70">
              Admin dashboard
            </Badge>
            <h1 className="font-serif text-4xl text-charcoal md:text-6xl">Gallery inquiries</h1>
            <p className="max-w-2xl text-base text-charcoal/60 md:text-lg">
              Review customer submissions tied to gallery products.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto space-y-6 px-6 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-serif text-2xl text-charcoal">Recent inquiries</h2>
            <Button variant="outline" onClick={loadInquiries} disabled={isLoading}>
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inquiry-search">Search</Label>
              <Input
                id="inquiry-search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by product, email, or name"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-charcoal/10 bg-cream/50 p-8 text-center text-sm text-charcoal/60">
              Loading inquiries...
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="rounded-2xl border border-charcoal/10 bg-cream/50 p-8 text-center text-sm text-charcoal/60">
              No inquiries match your filters.
            </div>
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-3">
                {paginatedInquiries.map((inquiry) => {
                  const fullName = `${inquiry.first_name ?? ""} ${inquiry.last_name ?? ""}`.trim();
                  const createdAt = new Date(inquiry.created_at).toLocaleDateString();
                  return (
                    <Card key={inquiry.id} className="border-charcoal/10">
                      <CardHeader className="space-y-2 pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="rounded-full border border-charcoal/20 bg-white/70 px-2 py-1 text-[9px] uppercase tracking-[0.35em] text-charcoal/70">
                            Inquiry
                          </Badge>
                          <Badge className="rounded-full border border-gold/30 bg-gold/10 px-2 py-1 text-[9px] uppercase tracking-[0.35em] text-gold-dark">
                            {statusLabel(inquiry.status)}
                          </Badge>
                          <span className="text-[10px] uppercase tracking-[0.3em] text-charcoal/50">
                            {createdAt}
                          </span>
                        </div>
                        <CardTitle className="font-serif text-lg text-charcoal">
                          {inquiry.product_name}
                        </CardTitle>
                        <p className="text-xs text-charcoal/70">
                          {fullName || "Unknown"} | {inquiry.email}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Status</Label>
                          <Select
                            value={inquiry.status}
                            onValueChange={(value) =>
                              handleStatusChange(inquiry.id, value as InquiryRow["status"])
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setSelectedInquiry(inquiry)}
                        >
                          View details
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {filteredInquiries.length > pageSize && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-charcoal/60">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Dialog open={Boolean(selectedInquiry)} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{selectedInquiry?.product_name ?? "Inquiry details"}</DialogTitle>
            <DialogDescription>Review full inquiry details and requirements.</DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4 text-sm text-charcoal/80">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-charcoal/50">Contact</p>
                <p className="mt-1 text-sm text-charcoal">
                  {[selectedInquiry.first_name, selectedInquiry.last_name].filter(Boolean).join(" ") ||
                    "Unknown"}
                </p>
                <p className="text-xs text-charcoal/70">{selectedInquiry.email}</p>
                {selectedInquiry.phone && (
                  <p className="text-xs text-charcoal/70">{selectedInquiry.phone}</p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-charcoal/50">Requirements</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-charcoal/80">
                  {selectedInquiry.requirements}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedInquiry(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
