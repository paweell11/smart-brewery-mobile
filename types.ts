export type ErrorType = {
  isError: boolean;
  type?: "basic" | "connection";
  message?: string;
}