import { writeFile } from 'fs/promises'

interface ItensPendentsI {
  número_item: number
  saldo_quantidade: number
}

interface OrdersPendentsI {
  valor_total_pedido: number
  saldo_valor: number
  items: ItensPendentsI[]
}

export async function ItensPendents({
  orders,
  notes,
}: {
  orders: Orders[][]
  notes: Notes[][]
}) {
  const ordersPendents: Record<number, OrdersPendentsI> = {}
  const notesFlat = notes.flat()

  orders.forEach((order, index) => {
    const idPedido = index + 1

    const notes = notesFlat.filter((note) => note.id_pedido === idPedido)

    const orderPendent = order.filter((orderItem) => {
      const notesWithSameOrderId = notes.filter(
        (note) => note.número_item === orderItem.número_item,
      )

      if (notesWithSameOrderId.length > 0) {
        const amoutProduct = notesWithSameOrderId.reduce((acc, item) => {
          return acc + item.quantidade_produto
        }, 0)

        const saldo_quantidade = orderItem.quantidade_produto - amoutProduct

        return saldo_quantidade > 0
      } else {
        return true
      }
    })

    if (orderPendent.length > 0) {
      const valor_total_pedido = order.reduce((acc, item) => {
        const valorUnit = parseFloat(
          item.valor_unitário_produto.replace(',', '.'),
        )
        return acc + valorUnit * item.quantidade_produto
      }, 0)

      const saldo_valor = orderPendent.reduce((acc, item) => {
        const valorUnit = parseFloat(
          order
            .find((o) => o.número_item === item.número_item)
            .valor_unitário_produto.replace(',', '.'),
        )
        return acc + valorUnit * item.quantidade_produto
      }, 0)

      ordersPendents[idPedido] = {
        valor_total_pedido,
        saldo_valor,
        items: orderPendent.map((item) => {
          return {
            número_item: item.número_item,
            saldo_quantidade: item.quantidade_produto,
          }
        }),
      }
    }
  })

  Object.entries(ordersPendents).forEach(async ([key, value]) => {
    const orderInJson = JSON.stringify(value, null, 2)
    await writeFile(`./PedidosPendentes/P${key}.txt`, orderInJson)
  })
}
