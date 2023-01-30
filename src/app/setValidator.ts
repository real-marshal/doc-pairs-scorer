import Ajv from 'ajv'
import type { AppFastifyInstance } from './app'

export default function setValidator(f: AppFastifyInstance) {
  const ajv = new Ajv({
    allErrors: false,
    coerceTypes: true,
    useDefaults: true,
    removeAdditional: 'all',
  })

  f.setValidatorCompiler(({ schema }) => {
    return ajv.compile(schema)
  })
}
