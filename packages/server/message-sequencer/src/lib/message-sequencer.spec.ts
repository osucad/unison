import { messageSequencer } from './message-sequencer.js';

describe('messageSequencer', () => {
  it('should work', () => {
    expect(messageSequencer()).toEqual('message-sequencer');
  })
})
