export function formatIQD(amount: number): string {
  return `${new Intl.NumberFormat("en-US").format(amount)} دینار`
}
