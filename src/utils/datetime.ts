import moment from 'moment';

export const formatDateTime = (dateTime: string) => {
  return moment(dateTime).format('YYYY-MM-DDTHH:mm:ss[Z]');
};
