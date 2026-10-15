/** US states plus DC, for the address form's state picker. Only Oregon has ballot data so far. */
export const usStates = [
  ["AL", "Alabama"],
  ["AK", "Alaska"],
  ["AZ", "Arizona"],
  ["AR", "Arkansas"],
  ["CA", "California"],
  ["CO", "Colorado"],
  ["CT", "Connecticut"],
  ["DE", "Delaware"],
  ["DC", "District of Columbia"],
  ["FL", "Florida"],
  ["GA", "Georgia"],
  ["HI", "Hawaii"],
  ["ID", "Idaho"],
  ["IL", "Illinois"],
  ["IN", "Indiana"],
  ["IA", "Iowa"],
  ["KS", "Kansas"],
  ["KY", "Kentucky"],
  ["LA", "Louisiana"],
  ["ME", "Maine"],
  ["MD", "Maryland"],
  ["MA", "Massachusetts"],
  ["MI", "Michigan"],
  ["MN", "Minnesota"],
  ["MS", "Mississippi"],
  ["MO", "Missouri"],
  ["MT", "Montana"],
  ["NE", "Nebraska"],
  ["NV", "Nevada"],
  ["NH", "New Hampshire"],
  ["NJ", "New Jersey"],
  ["NM", "New Mexico"],
  ["NY", "New York"],
  ["NC", "North Carolina"],
  ["ND", "North Dakota"],
  ["OH", "Ohio"],
  ["OK", "Oklahoma"],
  ["OR", "Oregon"],
  ["PA", "Pennsylvania"],
  ["RI", "Rhode Island"],
  ["SC", "South Carolina"],
  ["SD", "South Dakota"],
  ["TN", "Tennessee"],
  ["TX", "Texas"],
  ["UT", "Utah"],
  ["VT", "Vermont"],
  ["VA", "Virginia"],
  ["WA", "Washington"],
  ["WV", "West Virginia"],
  ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
] as const;

export type StateCode = (typeof usStates)[number][0];

/** States we have races and measures for. */
export const coveredStates: readonly StateCode[] = ["OR"];

export const defaultState: StateCode = "OR";

export function isStateCode(value: unknown): value is StateCode {
  return typeof value === "string" && usStates.some(([code]) => code === value);
}

/**
 * The geocoder needs a city, state or ZIP. Adds the chosen state unless the address already ends with
 * it or with a ZIP code ("5055 N Greeley Ave" becomes "5055 N Greeley Ave, OR").
 */
export function withState(address: string, state: StateCode): string {
  const name = usStates.find(([code]) => code === state)?.[1] ?? state;
  const trimmed = address.trim().replace(/[\s,]+$/, "");
  const endsWithState = new RegExp(`\\b(${state}|${name})$`, "i").test(trimmed);
  const endsWithZip = /\b\d{5}(-\d{4})?$/.test(trimmed);
  return endsWithState || endsWithZip ? trimmed : `${trimmed}, ${state}`;
}
