/**
 * calendar data by month
 * @param {string} YYYYMM YYYY-MM
 * @returns {int[]} dates group by weeks(7)
 */
export function getCalendarData(date) {
  date = date.clone()
  const daysInMonth = date.daysInMonth();
  const firstDayOfWeek = date.startOf('month').day();
  const calendarData = [];
  const formater = 'YYYY-MM-DD'
  let week = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    const day = date.clone().subtract(firstDayOfWeek - i, 'days').format(formater);
    week.push(day);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    week.push( date.set('date', i).format(formater) );
    if (week.length === 7) {
      calendarData.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    const daysToAdd = 7 - week.length;
    for (let i = 1; i <= daysToAdd; i++) {
      week.push(date.clone().add(1, 'month').set('date', i).format(formater));
    }
    calendarData.push(week);
  }
  return calendarData;
}

export const weeks = [ 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT' ]