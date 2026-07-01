export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
}

export type ApiError = Error & {
  response?: {
    data: ApiErrorResponse;
  };
};
