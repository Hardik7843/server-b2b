export interface ProductFilters {
  page?: number;
  limit?: number;
  name?: string;
  tags?: string;
  description?: string;
  priceSort?: "DESC" | "ASC";
  dateSort?: "DESC" | "ASC";
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: string;
  dateTo?: string;
  active?: string;
}
