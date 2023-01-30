/* eslint-disable camelcase */
import { camelizeObject } from '@/utils/object'

describe('camelizeObject', () => {
  it('should camelize object keys', () => {
    const obj = {
      test_key: 2,
      camelKey: 4,
      some_other_bs_key: 'what?',
    }
    expect(camelizeObject(obj)).toMatchInlineSnapshot(`
      {
        "camelKey": 4,
        "someOtherBsKey": "what?",
        "testKey": 2,
      }
    `)
  })
})
