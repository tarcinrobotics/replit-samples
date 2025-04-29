import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { insertBookingSchema, Course } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const bookingFormSchema = insertBookingSchema.extend({
  date: z.date({
    required_error: "Please select a date and time",
  }),
  notes: z.string().max(500).optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  course: Course;
  onSuccess?: () => void;
}

export function BookingForm({ course, onSuccess }: BookingFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Generate time slots from 8 AM to 8 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      const amPm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour > 12 ? hour - 12 : hour;
      slots.push(`${formattedHour}:00 ${amPm}`);
      slots.push(`${formattedHour}:30 ${amPm}`);
    }
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  const defaultValues: Partial<BookingFormValues> = {
    courseId: course.id,
    studentId: user?.id,
    tutorId: course.tutorId,
    date: new Date(),
    notes: "",
  };

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: BookingFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to book a session",
        variant: "destructive",
      });
      return;
    }
    
    const selectedTime = form.getValues("timeSlot");
    if (!selectedTime) {
      toast({
        title: "Error",
        description: "Please select a time for your booking",
        variant: "destructive",
      });
      return;
    }
    
    // Parse the selected time and combine with selected date
    const [hourMinute, amPm] = selectedTime.split(' ');
    const [hour, minute] = hourMinute.split(':').map(Number);
    
    let adjustedHour = hour;
    if (amPm === 'PM' && hour !== 12) {
      adjustedHour += 12;
    } else if (amPm === 'AM' && hour === 12) {
      adjustedHour = 0;
    }
    
    const bookingDate = new Date(data.date);
    bookingDate.setHours(adjustedHour, minute);
    
    const bookingData = {
      ...data,
      date: bookingDate,
    };
    
    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/bookings", bookingData);
      toast({
        title: "Booking created",
        description: "Your booking request has been submitted.",
      });
      
      // Invalidate cache to refresh bookings list
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="border rounded p-4 bg-muted/20">
            <h3 className="font-medium">Course Details</h3>
            <p className="text-sm mt-1">{course.title}</p>
            <div className="mt-2 text-sm text-muted-foreground">
              <div>Duration: {Math.floor(course.duration / 60)}h {course.duration % 60}m</div>
              <div>Subject: {course.subject}</div>
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Session Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => 
                        date < new Date() || // Can't book in the past
                        date.getDay() === 0 || // No bookings on Sundays
                        date.getDay() === 6 // No bookings on Saturdays
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="timeSlot"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session Time</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes for the tutor (optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any specific topics you want to cover or questions you have..."
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Book Session"}
        </Button>
      </form>
    </Form>
  );
}
