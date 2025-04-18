
import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';

const CreateInstructor: React.FC = () => {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    specialization: '',
  });

  const createInstructor = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/instructors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create instructor');
      return response.json();
    },
    onSuccess: () => {
      setLocation('/instructors');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInstructor.mutate(formData);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Instructor</h1>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Specialization</label>
              <Input
                value={formData.specialization}
                onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Create Instructor
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateInstructor;
