declare module "sql-limiter" {
  type Strategy = "limit" | "first" | "fetch" | "top";
  export function limit(
    sql: string,
    strategies: Strategy[],
    limitNumber: number,
  ): string;
}
