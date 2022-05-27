export default interface Paginate<T> {
  total?: number;
  data?: T[];
};