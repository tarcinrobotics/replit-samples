import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Booking, Course, User } from "@shared/schema";
import { format } from "date-fns";
import { MoreHorizontal, Calendar, Check, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface BookingsTableProps {
  bookings: (Booking & { course?: Course; student?: User; tutor?: User })[];
  onRowClick?: (booking: Booking) => void;
}

export function BookingsTable({ bookings, onRowClick }: BookingsTableProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleStatusUpdate = async (bookingId: number, status: string) => {
    try {
      await apiRequest("PUT", `/api/bookings/${bookingId}`, { status });
      
      toast({
        title: "Booking updated",
        description: `Booking status changed to ${status}.`,
      });
      
      // Refresh bookings
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status.",
        variant: "destructive",
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Accepted</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Rejected</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const isTutor = user?.role === "tutor";
  
  const columns = [
    {
      header: "Date & Time",
      accessorKey: "date",
      cell: (booking: any) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{format(new Date(booking.date), "PPP p")}</span>
        </div>
      ),
    },
    {
      header: isTutor ? "Student" : "Tutor",
      accessorKey: (booking: any) => {
        if (isTutor) {
          return booking.student ? `${booking.student.firstName} ${booking.student.lastName}` : "Unknown Student";
        } else {
          return booking.tutor ? `${booking.tutor.firstName} ${booking.tutor.lastName}` : "Unknown Tutor";
        }
      },
    },
    {
      header: "Course",
      accessorKey: (booking: any) => booking.course ? booking.course.title : booking.courseId,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (booking: any) => getStatusBadge(booking.status),
    },
    {
      header: "Actions",
      accessorKey: (booking: any) => "",
      cell: (booking: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {isTutor && booking.status === "pending" && (
              <>
                <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "accepted")}>
                  <Check className="mr-2 h-4 w-4" />
                  Accept
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "rejected")}>
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
              </>
            )}
            {booking.status === "accepted" && isTutor && (
              <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "completed")}>
                <Check className="mr-2 h-4 w-4" />
                Mark as Completed
              </DropdownMenuItem>
            )}
            {(booking.status === "pending" || booking.status === "accepted") && !isTutor && (
              <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "cancelled")}>
                <X className="mr-2 h-4 w-4" />
                Cancel Booking
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable 
      columns={columns} 
      data={bookings} 
      onRowClick={onRowClick}
      searchable={true}
      searchKeys={["course.title", "date"]} 
    />
  );
}
