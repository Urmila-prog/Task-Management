import React from 'react';
import { BsCalendarEvent } from "react-icons/bs";

const CalendarIntegration = ({ task }) => {
    const addToCalendar = () => {
        // Create calendar event data
        const event = {
            title: task.title,
            description: task.desc,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
        };

        // Create calendar URL
        const calendarUrl = new URL('https://calendar.google.com/calendar/render');
        calendarUrl.searchParams.append('action', 'TEMPLATE');
        calendarUrl.searchParams.append('text', event.title);
        calendarUrl.searchParams.append('details', event.description);
        calendarUrl.searchParams.append('dates', `${event.startTime}/${event.endTime}`);

        // Open Google Calendar in a new tab
        window.open(calendarUrl.toString(), '_blank');
    };

    return (
        <div className="mt-2">
            <button
                onClick={addToCalendar}
                className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                title="Add to Google Calendar"
            >
                <BsCalendarEvent className="text-lg" />
                <span>Add to Calendar</span>
            </button>
        </div>
    );
};

export default CalendarIntegration; 