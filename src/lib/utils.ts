const now = new Date();
now.setHours(0, 0, 0, 0);

// only using one date in the extremely rare case that this runs at midnight
export const getNow = () => {
  return now.getTime();
};

export const getDate = (dateString: string) => {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};
