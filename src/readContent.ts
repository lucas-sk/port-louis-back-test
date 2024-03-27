import { readFile } from 'fs/promises'

export async function readContent(arquivo: string) {
  const conteudo = await readFile(arquivo, 'utf8')
  const linhas = conteudo.trim().split('\n')
  return linhas.map((linha) => JSON.parse(linha))
}
