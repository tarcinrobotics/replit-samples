import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TutorForm } from "@/components/tutors/tutor-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, TutorProfile } from "@shared/schema";
import { 
  User as UserIcon, 
  Edit, 
  Mail, 
  BookOpen, 
  GraduationCap,
  Settings 
} from "lucide-react";

// Profile form schema
const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const isStudent = user?.role === "student";
  const isTutor = user?.role === "tutor";
  
  // Fetch extended profile data
  const { data: profileData, isLoading } = useQuery<{ user: User; profile?: TutorProfile }>({
    queryKey: ['/api/profile'],
    enabled: !!user,
  });
  
  // Setup form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      bio: user?.bio || "",
      profileImage: user?.profileImage || "",
    },
  });
  
  // Update profile data when fetched
  React.useEffect(() => {
    if (profileData?.user) {
      const userData = profileData.user;
      form.reset({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        bio: userData.bio || "",
        profileImage: userData.profileImage || "",
      }, {
        keepDefaultValues: true
      });
    }
  }, [profileData?.user, form]);
  
  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      await apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };
  
  // Get initials for avatar
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile information. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about yourself..." 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A brief description about yourself.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="profileImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/image.jpg" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Enter a URL for your profile image.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-2">
                <AvatarImage 
                  src={profileData?.user.profileImage} 
                  alt={`${profileData?.user.firstName} ${profileData?.user.lastName}`} 
                />
                <AvatarFallback>
                  {getInitials(profileData?.user.firstName, profileData?.user.lastName)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">
                {profileData?.user.firstName} {profileData?.user.lastName}
              </CardTitle>
              <CardDescription>{profileData?.user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">
                    {profileData?.user.role === "student" ? "Student" : 
                     profileData?.user.role === "tutor" ? "Tutor" : "Administrator"}
                  </span>
                </div>
                
                {profileData?.user.bio && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">About</h3>
                    <p className="text-sm text-muted-foreground">{profileData.user.bio}</p>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Basic Information
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="lg:col-span-2 space-y-6">
            {isTutor && (
              <Tabs defaultValue="tutor-profile" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="tutor-profile">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Tutor Profile
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="tutor-profile" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tutor Profile</CardTitle>
                      <CardDescription>
                        Manage your tutor profile information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="h-48 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <TutorForm 
                          user={profileData?.user as User} 
                          profile={profileData?.profile}
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>
                        Manage your account settings and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border rounded-md p-4">
                          <h3 className="font-medium mb-2">Password</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Change your account password
                          </p>
                          <Button variant="outline">Change Password</Button>
                        </div>
                        
                        <div className="border rounded-md p-4">
                          <h3 className="font-medium mb-2">Notifications</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Manage your email notification preferences
                          </p>
                          <Button variant="outline">Notification Settings</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
            
            {isStudent && (
              <Tabs defaultValue="settings" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="learning">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Learning
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="learning" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Learning Preferences</CardTitle>
                      <CardDescription>
                        Manage your learning style and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border rounded-md p-4">
                          <h3 className="font-medium mb-2">Interests</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Select subjects you're interested in to get personalized recommendations
                          </p>
                          <Button variant="outline">Edit Interests</Button>
                        </div>
                        
                        <div className="border rounded-md p-4">
                          <h3 className="font-medium mb-2">Learning Goals</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Set your learning goals and track your progress
                          </p>
                          <Button variant="outline">Set Goals</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>
                        Manage your account settings and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border rounded-md p-4">
                          <h3 className="font-medium mb-2">Password</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Change your account password
                          </p>
                          <Button variant="outline">Change Password</Button>
                        </div>
                        
                        <div className="border rounded-md p-4">
                          <h3 className="font-medium mb-2">Notifications</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Manage your email notification preferences
                          </p>
                          <Button variant="outline">Notification Settings</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
