import { camelCase } from 'lodash'

export const camelizeObject = (obj: Record<string, unknown>) =>
  Object.entries(obj).reduce<Record<string, unknown>>((result, [key, value]) => {
    result[camelCase(key)] = value

    return result
  }, {})
