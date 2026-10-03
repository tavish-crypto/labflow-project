import { findAllExceptions, ExceptionFilters } from "./exceptions.repository.js";

export async function getAllExceptions(filters?: ExceptionFilters) {
  return findAllExceptions(filters);
}
