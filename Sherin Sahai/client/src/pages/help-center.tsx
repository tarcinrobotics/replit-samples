import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const HelpCenter = () => {
  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I schedule a session with a tutor?</AccordionTrigger>
                <AccordionContent>
                  To schedule a session, go to the "Find Tutors" page, browse available tutors, and click the "Book Session" button on the tutor's card. You'll be prompted to select a date, time, and subject for your session.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>How do I join a scheduled session?</AccordionTrigger>
                <AccordionContent>
                  You can join your scheduled sessions from the "My Sessions" page or directly from the Dashboard. Click the "Join Session" button when it's time for your session to begin. Make sure your camera and microphone are working properly.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Can I reschedule or cancel a session?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can reschedule or cancel a session up to 24 hours before the scheduled time. Go to the "My Sessions" page, find the session you want to modify, and click "Reschedule" or "Cancel." If it's within 24 hours, you may be charged a late cancellation fee.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>How do payments work?</AccordionTrigger>
                <AccordionContent>
                  Payments are processed securely through our platform. You can add your payment method in the "Settings" page. You'll only be charged after a session is completed, and you'll receive an email receipt for each payment.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>What if I have technical issues during a session?</AccordionTrigger>
                <AccordionContent>
                  If you experience technical issues during a session, try refreshing your browser first. If problems persist, you can use the in-session chat to communicate with your tutor. For continuing issues, contact our support team through the "Help" button in the bottom corner of the screen.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Support</h2>
            <p className="text-sm text-gray-600 mb-4">
              Need more help? Our support team is available Monday through Friday, 9am-5pm EST.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <a href="mailto:support@tutorconnect.com" className="text-primary-600 hover:underline">
                  support@tutorconnect.com
                </a>
              </div>
              
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="text-gray-700">
                  (123) 456-7890
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default HelpCenter;
