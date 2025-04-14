import { unisonClient } from './UnisonClient.js';

describe('client', () => {
  it('should work', () => {
    expect(unisonClient()).toEqual('client');
  })
})
