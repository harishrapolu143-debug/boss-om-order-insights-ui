import moment from "moment";

export const isDueDateExpired = (u_due_date: string) => {
  if (!u_due_date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(u_due_date);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
};

export const getPassedDays = (u_due_date?: string) => {
  if (u_due_date && isDueDateExpired(u_due_date)) {
    const dueDate = moment(u_due_date);
    const today = moment();
    return today.diff(dueDate, "days");
  }
  return 0;
};
