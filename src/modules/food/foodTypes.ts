// Built-in food types. `cuisineTag` is the search term matched against
// OpenStreetMap's `cuisine` tag when looking up nearby places (see
// nearbyPlaces.ts) - it does not need to be exact, just a reasonable
// substring most places of that type would be tagged with.
export interface FoodType {
  id: string
  label: string
  cuisineTag: string
}

export const defaultFoodTypes: FoodType[] = [
  { id: 'sushi', label: 'Sushi', cuisineTag: 'sushi' },
  { id: 'pasta', label: 'Pates', cuisineTag: 'italian' },
  { id: 'pizza', label: 'Pizza', cuisineTag: 'pizza' },
  { id: 'burger', label: 'Burger', cuisineTag: 'burger' },
  { id: 'chinese', label: 'Traiteur chinois', cuisineTag: 'chinese' },
  { id: 'mexican', label: 'Mexicain', cuisineTag: 'mexican' },
  { id: 'thai', label: 'Thai', cuisineTag: 'thai' },
  { id: 'indian', label: 'Indien', cuisineTag: 'indian' },
  { id: 'vietnamese', label: 'Vietnamien', cuisineTag: 'vietnamese' },
]
