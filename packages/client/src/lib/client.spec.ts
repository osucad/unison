import { unisonClient } from './client/UnisonClient.js';

describe('client', () => {
  it('should work', () => {
    expect(unisonClient()).toEqual('client');
  })
})
