/**
 * Common Result Types for Use Cases
 *
 * Standard response types for all use cases
 */

export interface Success<T> {
  success: true;
  data: T;
}

export interface Failure {
  success: false;
  error: string;
  errors?: string[];
}

export type Result<T> = Success<T> | Failure;

/**
 * Helper functions to create results
 */
export const Result = {
  success: <T>(data: T): Success<T> => ({
    success: true,
    data
  }),

  failure: (error: string, errors?: string[]): Failure => ({
    success: false,
    error,
    errors
  })
};
