import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import BookingForm from './BookingForm';
import { useToast } from '@/hooks/use-toast';

interface BookSessionButtonProps extends ButtonProps {
  tutorId: number;
  tutorName: string;
  subjects: string[];
}

const BookSessionButton: React.FC<BookSessionButtonProps> = ({ 
  tutorId, 
  tutorName, 
  subjects,
  children = 'Book Session',
  ...buttonProps
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleBooking = (values: any) => {
    // In a real app, this would make an API call to save the booking
    console.log('Booking session with:', { tutorId, ...values });
    
    toast({
      title: 'Session Booked',
      description: `Your session with ${tutorName} has been scheduled.`,
    });
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        {...buttonProps}
      >
        {children}
      </Button>

      <BookingForm
        open={isOpen}
        onOpenChange={setIsOpen}
        tutor={{
          id: tutorId,
          name: tutorName,
          subjects: subjects,
        }}
        onSubmit={handleBooking}
      />
    </>
  );
};

export default BookSessionButton;