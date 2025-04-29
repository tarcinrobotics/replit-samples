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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { insertTutorProfileSchema, TutorProfile, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Subjects to choose from
const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "History",
  "Geography",
  "Economics",
  "Business",
  "Music",
  "Art",
  "Languages",
  "Physical Education",
];

// Adjust the tutor profile schema for form
const tutorFormSchema = z.object({
  bio: z.string().max(500).optional(),
  education: z.string().max(500).optional(),
  experience: z.string().max(500).optional(),
  hourlyRate: z.coerce.number().min(0).optional(),
  subjects: z.array(z.string()).min(1, "Select at least one subject"),
  availability: z.record(z.string(), z.boolean()).optional(),
});

type TutorFormValues = z.infer<typeof tutorFormSchema>;

interface TutorFormProps {
  user: User;
  profile?: TutorProfile;
  onSuccess?: () => void;
}

export function TutorForm({ user, profile, onSuccess }: TutorFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create availability for each day of the week
  const daysOfWeek = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" },
  ];
  
  // Parse profile availability if exists
  const parseAvailability = () => {
    const availability: Record<string, boolean> = {};
    daysOfWeek.forEach(day => {
      availability[day.id] = profile?.availability ? 
        !!(profile.availability as any)[day.id] : 
        day.id !== "saturday" && day.id !== "sunday"; // Default to weekdays available
    });
    return availability;
  };
  
  const defaultValues: TutorFormValues = {
    bio: user.bio || "",
    education: profile?.education || "",
    experience: profile?.experience || "",
    hourlyRate: profile?.hourlyRate ? profile.hourlyRate / 100 : 0, // Convert cents to dollars for display
    subjects: profile?.subjects || [],
    availability: parseAvailability(),
  };

  const form = useForm<TutorFormValues>({
    resolver: zodResolver(tutorFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: TutorFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert hourly rate from dollars to cents for storage
      const hourlyRateCents = data.hourlyRate ? Math.round(data.hourlyRate * 100) : 0;
      
      // Update tutor profile
      await apiRequest("PUT", "/api/tutors/profile", {
        ...data,
        hourlyRate: hourlyRateCents,
      });
      
      // Also update user bio
      if (data.bio !== user.bio) {
        await apiRequest("PUT", "/api/profile", {
          bio: data.bio,
        });
      }
      
      toast({
        title: "Profile updated",
        description: "Your tutor profile has been updated successfully.",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutors"] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell students about yourself..." 
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Share your teaching philosophy and approach.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="education"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Education</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Your educational background..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                List your degrees, certifications, or relevant educational background.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teaching Experience</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Your teaching experience..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Describe your teaching experience and achievements.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="hourlyRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hourly Rate ($)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  min="0"
                  placeholder="0.00" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Your standard hourly rate in USD.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="subjects"
          render={() => (
            <FormItem>
              <FormLabel>Subjects</FormLabel>
              <FormDescription className="mb-2">
                Select the subjects you can teach.
              </FormDescription>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {subjects.map((subject) => (
                  <FormField
                    key={subject}
                    control={form.control}
                    name="subjects"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={subject}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(subject)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, subject])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== subject
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {subject}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="availability"
          render={() => (
            <FormItem>
              <FormLabel>Availability</FormLabel>
              <FormDescription className="mb-2">
                Select the days you are available to teach.
              </FormDescription>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {daysOfWeek.map((day) => (
                  <FormField
                    key={day.id}
                    control={form.control}
                    name={`availability.${day.id}`}
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={day.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {day.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Update Profile"}
        </Button>
      </form>
    </Form>
  );
}
