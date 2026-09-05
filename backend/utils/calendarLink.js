const toGoogleDateTime = (date, time) => {
  const compactDate = date.replaceAll("-", "");
  const compactTime = time.replace(":", "");

  return `${compactDate}T${compactTime}00`;
};

export const buildCustomerCalendarUrl = ({ business, service, booking }) => {
  const businessName = business.businessName || business.name;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${service.name} with ${businessName}`,
    dates: `${toGoogleDateTime(
      booking.date,
      booking.startTime,
    )}/${toGoogleDateTime(booking.date, booking.endTime)}`,
    details: booking.notes || `Booking with ${businessName}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
