import { type Markup, type MeasureContext, type WorkspaceId } from '@hcengineering/core'
import { type ContentTextAdapter } from '@hcengineering/server-core'
import { markupToText } from '@hcengineering/text'
import { Readable } from 'node:stream'
import { Buffer } from 'node:buffer'

/**
 * @public
 */
export async function createMarkupAdapter (
  _url: string,
  _workspace: WorkspaceId,
  _metrics: MeasureContext
): Promise<ContentTextAdapter> {
  return {
    content: async (_name: string, _type: string, data: Readable | Buffer | string): Promise<string> => {
      try {
        const markup = await readMarkup(data)
        return markupToText(markup)
      } catch (err) {
        console.warn('failed to read markup:', err)
        return ''
      }
    },
    metrics (): MeasureContext {
      return _metrics
    }
  }
}

async function readMarkup (data: Readable | Buffer | string): Promise<Markup> {
  if (data instanceof Readable) {
    const chunks: any[] = []

    return await new Promise((resolve, reject) => {
      data.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk))
      })
      data.on('error', (err) => {
        reject(err)
      })
      data.on('end', () => {
        const markup = Buffer.concat(chunks).toString('utf-8')
        resolve(markup)
      })
    })
  } else if (data instanceof Buffer) {
    return data.toString('utf-8')
  } else {
    return data
  }
}
