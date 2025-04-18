import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
  };
  
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Notification preferences saved",
      description: "Your notification preferences have been updated.",
    });
  };
  
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Account settings updated",
      description: "Your account settings have been saved.",
    });
  };

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSaveProfile}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue="Alex Johnson" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="alex@example.com" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        className="w-full min-h-[100px] p-2 border rounded-md"
                        defaultValue="Student majoring in Computer Science. Interested in machine learning and web development."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="avatar">Profile Picture</Label>
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-800 font-medium text-lg">A</span>
                        </div>
                        <Button variant="outline" type="button">
                          Change
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit">Save Changes</Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSaveNotifications}>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive emails about your sessions and updates</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Session Reminders</h4>
                        <p className="text-sm text-gray-500">Get notified 1 hour before your sessions</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Marketing Emails</h4>
                        <p className="text-sm text-gray-500">Receive news, offers, and updates from TutorConnect</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit">Save Preferences</Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account and security preferences
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSaveAccount}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    
                    <div className="pt-4">
                      <h4 className="text-sm font-medium mb-2">Danger Zone</h4>
                      <Button variant="destructive" type="button">
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit">Save Changes</Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default Settings;
