export type Instrument = { id: number; name: string };

export async function getInstruments(): Promise<Instrument[]> {
  return [{ id: 1, name: "Guitar" }, { id: 2, name: "Piano" }];
}
