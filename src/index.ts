import { ItensPendents } from './itensPendent';
import { loadNotes } from './loadNotes';
import { loadOrder } from './loadOrder';
(async () => {
  const orders = await loadOrder()
  const notes = await loadNotes({
    orders,
  })

  await ItensPendents({
    notes,
    orders,
  })
})()
