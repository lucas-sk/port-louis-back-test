import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { readContent } from './readContent'

export async function loadNotes({ orders }: { orders: Orders[][] }) {
  const files = await readdir('./Notas')
  const filteredFilesTxt = files.filter((file) => file.endsWith('.txt'))
  const allFilesText = filteredFilesTxt.map((file) =>
    path.join('./Notas', file),
  )

  const allNotes: Notes[][] = await Promise.all(
    allFilesText.map(async (order) => {
      return await readContent(order)
    }),
  )

  const allNotesFlat = allNotes.flat()
  const allNotesHaveCorrectType = allNotesFlat.every((note) => {
    return (
      typeof note.id_pedido === 'number' &&
      typeof note.número_item === 'number' &&
      typeof note.quantidade_produto === 'number'
    )
  })

  if (!allNotesHaveCorrectType) {
    throw new Error('Algum valor não corresponde ao tipo descrito')
  }

  const isHaveAllOrders = allNotesFlat.every((note) => {
    return orders.some((order, index) => {
      const id = index + 1
      return order.some((item) => {
        return item.número_item === note.número_item && id === note.id_pedido
      })
    })
  })

  if (!isHaveAllOrders) {
    throw new Error('Algum par de id_pedido e número_item não existe no pedido')
  }

  const isTheSumLessThanTheOrderTotal = orders.every((order, index) => {
    const notes = allNotesFlat.filter((note) => note.id_pedido === index + 1)

    return order.every((item) => {
      const amoutProduct = notes.reduce((acc, note) => {
        if (note.número_item === item.número_item) {
          acc += note.quantidade_produto
        }
        return acc
      }, 0)

      return amoutProduct <= item.quantidade_produto
    })
  })

  if (!isTheSumLessThanTheOrderTotal) {
    throw new Error(
      'A soma das quantidades informadas para um item ultrapassar a quantidade do item do pedido.',
    )
  }

  return allNotes
}
