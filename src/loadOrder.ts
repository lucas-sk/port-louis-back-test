import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { readContent } from './readContent'

export async function loadOrder() {
  const files = await readdir('./Pedidos')
  const filteredFiles = files.filter((file) => file.endsWith('.txt'))
  const allFilesText = filteredFiles.map((file) => path.join('./Pedidos', file))

  const allOrders: Orders[][] = await Promise.all(
    allFilesText.map(async (order) => {
      return await readContent(order)
    }),
  )

  const isAllOrderHaveCorrectType = allOrders.flat().every((order) => {
    return (
      typeof order.número_item === 'number' &&
      typeof order.código_produto === 'string' &&
      typeof order.quantidade_produto === 'number' &&
      typeof order.valor_unitário_produto === 'string'
    )
  })

  if (!isAllOrderHaveCorrectType) {
    throw new Error('Algum valor não corresponda ao tipo descrito')
  }

  const allOrdersIdUnique = allOrders.every((order) => {
    const ids = order.map((item) => item.número_item)

    const unicos = ids.filter((id, index) => ids.indexOf(id) === index)

    return ids.length === unicos.length
  })

  if (!allOrdersIdUnique) {
    throw new Error('Há repetição de algum número_item de um mesmo pedido')
  }

  const allOrdersIdConsecutive = allOrders.every((order) => {
    const ids = order.map((item) => item.número_item)

    const maxId = Math.max(...ids)

    const allIds = Array.from({ length: maxId }, (_, index) => index + 1)

    return ids.length === allIds.length
  })

  if (!allOrdersIdConsecutive) {
    throw new Error(
      'Falta algum número_item (deve haver todos os números consecutivos de 1 ao maior número de item daquele pedido)',
    )
  }

  return allOrders
}
