export interface GoogleDistanceOptions {
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit',
  language?: string,
  avoid?: 'tolls' | 'highways' | 'ferries' | 'indoor',
  units?: 'metric' | 'imperial',
  departure_time?: number,
  arrival_time?: number,
  traffic_model?: 'best_guess' | 'pessimistic' | 'optimistic',
}

export interface GoogleDistanceResult {
  "distance": {
    "text": string,
    "value": number
  },
  "duration": {
    "text": string,
    "value": number
  },
  "status": string

}

export interface GoogleDirectionsResult {
  "distance"?: {
    "text": string,
    "value": number
  },
  "duration"?: {
    "text": string,
    "value": number
  },
  startAddress?: string,
  endAddress?: string,
  polylines?:string[]

}
