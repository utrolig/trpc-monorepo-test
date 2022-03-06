const UnauthorizedMessage = "Unauthorized.";

export class UnauthorizedError extends Error {
  constructor() {
    super(UnauthorizedMessage);
  }
}

export const isUnauthorizedError = (val: unknown): val is UnauthorizedError => {
  const anyVal = val as any;
  if (anyVal?.message === UnauthorizedMessage) {
    return true;
  }

  return false;
};
